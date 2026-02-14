import { Component, inject, input, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ChatHubService } from '../../../../core/services/chat-hub-service';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-input-component',
  imports: [ButtonModule, TextareaModule, FormsModule],
  templateUrl: './chat-input-component.html',
  styleUrl: './chat-input-component.css',
})
export class ChatInputComponent {
  private readonly _chatHubService = inject(ChatHubService);

  chatId = input.required<string>();
  messageContent = signal('');

  get invalid() {
    const content = this.messageContent().trim();
    return content.length > 2000;
  }

  onTyping() {
    this._chatHubService.notifyTyping(this.chatId());
  }

  sendMessage() {
    const content = this.messageContent().trim();
    if (content.length === 0 || content.length > 2000) return;
    this._chatHubService.sendMessage(this.chatId(), { content }).then(() => {
      this.messageContent.set('');
      this._chatHubService.stopTyping(this.chatId());
    });
  }
}
