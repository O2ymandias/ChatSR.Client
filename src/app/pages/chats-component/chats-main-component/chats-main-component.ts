import {
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  OnDestroy,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { ChatHeaderComponent } from './chat-header-component/chat-header-component';
import { ChatMessagesComponent } from './chat-messages-component/chat-messages-component';
import { ChatInputComponent } from './chat-input-component/chat-input-component';
import { MessageStoreService } from '../../../core/services/message-store-service';
import { ChatsService } from '../../../core/services/chats-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isPlatformBrowser } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-chats-main-component',
  imports: [ChatHeaderComponent, ChatMessagesComponent, ChatInputComponent, ButtonModule],
  templateUrl: './chats-main-component.html',
  styleUrl: './chats-main-component.css',
})
export class ChatsMainComponent implements OnDestroy {
  private readonly _chatsService = inject(ChatsService);
  private readonly _messageStoreService = inject(MessageStoreService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _platformId = inject(PLATFORM_ID);

  constructor() {
    effect(() => {
      this._markChatAsRead();
      this._messageStoreService.setActiveChat(this.chatId());
    });
  }
  ngOnDestroy(): void {
    this._messageStoreService.clearActiveChat();
  }

  chatId = input.required<string>();
  chatMessagesComponent = viewChild.required<ChatMessagesComponent>('chatMessagesComponent');

  showScrollButton = signal(false);

  scrollToBottom(): void {
    this.chatMessagesComponent().scrollToBottom(true);
  }

  private _markChatAsRead(): void {
    if (!isPlatformBrowser(this._platformId)) return;
    this._chatsService
      .markChatAsRead$(this.chatId())
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe();
  }
}
