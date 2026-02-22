import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ChatUiStateService {
  searchTerm = signal<string>('');
  searchVisible = signal<boolean>(false);

  clearSearch(): void {
    this.searchTerm.set('');
    this.searchVisible.set(false);
  }
}
