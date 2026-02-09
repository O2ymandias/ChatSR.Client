import { Component, inject, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ChatHubService } from '../../../../core/services/chat-hub-service';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-chat-input-component',
  imports: [ButtonModule, TextareaModule],
  templateUrl: './chat-input-component.html',
  styleUrl: './chat-input-component.css',
})
export class ChatInputComponent {
  private readonly _chatHubService = inject(ChatHubService);

  chatId = input.required<string>();

  onTyping() {
    this._chatHubService.notifyTyping(this.chatId());
  }
}
