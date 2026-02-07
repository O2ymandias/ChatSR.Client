import { Component, input } from '@angular/core';
import { ChatHeaderComponent } from './chat-header-component/chat-header-component';
import { ChatMessagesComponent } from './chat-messages-component/chat-messages-component';
import { ChatInputComponent } from './chat-input-component/chat-input-component';

@Component({
  selector: 'app-chats-main-component',
  imports: [ChatHeaderComponent, ChatMessagesComponent, ChatInputComponent],
  templateUrl: './chats-main-component.html',
  styleUrl: './chats-main-component.css',
})
export class ChatsMainComponent {
  chatId = input.required<string>();
}
