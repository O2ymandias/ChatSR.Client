import {
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  PLATFORM_ID,
  viewChild,
} from '@angular/core';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { AuthService } from '../../../../core/services/auth-service';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { PaginationParams } from '../../../../shared/models/shared.model';
import { MessageService } from '../../../../core/services/message-service';
import { tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageStoreService } from '../../../../core/services/message-store-service';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
@Component({
  selector: 'app-chat-messages-component',
  imports: [ScrollPanelModule, DatePipe, ButtonModule, TooltipModule],
  templateUrl: './chat-messages-component.html',
  styleUrl: './chat-messages-component.css',
})
export class ChatMessagesComponent {
  private readonly _authService = inject(AuthService);
  private readonly _messageService = inject(MessageService);
  private readonly _messageStoreService = inject(MessageStoreService);
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      const chatId = this.chatId();
      const pagination = { page: 1, pageSize: 10 };

      this._initializeMessages(chatId, pagination);
    });

    effect(() => {
      const messagesCount = this.messages()().length;

      if (messagesCount > 0) {
        this.scrollToBottom();
      }
    });
  }

  chatId = input.required<string>();

  messages = computed(() => {
    const chatId = this.chatId();
    return this._messageStoreService.getMessagesForChat(chatId);
  });

  currentUserId = computed(
    () =>
      this._authService.userInfo()?.[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ],
  );

  messagesContainer = viewChild.required<ElementRef<HTMLDivElement>>('messagesContainer');

  scroll = output<boolean>();

  scrollToBottom(): void {
    if (!isPlatformBrowser(this._platformId)) return;

    // Use setTimeout to ensure DOM is updated
    setTimeout(() => {
      if (this.messagesContainer) {
        const container = this.messagesContainer().nativeElement;
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth',
        });
      }
    }, 100);
  }

  onScroll(): void {
    const element = this.messagesContainer().nativeElement;
    const threshold = 100;

    const isScrolledUp =
      element.scrollHeight - element.scrollTop - element.clientHeight > threshold;

    this.scroll.emit(isScrolledUp);
  }

  private _initializeMessages(chatId: string, pagination: PaginationParams): void {
    if (!isPlatformBrowser(this._platformId)) return;

    this._messageService
      .getChatMessages$(chatId, pagination)
      .pipe(
        tap((res) => {
          this._messageStoreService.setMessagesForChat(chatId, res.items);
        }),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe();
  }
}
