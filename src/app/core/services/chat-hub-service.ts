import { TypingUser } from './../../shared/models/chat-hub.model';
import { inject, Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../environment';
import { MessageResponse, SendMessageRequest } from '../../shared/models/message.model';
import { MessageStoreService } from './message-store-service';

@Injectable({
  providedIn: 'root',
})
export class ChatHubService {
  private readonly _messageStoreService = inject(MessageStoreService);

  // Connection
  private _hubConnection: signalR.HubConnection | null = null;

  // Heartbeat
  private readonly HEART_BEAT_INTERVAL = 30_000;
  private heartbeatTimer: number | null = null;

  // Typing
  private readonly TYPING_TIMEOUT = 3_000;
  private typingTimeouts: Map<string, number> = new Map();
  private isTypingForChat: Map<string, boolean> = new Map();
  private _typingUsers = signal<TypingUser[]>([]);
  typingUsers = this._typingUsers.asReadonly();

  // Status
  private _onlineUsers = signal<string[]>([]);
  onlineUsers = this._onlineUsers.asReadonly();

  ///////////////////////////////////////////////////////////////////////////////////////
  // Connection
  ///////////////////////////////////////////////////////////////////////////////////////
  async startConnection(accessToken: string): Promise<void> {
    this._hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(environment.chatHubUrl, {
        accessTokenFactory: () => accessToken,
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .build();

    this._setupEventHandlers();

    await this._hubConnection.start();

    this._startHeartbeat();
  }

  async stopConnection() {
    if (!this._hubConnection) return;

    await this._hubConnection.stop();
    this._cleanupHeartbeat();
    this._cleanupTypingTimeouts();
  }

  ///////////////////////////////////////////////////////////////////////////////////////
  // Event handlers
  ///////////////////////////////////////////////////////////////////////////////////////
  private _setupEventHandlers(): void {
    this._startHeartbeatRelatedEvents();

    this._onUserTyping();
    this._onUserStoppedTyping();

    this._onReceiveMessage();

    this._onUserOnline();
    this._onUserOffline();
    this._onOnlineUsers();
  }

  ///////////////////////////////////////////////////////////////////////////////////////
  // Typing
  ///////////////////////////////////////////////////////////////////////////////////////
  notifyTyping(chatId: string): void {
    if (!this._hubConnection) return;

    const existingTyping = this.isTypingForChat.get(chatId);
    if (!existingTyping) {
      this._startTyping(chatId);
    }

    this._resetTypingTimeout(chatId);
  }

  private async _startTyping(chatId: string): Promise<void> {
    if (!this._hubConnection) return;

    try {
      await this._hubConnection.invoke('StartTyping', chatId);
      this.isTypingForChat.set(chatId, true);
    } catch (error) {
      console.error('Error sending typing notification:', error);
    }
  }

  private _resetTypingTimeout(chatId: string): void {
    const existingTimeout = this.typingTimeouts.get(chatId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    const timeoutId = window.setTimeout(() => {
      this.stopTyping(chatId);
    }, this.TYPING_TIMEOUT);

    this.typingTimeouts.set(chatId, timeoutId);
  }

  async stopTyping(chatId: string): Promise<void> {
    if (!this._hubConnection) return;

    const existingTyping = this.isTypingForChat.get(chatId);
    if (!existingTyping) return;

    const existingTimeout = this.typingTimeouts.get(chatId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.typingTimeouts.delete(chatId);
    }

    try {
      await this._hubConnection.invoke('StopTyping', chatId);
      this.isTypingForChat.set(chatId, false);
    } catch (error) {
      console.error('Error sending stop typing notification:', error);
    }
  }

  private async _onUserTyping(): Promise<void> {
    if (!this._hubConnection) return;

    this._hubConnection.on('UserTyping', (chatId: string, userId: string) => {
      this._addTypingUser({ chatId, userId });
    });
  }

  private _addTypingUser(typingUser: TypingUser): void {
    this._typingUsers.update((users) => {
      if (users.some((u) => u.chatId === typingUser.chatId && u.userId === typingUser.userId)) {
        return users;
      }
      return [...users, typingUser];
    });
  }

  private async _onUserStoppedTyping(): Promise<void> {
    if (!this._hubConnection) return;

    this._hubConnection.on('UserStoppedTyping', (chatId: string, userId: string) => {
      this._removeTypingUser({ chatId, userId });
    });
  }

  private _removeTypingUser(typingUser: TypingUser): void {
    this._typingUsers.update((users) =>
      users.filter((u) => !(u.chatId === typingUser.chatId && u.userId === typingUser.userId)),
    );
  }

  private _cleanupTypingTimeouts(): void {
    this.typingTimeouts.forEach(clearTimeout);
    this.typingTimeouts.clear();
    this.isTypingForChat.clear();
  }

  ///////////////////////////////////////////////////////////////////////////////////////
  // Heartbeat
  ///////////////////////////////////////////////////////////////////////////////////////

  private _startHeartbeatRelatedEvents(): void {
    if (!this._hubConnection) return;

    this._hubConnection.onreconnected(() => this._startHeartbeat());

    this._hubConnection.onreconnecting(() => this._cleanupHeartbeat());

    this._hubConnection.onclose(() => this._cleanupHeartbeat());
  }
  private async _heartbeat(): Promise<void> {
    if (this._hubConnection?.state === signalR.HubConnectionState.Connected) {
      await this._hubConnection.invoke('Heartbeat');
    }
  }
  private _startHeartbeat(): void {
    this._cleanupHeartbeat();
    this.heartbeatTimer = window.setInterval(() => this._heartbeat(), this.HEART_BEAT_INTERVAL);
  }
  private _cleanupHeartbeat(): void {
    if (!this.heartbeatTimer) return;
    window.clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
  }

  ///////////////////////////////////////////////////////////////////////////////////////
  // Messages
  ///////////////////////////////////////////////////////////////////////////////////////
  async sendMessage(chatId: string, request: SendMessageRequest): Promise<void> {
    if (!this._hubConnection) return;

    try {
      await this._hubConnection.invoke('SendMessage', chatId, request);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  private _onReceiveMessage(): void {
    if (!this._hubConnection) return;

    this._hubConnection.on('ReceiveMessage', (message: MessageResponse) => {
      this._messageStoreService.addMessage(message);
    });
  }

  ///////////////////////////////////////////////////////////////////////////////////////
  // User Status
  ///////////////////////////////////////////////////////////////////////////////////////

  private _onUserOnline(): void {
    if (!this._hubConnection) return;

    this._hubConnection.on('UserOnline', (userId: string) => {
      this._onlineUsers.update((users) => {
        if (users.includes(userId)) {
          return users;
        }
        return [...users, userId];
      });
    });
  }

  private _onUserOffline(): void {
    if (!this._hubConnection) return;

    this._hubConnection.on('UserOffline', (userId: string, lastActiveAt: string) => {
      this._onlineUsers.update((users) => users.filter((u) => u !== userId));
    });
  }

  private _onOnlineUsers(): void {
    if (!this._hubConnection) return;

    this._hubConnection.on('OnlineUsers', (userIds: string[]) => {
      this._onlineUsers.update((current) => {
        const merged = [...current];
        for (const id of userIds) {
          if (!merged.includes(id)) merged.push(id);
        }
        return merged;
      });
      console.log(this._onlineUsers());
    });
  }
}
