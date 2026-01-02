import { FormsModule } from '@angular/forms';
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
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from '../../../core/services/message-service';
import { tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../../core/services/auth-service';
import { MessageResponse } from '../../../shared/models/message.model';
import { PaginationParams } from '../../../shared/models/shared.model';
import { ChatResponse } from '../../../shared/models/chats.model';
import { ChatsService } from '../../../core/services/chats-service';
import { environment } from '../../../environment';

@Component({
  selector: 'app-chats-main-component',
  imports: [
    ButtonModule,
    InputTextModule,
    FormsModule,
    ScrollPanelModule,
    TextareaModule,
    DatePipe,
  ],
  templateUrl: './chats-main-component.html',
  styleUrl: './chats-main-component.css',
})
export class ChatsMainComponent {
  private readonly _authService = inject(AuthService);
  private readonly _messageService = inject(MessageService);
  private readonly _chatService = inject(ChatsService);
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      const chatId = this.chatId();
      const pagination = { page: 1, pageSize: 10 };

      this._initializeChat(chatId);
      this._initializeMessages(chatId, pagination);
    });
  }

  currentUserId = computed(
    () =>
      this._authService.userInfo()?.[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ],
  );

  serverUrl = environment.serverUrl;

  chatId = input.required<string>();

  chat = signal<ChatResponse | null>(null);

  messages = signal<MessageResponse[]>([]);

  searchMessagesVisible = signal(false);

  searchQuery = signal('');

  clearSearch() {
    this.searchQuery.set('');
  }

  private _initializeMessages(chatId: string, pagination: PaginationParams): void {
    if (!isPlatformBrowser(this._platformId)) return;

    this._messageService
      .getChatMessages$(chatId, pagination)
      .pipe(
        tap((res) => this.messages.set(res.items)),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe();
  }

  private _initializeChat(chatId: string): void {
    if (!isPlatformBrowser(this._platformId)) return;

    this._chatService
      .getChatById$(chatId)
      .pipe(
        tap((res) => this.chat.set(res.data)),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe();
  }
}
