import { ApiResponse, ApiResponseBase } from './../../shared/models/shared.model';
import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import {
  ChatListResponse,
  ChatMemberResponse,
  ChatResponse,
} from '../../shared/models/chats.model';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root',
})
export class ChatsService {
  private readonly _httpClient = inject(HttpClient);

  private _userChats = signal<ChatListResponse[]>([]);

  userChats = this._userChats.asReadonly();

  searchTerm = signal<string>('');

  filteredUserChats = computed(() => {
    const term = this.searchTerm().toLowerCase();

    if (!term) return this.userChats();

    return this.userChats().filter((chat) => {
      return chat.name.toLowerCase().includes(term);
    });
  });

  getChatById$(chatId: string) {
    return this._httpClient.get<ApiResponse<ChatResponse>>(`${environment.apiUrl}/chat/${chatId}`);
  }
  getUserChats$() {
    return this._httpClient.get<ApiResponse<ChatListResponse[]>>(
      `${environment.apiUrl}/chat/user-chats`,
    );
  }

  markChatAsRead$(chatId: string) {
    return this._httpClient.get<ApiResponseBase>(
      `${environment.apiUrl}/chat/mark-as-read/${chatId}`,
    );
  }

  getChatMembers$(chatId: string) {
    return this._httpClient.get<ApiResponse<ChatMemberResponse[]>>(
      `${environment.apiUrl}/chat/chat-members/${chatId}`,
    );
  }

  setUserChats(chats: ChatListResponse[]) {
    this._userChats.set(chats);
  }
}
