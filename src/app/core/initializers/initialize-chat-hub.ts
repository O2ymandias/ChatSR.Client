import { inject } from '@angular/core';
import { ChatHubService } from '../services/chat-hub-service';
import { AuthService } from '../services/auth-service';

// Start chat hub connection when app is first initialized and user is authenticated.
export async function initializeChatHub() {
  const _chatHubService = inject(ChatHubService);
  const _authService = inject(AuthService);

  const token = _authService.token() ?? '';
  const isAuthenticated = _authService.isAuthenticated();

  if (isAuthenticated) {
    try {
      await _chatHubService.startConnection(token);
    } catch (error) {
      console.error('Failed to initialize chat hub connection:', error);
    }
  }
}
