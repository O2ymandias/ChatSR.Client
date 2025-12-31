import { inject, Injectable } from '@angular/core';
import { PagedApiResponse, PaginationParams } from '../../shared/models/shared.model';
import { environment } from '../../environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AuthService } from './auth-service';
import { MessageResponse } from '../../shared/models/message.model';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private readonly _httpClient = inject(HttpClient);
  private readonly _authService = inject(AuthService);

  getChatMessages$(chatId: string, pagination: PaginationParams) {
    const url = `${environment.apiUrl}/message/${chatId}`;

    let params = new HttpParams();
    params = params.append('page', pagination.page.toString());
    params = params.append('pageSize', pagination.pageSize.toString());

    return this._httpClient.get<PagedApiResponse<MessageResponse>>(url, { params });
  }
}
