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
import { EMPTY, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageStoreService } from '../../../../core/services/message-store-service';
import { ButtonModule } from 'primeng/button';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { QueryParams } from '../../../../shared/models/shared.model';
import { ChatUiStateService } from '../../../../core/services/chat-ui-state-service';
import { MessageResponse, MessageType } from '../../../../shared/models/message.model';
import { ContextMenu } from 'primeng/contextmenu';
import { MenuItem } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
import { Avatar } from 'primeng/avatar';

@Component({
  selector: 'app-chat-messages-component',
  imports: [DatePipe, ButtonModule, InfiniteScrollDirective, ContextMenu, RippleModule, Avatar],
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

  private readonly _jumpingToMessage = signal(false);

  readonly defaultPage = this._messageService.DEFAULT_PAGE;
  readonly defaultPageSize = this._messageService.DEFAULT_PAGE_SIZE;

  chatId = input.required<string>();

  page = signal(this.defaultPage);
  bottomPage = signal(this.defaultPage);
  loadedAllHistory = signal(false);
  loadedAllFuture = signal(true);

  messagesByChatMap = this._messageStoreService.messagesByChat;

  messages = computed(
    () =>
      this.messagesByChatMap()
        .get(this.chatId())
        ?.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()) ?? [],
  );

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
      this.bottomPage.set(this.defaultPage);
      this.loadedAllFuture.set(true);
      this.loadedAllHistory.set(false);
      this._previousMessagesLength = 0;

      this._loadMessages(chatId, searchTerm);
    });

    // Effect 2: Scroll handling
    effect(() => {
      const messages = this.messages();
      const currentLength = messages.length;

      const container = this.messagesContainer()?.nativeElement;
      if (!container) return;

      if (this._jumpingToMessage()) {
        this._previousMessagesLength = currentLength;
        return;
      }

      // Case 1: Initial load -> scroll to bottom instantly.
      if (this._previousMessagesLength === 0 && currentLength > 0) {
        this.scrollToBottom('instant');
        this._previousMessagesLength = currentLength;
        return;
      }

      // Case 2: New message arrived or pagination -> scroll to bottom only if near bottom.
      if (currentLength > this._previousMessagesLength) {
        const isNearBottom =
          container.scrollHeight - container.scrollTop - container.clientHeight < 100;

        // To avoid scrolling to bottom when scrolling up
        if (isNearBottom) {
          this.scrollToBottom('smooth');
        }
      }

      this._previousMessagesLength = currentLength;
    });
  }

  scrollToBottom(behavior: ScrollBehavior): void {
    const container = this.messagesContainer()?.nativeElement;
    if (!container) return;

    setTimeout(
      () => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: behavior,
        });
      },
      behavior === 'smooth' ? 50 : 0,
    );
  }

  scrollToLatest(): void {
    // If we already have all future messages loaded, just scroll down
    if (this.loadedAllFuture()) {
      this.scrollToBottom('smooth');
      return;
    }

    // Otherwise, reset and fetch the first (latest) page fresh
    this.page.set(this.defaultPage);
    this.bottomPage.set(this.defaultPage);
    this.loadedAllFuture.set(true);
    this.loadedAllHistory.set(false);
    this._previousMessagesLength = 0;

    this._messageService
      .getChatMessages$(this.chatId(), {
        page: this.defaultPage,
        pageSize: this.defaultPageSize,
        searchTerm: this._chatUiState.searchTerm(),
      })
      .pipe(
        tap((res) => {
          if (!res.isSuccess) return;
          this._messageStoreService.setMessagesForChat(this.chatId(), res.items);

          if (!res.pagination.hasNext) {
            this.loadedAllHistory.set(true);
          }
        }),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe();
  }

  onScrolledUp(): void {
    if (this.loadedAllHistory()) return;

    this.page.update((p) => p + 1);

    this._loadMoreMessages(this.chatId(), {
      page: this.page(),
      pageSize: this.defaultPageSize,
      searchTerm: this._chatUiState.searchTerm(),
    });
  }

  onScrolledDown(): void {
    if (this.loadedAllFuture()) return;

    this.bottomPage.update((p) => p - 1);

    if (this.bottomPage() < this.defaultPage) {
      this.loadedAllFuture.set(true);
      return;
    }

    this._loadMoreMessagesDown(this.chatId(), {
      page: this.bottomPage(),
      pageSize: this.defaultPageSize,
      searchTerm: this._chatUiState.searchTerm(),
    });
  }

  onScroll(event: Event): void {
    const container = event.target as HTMLDivElement;
    this.isNearBottom.set(
      container.scrollHeight - container.scrollTop - container.clientHeight < 1500,
    );
  }

  scrollToMessage(messageId: string): void {
    const alreadyLoaded = this.messages().some((m) => m.messageId === messageId);
    if (alreadyLoaded) {
      setTimeout(() => this._scrollToMessage(messageId, 'instant'));
      return;
    }

    this._jumpingToMessage.set(true);

    this._messageService
      .getMessagePage$(this.chatId(), messageId)
      .pipe(
        switchMap((res) => {
          const page = res.data;
          if (!page) return EMPTY;

          this.page.set(page);
          this.bottomPage.set(page);
          this.loadedAllFuture.set(false);

          return this._messageService.getChatMessages$(this.chatId(), {
            page,
            pageSize: this.defaultPageSize,
            searchTerm: null,
          });
        }),
        tap((res) => {
          if (!res.isSuccess) return;

          this._messageStoreService.setMessagesForChat(this.chatId(), res.items);
          setTimeout(() => {
            this._scrollToMessage(messageId, 'instant');
            this._jumpingToMessage.set(false);
          });
        }),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe();
  }

  private _scrollToMessage(messageId: string, behavior: ScrollBehavior): void {
    const container = this.messagesContainer().nativeElement as HTMLElement;
    const target = container.querySelector(`[data-message-id="${messageId}"]`) as HTMLElement;

    if (!target) return;

    const containerTop = container.getBoundingClientRect().top;
    const targetTop = target.getBoundingClientRect().top;
    const offset =
      targetTop -
      containerTop +
      container.scrollTop -
      container.clientHeight / 2 +
      target.offsetHeight / 2;

    container.scrollTo({ top: offset, behavior });
    this._highlightMessage(target);
  }

  private _highlightMessage(target: HTMLElement): void {
    target.classList.add(
      'bg-cyan-100',
      'dark:bg-cyan-900/30',
      'transition-colors',
      'duration-1000',
    );
    setTimeout(() => {
      target.classList.remove('bg-cyan-100', 'dark:bg-cyan-900/30');
    }, 2000);
  }

  ////////////////////////////////////////////////////////////////////////////
  // Context menu
  ////////////////////////////////////////////////////////////////////////////

  contextMenu = viewChild.required<ContextMenu>('contextMenu');
  selectedMessage = signal<MessageResponse | null>(null);
  selectedMessageType = signal<MessageType | null>(null);
  isAdmin = signal(false);

  items = computed<MenuItem[]>(() => {
    const isOutgoing = this.selectedMessageType() === 'outgoing';
    const canDelete = isOutgoing || this.isAdmin();
    const selectedMessage = this.selectedMessage();

    if (!selectedMessage) return [];

    return [
      {
        id: 'reply',
        label: 'Reply',
        icon: 'pi pi-reply',
        command: () => {
          this._chatUiState.startReplying(selectedMessage);
        },
      },
      { id: 'copy', label: 'Copy', icon: 'pi pi-copy' },
      { id: 'forward', label: 'Forward', icon: 'pi pi-share-alt' },

      ...(isOutgoing
        ? [
            {
              id: 'edit',
              label: 'Edit',
              icon: 'pi pi-pencil',
              command: () => {
                if (selectedMessage) this._chatUiState.startEditing(selectedMessage);
              },
            },
          ]
        : []),

      ...(canDelete
        ? [
            {
              id: 'remove',
              label: 'Delete',
              icon: 'pi pi-trash',
              command: () => {
                console.log('DELETE');
              },
            },
          ]
        : []),

      ...(selectedMessage.isEdited && selectedMessage.editedAt
        ? [{ separator: true }, { id: 'info' }]
        : []),
    ];
  });

  onContextMenu(event: PointerEvent, message: MessageResponse, messageType: MessageType): void {
    event.preventDefault();
    this.selectedMessage.set(message);
    this.selectedMessageType.set(messageType);
    this.contextMenu().target = event.target as HTMLElement;
    this.contextMenu().show(event);
  }

  onHideContextMenu(): void {
    this.selectedMessage.set(null);
    this.selectedMessageType.set(null);
  }

  ////////////////////////////////////////////////////////////////////////////
  // Private methods
  ////////////////////////////////////////////////////////////////////////////

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

  private _loadMoreMessagesDown(chatId: string, queryParams: QueryParams): void {
    if (!isPlatformBrowser(this._platformId)) return;

    this._messageService
      .getChatMessages$(chatId, queryParams)
      .pipe(
        tap((res) => {
          if (!res.isSuccess) return;
          this._messageStoreService.appendMessagesForChat(chatId, res.items);

          if (!res.pagination.hasNext) {
            this.loadedAllFuture.set(true);
          }
        }),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe();
  }
}
