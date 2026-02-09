import { TypingUser } from './../../shared/models/chat-hub.model';
import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root',
})
export class ChatHubService {
  private _hubConnection: signalR.HubConnection | null = null;

  // Heartbeat
  private readonly HEART_BEAT_INTERVAL = 30_000;
  private heartbeatTimer: number | null = null;

  // Typing
  private readonly TYPING_TIMEOUT = 3_000; // 3 seconds
  private typingTimeouts: Map<string, number> = new Map();
  private _typingUsers = signal<TypingUser[]>([]);
  typingUsers = this._typingUsers.asReadonly();

  private readonly TYPING_DEBOUNCE = 1_000; // 1 second debounce
  private typingDebounceTimers: Map<string, number> = new Map();
  private isTypingForChat: Map<string, boolean> = new Map();

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
    this._stopHeartbeat();
  }

  ///////////////////////////////////////////////////////////////////////////////////////
  // Event handlers
  ///////////////////////////////////////////////////////////////////////////////////////
  private _setupEventHandlers(): void {
    this._startHeartbeatRelatedEvents();
    this._onUserTyping();
    this._onUserStoppedTyping();
  }

  ///////////////////////////////////////////////////////////////////////////////////////
  // Typing
  ///////////////////////////////////////////////////////////////////////////////////////
  async notifyTyping(chatId: string): Promise<void> {
    if (!this._hubConnection) return;

    // Clear existing debounce timer
    const existingDebounce = this.typingDebounceTimers.get(chatId);
    if (existingDebounce) {
      clearTimeout(existingDebounce);
    }

    // If not already typing, send the StartTyping event immediately
    if (!this.isTypingForChat.get(chatId)) {
      await this._startTyping(chatId);
    }

    // Reset the auto-stop timeout
    this._resetTypingTimeout(chatId);

    // Set up debounce timer to prevent rapid consecutive calls
    const debounceTimer = window.setTimeout(() => {
      this.typingDebounceTimers.delete(chatId);
    }, this.TYPING_DEBOUNCE);

    this.typingDebounceTimers.set(chatId, debounceTimer);
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
    // Clear existing timeout
    const existingTimeout = this.typingTimeouts.get(chatId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Auto-stop typing after timeout (3 seconds of inactivity)
    const timeoutId = window.setTimeout(() => {
      this.stopTyping(chatId);
    }, this.TYPING_TIMEOUT);

    this.typingTimeouts.set(chatId, timeoutId);
  }

  async stopTyping(chatId: string): Promise<void> {
    if (!this._hubConnection) return;
    if (!this.isTypingForChat.get(chatId)) return;

    // Clear timeout
    const existingTimeout = this.typingTimeouts.get(chatId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.typingTimeouts.delete(chatId);
    }

    // Clear debounce timer
    const existingDebounce = this.typingDebounceTimers.get(chatId);
    if (existingDebounce) {
      clearTimeout(existingDebounce);
      this.typingDebounceTimers.delete(chatId);
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
    this.typingTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.typingTimeouts.clear();

    this.typingDebounceTimers.forEach((timer) => clearTimeout(timer));
    this.typingDebounceTimers.clear();
    this.isTypingForChat.clear();
  }

  ///////////////////////////////////////////////////////////////////////////////////////
  // Heartbeat
  ///////////////////////////////////////////////////////////////////////////////////////

  private _startHeartbeatRelatedEvents(): void {
    if (!this._hubConnection) return;

    this._hubConnection.onreconnected(() => this._startHeartbeat());

    this._hubConnection.onreconnecting(() => this._stopHeartbeat());

    this._hubConnection.onclose(() => this._stopHeartbeat());
  }
  private async _heartbeat(): Promise<void> {
    if (this._hubConnection?.state === signalR.HubConnectionState.Connected) {
      await this._hubConnection.invoke('Heartbeat');
    }
  }
  private _startHeartbeat(): void {
    this._stopHeartbeat();
    this.heartbeatTimer = window.setInterval(() => this._heartbeat(), this.HEART_BEAT_INTERVAL);
  }
  private _stopHeartbeat(): void {
    if (!this.heartbeatTimer) return;
    window.clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
  }

  ngOnDestroy() {
    this.stopConnection();
    this._cleanupTypingTimeouts();
  }
}
