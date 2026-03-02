import { Component, effect, inject, input, OnChanges, OnDestroy, viewChild } from '@angular/core';
import { ChatHeaderComponent } from './chat-header-component/chat-header-component';
import { ChatMessagesComponent } from './chat-messages-component/chat-messages-component';
import { ChatInputComponent } from './chat-input-component/chat-input-component';
import { MessageStoreService } from '../../../core/services/message-store-service';
import { ButtonModule } from 'primeng/button';
import { ChatUiStateService } from '../../../core/services/chat-ui-state-service';
import { ChatHubService } from '../../../core/services/chat-hub-service';

@Component({
  selector: 'app-chats-main-component',
  imports: [ChatHeaderComponent, ChatMessagesComponent, ChatInputComponent, ButtonModule],
  templateUrl: './chats-main-component.html',
  styleUrl: './chats-main-component.css',
})
export class ChatsMainComponent implements OnDestroy, OnChanges {
  private readonly _chatHubService = inject(ChatHubService);
  private readonly _chatUiStateService = inject(ChatUiStateService);
  private readonly _messageStoreService = inject(MessageStoreService);

  constructor() {
    effect(() => {
      const chatId = this.chatId();

      this._messageStoreService.setActiveChat(chatId);
      this._markChatAsRead();
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

  private _markChatAsRead(): void {
    this._chatHubService.markChatAsRead(this.chatId());
  }
}
