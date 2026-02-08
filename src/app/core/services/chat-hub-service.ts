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

  async startTyping(chatId: string): Promise<void> {
    if (!this._hubConnection) return;

    // Clear existing timeout
    const existingTimeout = this.typingTimeouts.get(chatId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Invoke the hub method (StartTyping) on the server
    await this._hubConnection.invoke('StartTyping', chatId);

    // Auto-stop typing after timeout (3 seconds)
    const timeoutId = window.setTimeout(() => {
      this.stopTyping(chatId);
    }, this.TYPING_TIMEOUT);

    this.typingTimeouts.set(chatId, timeoutId);
  }

  async stopTyping(chatId: string): Promise<void> {
    if (!this._hubConnection) return;

    const existingTimeout = this.typingTimeouts.get(chatId);
    if (!existingTimeout) return;

    // Clear timeout
    clearTimeout(existingTimeout);
    this.typingTimeouts.delete(chatId);

    await this._hubConnection.invoke('StopTyping', chatId);
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
