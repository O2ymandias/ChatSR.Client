import {
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  PLATFORM_ID,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { AuthService } from '../../../../core/services/auth-service';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { MessageService } from '../../../../core/services/message-service';
import { tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageStoreService } from '../../../../core/services/message-store-service';
import { ButtonModule } from 'primeng/button';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { QueryParams } from '../../../../shared/models/shared.model';
import { ChatUiStateService } from '../../../../core/services/chat-ui-state-service';

@Component({
  selector: 'app-chat-messages-component',
  imports: [DatePipe, ButtonModule, InfiniteScrollDirective],
  templateUrl: './chat-messages-component.html',
  styleUrl: './chat-messages-component.css',
})
export class ChatMessagesComponent {
  private readonly _authService = inject(AuthService);
  private readonly _messageService = inject(MessageService);
  private readonly _messageStoreService = inject(MessageStoreService);
  private readonly _chatUiState = inject(ChatUiStateService);
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _destroyRef = inject(DestroyRef);

  private _previousMessagesLength = 0;

  readonly defaultPage = this._messageService.DEFAULT_PAGE;
  readonly defaultPageSize = this._messageService.DEFAULT_PAGE_SIZE;

  chatId = input.required<string>();

  page = signal(this.defaultPage);
  loadedAllHistory = signal(false);

  messagesByChatMap = this._messageStoreService.messagesByChat;

  messages = computed(() => this.messagesByChatMap().get(this.chatId()) ?? []);

  messagesWithSeparators = computed(() => {
    const messages = this.messages();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    return messages.map((message, index) => {
      const messageDate = new Date(message.sentAt);
      messageDate.setHours(0, 0, 0, 0);

      const prevMessage = messages[index - 1];
      const prevMessageDate = prevMessage ? new Date(prevMessage.sentAt) : null;
      if (prevMessageDate) prevMessageDate.setHours(0, 0, 0, 0);

      // Show separator if it's the first message or the date is different from the previous message
      const showDateSeparator = index === 0 || messageDate.getTime() !== prevMessageDate?.getTime();

      let separatorLabel = '';
      if (showDateSeparator) {
        if (messageDate.getTime() === today.getTime()) {
          separatorLabel = 'Today';
        } else if (messageDate.getTime() === yesterday.getTime()) {
          separatorLabel = 'Yesterday';
        } else {
          separatorLabel = messageDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            // Only show year if it's different from the current year
            year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
          });
        }
      }

      return { message, showDateSeparator, separatorLabel };
    });
  });

  currentUserId = computed(
    () =>
      this._authService.userInfo()?.[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ],
  );

  messagesContainer = viewChild.required<ElementRef<HTMLDivElement>>('messagesContainer');

  isNearBottom = signal(true);

  showScrollButton = computed(() => !this.isNearBottom());

  constructor() {
    // Effect 1: Load messages when chatId or searchTerm changes
    effect(() => {
      const chatId = this.chatId();
      const searchTerm = this._chatUiState.searchTerm();

      this.page.set(this.defaultPage);
      this.loadedAllHistory.set(false);
      this._previousMessagesLength = 0;

      this._loadMessages(chatId, searchTerm || null);
    });

    // Effect 2: Pagination
    effect(() => {
      const page = this.page();
      const chatId = untracked(() => this.chatId());
      const searchTerm = untracked(() => this._chatUiState.searchTerm());

      if (page > 1) {
        this._loadMoreMessages(chatId, {
          page,
          pageSize: this.defaultPageSize,
          searchTerm: searchTerm || null,
        });
      }
    });

    // Effect 3: Scroll handling
    effect(() => {
      const messages = this.messages();
      const currentLength = messages.length;
      const container = this.messagesContainer()?.nativeElement;
      if (!container) return;

      if (this._previousMessagesLength === 0 && currentLength > 0) {
        this.scrollToBottom();
        this._previousMessagesLength = currentLength;
        return;
      }

      if (currentLength > this._previousMessagesLength) {
        const isNearBottom =
          container.scrollHeight - container.scrollTop - container.clientHeight < 100;

        if (isNearBottom) {
          this.scrollToBottom(true);
        }
      }

      this._previousMessagesLength = currentLength;
    });
  }

  scrollToBottom(smooth = false): void {
    const container = this.messagesContainer()?.nativeElement;
    if (!container) return;

    setTimeout(
      () => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: smooth ? 'smooth' : 'instant',
        });
      },
      smooth ? 50 : 0,
    );
  }

  onScrolledUp(): void {
    this.page.update((p) => p + 1);
  }

  onScroll(event: Event): void {
    const container = event.target as HTMLDivElement;
    this.isNearBottom.set(
      container.scrollHeight - container.scrollTop - container.clientHeight < 1500,
    );
  }

  private _loadMessages(chatId: string, searchTerm: string | null): void {
    if (!isPlatformBrowser(this._platformId)) return;

    this._messageService
      .getChatMessages$(chatId, {
        page: this.defaultPage,
        pageSize: this.defaultPageSize,
        searchTerm,
      })
      .pipe(
        tap((res) => {
          if (!res.isSuccess) return;
          this._messageStoreService.setMessagesForChat(chatId, res.items);

          // If first page already has no next, mark history as fully loaded
          if (!res.pagination.hasNext) {
            this.loadedAllHistory.set(true);
          }
        }),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe();
  }

  private _loadMoreMessages(chatId: string, queryParams: QueryParams): void {
    if (!isPlatformBrowser(this._platformId)) return;
    if (this.loadedAllHistory()) return;

    this._messageService
      .getChatMessages$(chatId, queryParams)
      .pipe(
        tap((res) => {
          if (!res.isSuccess) return;

          this._messageStoreService.prependMessagesForChat(chatId, res.items);

          if (!res.pagination.hasNext) {
            this.loadedAllHistory.set(true);
          }
        }),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe();
  }
}
