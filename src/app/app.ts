import { Component, inject, OnDestroy, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ChatHubService } from './core/services/chat-hub-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonModule, ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnDestroy {
  private readonly _chatHubService = inject(ChatHubService);
  protected readonly title = signal('ChatSR');

  ngOnDestroy(): void {
    this._chatHubService.stopConnection();
  }
}
