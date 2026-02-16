import { computed, Injectable, signal } from '@angular/core';
import { MessageResponse } from '../../shared/models/message.model';

@Injectable({
  providedIn: 'root',
})
export class MessageStoreService {
  private _messagesByChat = signal<Map<string, MessageResponse[]>>(new Map());
  private _unreadCounts = signal<Map<string, number>>(new Map());
  private _activeChatId = signal<string | null>(null);

  // Set messages for a specific chat (Messages come from api call)
  setMessagesForChat(chatId: string, messages: MessageResponse[]): void {
    this._messagesByChat.update((map) => {
      const newMap = new Map(map);
      const sortedMessages = messages.sort(
        (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
      );
      newMap.set(chatId, sortedMessages);
      return newMap;
    });
  }

  // Add a new message
  addMessage(message: MessageResponse): void {
    this._messagesByChat.update((map) => {
      const newMap = new Map(map);
      const chatMessages = newMap.get(message.chatId) ?? [];

      // Check for duplicates
      const exists = chatMessages.some((m) => m.messageId === message.messageId);
      if (exists) return map;

      // Add message and sort by time
      const updatedMessages = [...chatMessages, message].sort(
        (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
      );

      newMap.set(message.chatId, updatedMessages);
      return newMap;
    });

    // Update unread count if not the active chat
    if (this._activeChatId() !== message.chatId) {
      this._unreadCounts.update((counts) => {
        const newCounts = new Map(counts);
        const current = newCounts.get(message.chatId) ?? 0;
        newCounts.set(message.chatId, current + 1);
        return newCounts;
      });
    }
  }

  // Get messages for a specific chat
  getMessagesForChat(chatId: string) {
    return computed(() => this._messagesByChat().get(chatId) ?? []);
  }

  // Get the last message for a chat
  getLastMessage(chatId: string): MessageResponse | null {
    const messages = this._messagesByChat().get(chatId);
    return messages?.[messages.length - 1] ?? null;
  }

  // Get Chat Ids only with messages
  getAllChatsWithMessages(): string[] {
    const map = this._messagesByChat();
    return Array.from(map.keys());
  }

  // Get unread count for a specific chat
  getUnreadCountForChat(chatId: string) {
    return computed(() => this._unreadCounts().get(chatId) ?? 0);
  }

  // Get total unread count
  getTotalUnreadCount() {
    return computed(() => {
      const counts = this._unreadCounts();
      return Array.from(counts.values()).reduce((acc, curr) => acc + curr, 0);
    });
  }

  // Set active chat & clear its unread count
  setActiveChat(chatId: string): void {
    this._activeChatId.set(chatId);

    this._unreadCounts.update((counts) => {
      const newCounts = new Map(counts);
      newCounts.set(chatId, 0);
      return newCounts;
    });
  }

  // Clear all messages for chat
  clearMessagesForChat(chatId: string): void {
    this._messagesByChat.update((map) => {
      const newMap = new Map(map);
      newMap.delete(chatId);
      return newMap;
    });
  }

  // Clear all messages
  clearAll(): void {
    this._messagesByChat.set(new Map());
    this._unreadCounts.set(new Map());
  }

  // Remove a specific message
  removeMessage(chatId: string, messageId: string): void {
    this._messagesByChat.update((map) => {
      const newMap = new Map(map);
      const messages = newMap.get(chatId);

      if (!messages) return map;

      const filteredMessages = messages.filter((msg) => msg.messageId !== messageId);
      newMap.set(chatId, filteredMessages);
      return newMap;
    });
  }
}
