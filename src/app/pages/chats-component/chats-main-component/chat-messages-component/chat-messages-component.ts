import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { MessageResponse } from '../../../../shared/models/message.model';
import { AuthService } from '../../../../core/services/auth-service';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { PaginationParams } from '../../../../shared/models/shared.model';
import { MessageService } from '../../../../core/services/message-service';
import { tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-chat-messages-component',
  imports: [ScrollPanelModule, DatePipe],
  templateUrl: './chat-messages-component.html',
  styleUrl: './chat-messages-component.css',
})
export class ChatMessagesComponent {
  private readonly _authService = inject(AuthService);
  private readonly _messageService = inject(MessageService);
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      const chatId = this.chatId();
      const pagination = { page: 1, pageSize: 10 };

      this._initializeMessages(chatId, pagination);
    });
  }

  chatId = input.required<string>();

  messages = signal<MessageResponse[]>([]);

  currentUserId = computed(
    () =>
      this._authService.userInfo()?.[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ],
  );

  private _initializeMessages(chatId: string, pagination: PaginationParams): void {
    if (!isPlatformBrowser(this._platformId)) return;

    this._messageService
      .getChatMessages$(chatId, pagination)
      .pipe(
        tap((res) =>
          this.messages.set(
            res.items.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()),
          ),
        ),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe();
  }
}
