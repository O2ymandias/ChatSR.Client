import { QueryParams } from './../../shared/models/shared.model';
import { inject, Injectable, signal } from '@angular/core';
import { PagedApiResponse } from '../../shared/models/shared.model';
import { environment } from '../../environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { MessageResponse } from '../../shared/models/message.model';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private readonly _httpClient = inject(HttpClient);

  readonly DEFAULT_PAGE = 1;
  readonly DEFAULT_PAGE_SIZE = 20;

  searchTerm = signal('');
  resetPagination = signal(0);

  getChatMessages$(chatId: string, queryParams: QueryParams) {
    const url = `${environment.apiUrl}/message/${chatId}`;

    let params = new HttpParams();
    params = params.append('page', queryParams.page.toString());
    params = params.append('pageSize', queryParams.pageSize.toString());

    if (queryParams.searchTerm) {
      params = params.append('searchTerm', queryParams.searchTerm);
    }

    return this._httpClient.get<PagedApiResponse<MessageResponse>>(url, { params });
  }

  sendMessage$(chatId: string, content: string) {
    const url = `${environment.apiUrl}/message/${chatId}`;
    return this._httpClient.post<MessageResponse>(url, { content });
  }
}
