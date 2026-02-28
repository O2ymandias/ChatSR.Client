import { computed, Injectable, signal } from '@angular/core';
import { MessageResponse } from '../../shared/models/message.model';

@Injectable({
  providedIn: 'root',
})
export class MessageStoreService {
  private _messagesByChat = signal<Map<string, MessageResponse[]>>(new Map());
  private _unreadCounts = signal<Map<string, number>>(new Map());
  private _lastMessagePerChat = signal<Map<string, MessageResponse>>(new Map());
  private _activeChatId = signal<string | null>(null);

  messagesByChat = this._messagesByChat.asReadonly();
  unreadCounts = this._unreadCounts.asReadonly();
  lastMessagePerChat = this._lastMessagePerChat.asReadonly();
  activeChatId = this._activeChatId.asReadonly();

  totalUnreadCount = computed(() => {
    const counts = this._unreadCounts();
    return Array.from(counts.values()).reduce((acc, curr) => acc + curr, 0);
  });

  // Set messages for a specific chat (Messages come from api call)
  setMessagesForChat(chatId: string, messages: MessageResponse[]): void {
    this._messagesByChat.update((map) => {
      const newMap = new Map(map);

      const sortedMessages = messages.sort(
        (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
      );
      newMap.set(chatId, [...sortedMessages]);
      return newMap;
    });
  }

  // Prepend messages for a specific chat (Messages come from pagination api call)
  prependMessagesForChat(chatId: string, messages: MessageResponse[]): void {
    this._messagesByChat.update((map) => {
      const newMap = new Map(map);
      const existing = newMap.get(chatId) ?? [];
      const sortedMessages = messages.sort(
        (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime(),
      );
      newMap.set(chatId, [...sortedMessages, ...existing]);
      return newMap;
    });
  }

  // Set unread count for a specific chat
  setUnreadCountForChat(chatId: string, count: number): void {
    this._unreadCounts.update((map) => {
      const newMap = new Map(map);
      newMap.set(chatId, count);
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

    // Set last message for a specific chat
    this.setLastMessageForChat(message.chatId, message);

    // Update unread count if not the active chat.
    if (this._activeChatId() !== message.chatId) {
      this._unreadCounts.update((counts) => {
        const newCounts = new Map(counts);
        const current = newCounts.get(message.chatId) ?? 0;
        newCounts.set(message.chatId, current + 1);
        return newCounts;
      });
    }
  }

  // Set last message for a specific chat
  setLastMessageForChat(chatId: string, message: MessageResponse): void {
    this._lastMessagePerChat.update((map) => {
      const newMap = new Map(map);
      newMap.set(chatId, message);
      return newMap;
    });
  }

  // Set active chat
  setActiveChat(chatId: string): void {
    this._activeChatId.set(chatId);

    // Clear unread count
    this._unreadCounts.update((counts) => {
      const newCounts = new Map(counts);
      newCounts.set(chatId, 0);
      return newCounts;
    });
  }

  // clear active chat
  clearActiveChat(): void {
    this._activeChatId.set(null);
  }

  markMessagesAsRead(chatId: string, lastReadAt: Date): void {
    // Update messages in the chat.
    this._messagesByChat.update((map) => {
      const messages = map.get(chatId);
      if (!messages) return map;

      const hasChanges = messages.some((m) => !m.isRead && new Date(m.sentAt) <= lastReadAt);
      if (!hasChanges) return map;

      const newMap = new Map(map);
      newMap.set(
        chatId,
        messages.map((m) =>
          !m.isRead && new Date(m.sentAt) <= lastReadAt ? { ...m, isRead: true } : m,
        ),
      );
      return newMap;
    });

    // Also update the last message.
    const lastMessage = this._lastMessagePerChat().get(chatId);
    if (lastMessage && !lastMessage.isRead && new Date(lastMessage.sentAt) <= lastReadAt) {
      this.setLastMessageForChat(chatId, { ...lastMessage, isRead: true });
    }
  }
}
