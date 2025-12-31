import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../environment';
import { MessageResponse } from '../../shared/models/message.model';

@Injectable({
  providedIn: 'root',
})
export class ChatHubService {
  private _hubConnection: signalR.HubConnection | null = null;
  private readonly HEART_BEAT_INTERVAL = 30_000;
  private heartbeatTimer: NodeJS.Timeout | null = null;

  // Internal signals
  private _lastMessage = signal<MessageResponse | null>(null);
  private _messages = signal<MessageResponse[]>([]);

  // Exposed as readonly signals
  messages = this._messages.asReadonly();
  lastMessage = this._lastMessage.asReadonly();

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

  private _setupEventHandlers(): void {
    this._startHeartbeatRelatedEvents();

    this._onReceiveMessage();
  }

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
    this.heartbeatTimer = setInterval(() => this._heartbeat(), this.HEART_BEAT_INTERVAL);
  }

  private _stopHeartbeat(): void {
    if (!this.heartbeatTimer) return;
    clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
  }

  async sendMessage(chatId: string, content: string): Promise<void> {
    if (!this._hubConnection) return;
    await this._hubConnection.invoke('SendMessage', chatId, { content });
  }

  private _onReceiveMessage(): void {
    if (!this._hubConnection) return;

    this._hubConnection.on('ReceiveMessage', (message: MessageResponse) => {
      this._lastMessage.set(message);
      this._messages.update((messages) => [...messages, message]);
    });
  }
}
