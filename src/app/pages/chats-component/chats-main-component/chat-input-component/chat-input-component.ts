import { Component, inject, input, signal } from '@angular/core';
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
    this._messageService.sendMessage$(this.chatId(), content).subscribe();
  }

  autoGrow(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;

    const minHeight = 40 + 4; // rows=1 (40px) + py-2 (4px)
    const maxHeight = 192; // max-h-48 (192px)
    const scrollHeight = textarea.scrollHeight;

    // Start at minHeight to avoid shrinking to auto
    textarea.style.height = minHeight + 'px';

    // Grow up to scrollHeight but not beyond maxHeight
    const newHeight = Math.min(scrollHeight, maxHeight);
    textarea.style.height = newHeight + 'px';

    // Show scrollbar if content exceeds maxHeight
    textarea.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
  }
}
