import { ApiResponse } from './../../shared/models/shared.model';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ChatListResponse, ChatResponse } from '../../shared/models/chats.model';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root',
})
export class ChatsService {
  private readonly _httpClient = inject(HttpClient);

  getChatById$(chatId: string) {
    return this._httpClient.get<ApiResponse<ChatResponse>>(`${environment.apiUrl}/chat/${chatId}`);
  }
  getUserChats$() {
    return this._httpClient.get<ApiResponse<ChatListResponse[]>>(
      `${environment.apiUrl}/chat/user-chats`,
    );
  }
}
