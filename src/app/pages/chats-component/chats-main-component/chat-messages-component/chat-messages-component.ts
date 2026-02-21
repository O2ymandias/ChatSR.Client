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
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _destroyRef = inject(DestroyRef);

  private _previousMessagesLength = 0;

  constructor() {
    // Effect 1: Reset & Load when chat changes
    effect(() => {
      const chatId = this.chatId();

      this.page.set(this.defaultPage);
      this.loadedAllHistory.set(false);
      this._previousMessagesLength = 0;

      this._loadInitialMessages(chatId);
    });

    // Effect 2: Load more when scrolling up
    effect(() => {
      const page = this.page();
      const chatId = this.chatId();

      if (page > 1) {
        this._loadMoreMessages(chatId, {
          page,
          pageSize: this.defaultPageSize,
          searchTerm: this.searchTerm(),
        });
      }
    });

    // Effect 3: scroll handling
    effect(() => {
      const messages = this.messages();
      const currentLength = messages.length;

      const container = this.messagesContainer()?.nativeElement;
      if (!container) return;

      // Initial load -> instant scroll
      if (this._previousMessagesLength === 0 && currentLength > 0) {
        setTimeout(() => {
          container.scrollTop = container.scrollHeight;
        });
        this._previousMessagesLength = currentLength;
        return;
      }

      // New message appended -> smooth scroll
      if (currentLength > this._previousMessagesLength) {
        const isNearBottom =
          container.scrollHeight - container.scrollTop - container.clientHeight < 100;

        if (isNearBottom) {
          setTimeout(() => {
            container.scrollTo({
              top: container.scrollHeight,
              behavior: 'smooth',
            });
          }, 50);
        }
      }

      this._previousMessagesLength = currentLength;
    });

    effect(() => {
      this.resetPagination();
      this.page.set(this.defaultPage);
      this.loadedAllHistory.set(false);
      this._previousMessagesLength = 0;
    });
  }
  resetPagination = this._messageService.resetPagination;

  defaultPage = this._messageService.DEFAULT_PAGE;
  defaultPageSize = this._messageService.DEFAULT_PAGE_SIZE;
  searchTerm = this._messageService.searchTerm;

  page = signal(this.defaultPage);

  chatId = input.required<string>();

  messagesByChatMap = this._messageStoreService.messagesByChat;

  messages = computed(() => {
    const chatId = this.chatId();
    return this.messagesByChatMap().get(chatId) ?? [];
  });

  currentUserId = computed(
    () =>
      this._authService.userInfo()?.[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ],
  );

  messagesContainer = viewChild.required<ElementRef<HTMLDivElement>>('messagesContainer');

  loadedAllHistory = signal(false);

  onScrolledUp(): void {
    this.page.update((old) => old + 1);
  }

  private _loadInitialMessages(chatId: string): void {
    if (!isPlatformBrowser(this._platformId)) return;

    this._messageService
      .getChatMessages$(chatId, {
        page: this.defaultPage,
        pageSize: this.defaultPageSize,
        searchTerm: null,
      })
      .pipe(
        tap((res) => {
          if (!res.isSuccess) return;
          this._messageStoreService.setMessagesForChat(chatId, res.items);
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
