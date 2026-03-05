import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ChatHubService } from '../../../../core/services/chat-hub-service';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { ChatUiStateService } from '../../../../core/services/chat-ui-state-service';

@Component({
  selector: 'app-chat-input-component',
  imports: [ButtonModule, TextareaModule, FormsModule, MessageModule],
  templateUrl: './chat-input-component.html',
  styleUrl: './chat-input-component.css',
})
export class ChatInputComponent {
  private readonly _chatUiState = inject(ChatUiStateService);
  private readonly _chatHubService = inject(ChatHubService);

  constructor() {
    effect(() => {
      const isEditing = this.isEditing();
      if (isEditing) {
        this.messageContent.set(this.editingMessage()?.content ?? '');
      }
    });
  }

  MAX_MESSAGE_LENGTH = 2000;

  chatId = input.required<string>();
  messageContent = signal('');

  invalid = computed(() => {
    const content = this.messageContent()?.trim() ?? '';
    return content.length > this.MAX_MESSAGE_LENGTH || content.length === 0;
  });

  charCount = computed(() => this.messageContent().length);
  charsRemaining = computed(() => this.MAX_MESSAGE_LENGTH - this.charCount());
  showCharCount = computed(() => this.charsRemaining() < this.MAX_MESSAGE_LENGTH * 0.2);

  editingMessage = this._chatUiState.editingMessage;
  isEditing = this._chatUiState.isEditing;

  onTyping() {
    this._chatHubService.notifyTyping(this.chatId());
  }

  async sendMessageAsync() {
    const content = this.messageContent().trim();
    if (content.length === 0 || content.length > 2000) return;

    await this._chatHubService.sendMessage(this.chatId(), { content });

    this.messageContent.set('');
    this._chatHubService.stopTyping(this.chatId());
  }

  async confirmEdit() {
    const editingMessage = this.editingMessage();
    if (!editingMessage) return;

    const newContent = this.messageContent().trim();
    if (newContent.length === 0 || newContent.length > 2000) return;

    await this._chatHubService.editMessage(editingMessage.messageId, { newContent });

    this._chatUiState.stopEditing();
    this.messageContent.set('');
    this._chatHubService.stopTyping(this.chatId());
  }
  cancelEdit() {
    this._chatUiState.stopEditing();
    this.messageContent.set('');
  }
}
