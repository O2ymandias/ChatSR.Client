import { FormsModule } from '@angular/forms';
import {
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
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
import { ChatsService } from '../../../core/services/chats-service';

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
export class ChatsMainComponent implements OnInit {
  private readonly _authService = inject(AuthService);
  private readonly _messageService = inject(MessageService);
  private readonly _chatService = inject(ChatsService);
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _destroyRef = inject(DestroyRef);

  currentUserId = computed(
    () =>
      this._authService.userInfo()?.[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ],
  );

  chatId = input.required<string>();

  messages = signal<MessageResponse[]>([]);

  searchMessagesVisible = signal(false);

  searchQuery = signal('');

  clearSearch() {
    this.searchQuery.set('');
  }

  ngOnInit(): void {
    this._initializeMessages();
  }

  private _initializeMessages(): void {
    if (!isPlatformBrowser(this._platformId)) return;

    this._messageService
      .getChatMessages$(this.chatId(), {
        page: 1,
        pageSize: 10,
      })
      .pipe(
        tap((res) => this.messages.set(res.items)),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe();
  }
}
