import {
  Component,
  inject,
  input,
  computed,
  signal,
  PLATFORM_ID,
  DestroyRef,
  effect,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ChatResponse } from '../../../../shared/models/chats.model';
import { environment } from '../../../../environment';
import { ChatHubService } from '../../../../core/services/chat-hub-service';
import { NavigationService } from '../../../../core/services/navigation-service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { ChatsService } from '../../../../core/services/chats-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-chat-header-component',
  imports: [ButtonModule, FormsModule, InputTextModule],
  templateUrl: './chat-header-component.html',
  styleUrl: './chat-header-component.css',
})
export class ChatHeaderComponent {
  private readonly _navigationService = inject(NavigationService);
  private readonly _chatService = inject(ChatsService);
  private readonly _chatHubService = inject(ChatHubService);
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _router = inject(Router);
  private readonly _destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      const chatId = this.chatId();
      this._initializeChat(chatId);
    });
  }

  chatId = input.required<string>();
  chat = signal<ChatResponse | null>(null);
  serverUrl = environment.serverUrl;
  typingUsers = this._chatHubService.typingUsers;

  searchQuery = signal('');
  searchMessagesVisible = signal(false);

  typingText = computed(() => {
    const count = this.typingUsers().length;

    if (count === 0) return '';
    if (count === 1) return 'typing';
    if (count === 2) return 'typing';
    return `${count} people typing`;
  });

  clearSearch() {
    this.searchQuery.set('');
  }

  goBack() {
    this._navigationService.showSidebarView();
    this._router.navigate(['/chats']);
  }

  private _initializeChat(chatId: string): void {
    if (!isPlatformBrowser(this._platformId)) return;

    this._chatService
      .getChatById$(chatId)
      .pipe(
        tap((res) => {
          if (res.isSuccess && res.data) this.chat.set(res.data);
        }),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe();
  }
}
