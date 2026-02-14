import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ChatHubService } from '../../../../core/services/chat-hub-service';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from '../../../../core/services/message-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-input-component',
  imports: [ButtonModule, TextareaModule, FormsModule],
  templateUrl: './chat-input-component.html',
  styleUrl: './chat-input-component.css',
})
export class ChatInputComponent {
  private readonly _chatHubService = inject(ChatHubService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _messageService = inject(MessageService);

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
    });
  }
}
