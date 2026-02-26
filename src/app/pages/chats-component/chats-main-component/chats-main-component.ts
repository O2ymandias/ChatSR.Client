import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  OnChanges,
  OnDestroy,
  PLATFORM_ID,
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
import { ChatUiStateService } from '../../../core/services/chat-ui-state-service';

@Component({
  selector: 'app-chats-main-component',
  imports: [ChatHeaderComponent, ChatMessagesComponent, ChatInputComponent, ButtonModule],
  templateUrl: './chats-main-component.html',
  styleUrl: './chats-main-component.css',
})
export class ChatsMainComponent implements OnDestroy, OnChanges {
  private readonly _chatsService = inject(ChatsService);
  private readonly _chatUiStateService = inject(ChatUiStateService);
  private readonly _messageStoreService = inject(MessageStoreService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _platformId = inject(PLATFORM_ID);

  constructor() {
    effect(() => {
      this._markChatAsRead();
      this._messageStoreService.setActiveChat(this.chatId());
    });
  }
  ngOnChanges(): void {
    this._chatUiStateService.clearSearch();
    this._chatUiStateService.hideSearch();
  }
  ngOnDestroy(): void {
    this._messageStoreService.clearActiveChat();
  }

  chatId = input.required<string>();
  chatMessagesComponent = viewChild.required<ChatMessagesComponent>('chatMessagesComponent');

  showScrollButton = computed(() => !this.chatMessagesComponent().isNearBottom());

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
