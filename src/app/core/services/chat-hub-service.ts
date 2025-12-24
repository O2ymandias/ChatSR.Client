import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root',
})
export class ChatHubService {
  private _hubConnection: signalR.HubConnection | null = null;
  private readonly HEART_BEAT_INTERVAL = 30_000;
  private heartbeatTimer: NodeJS.Timeout | null = null;

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
}
