import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ChatUiStateService {
  private _searchTerm = signal<string>('');
  private _searchVisible = signal<boolean>(false);

  searchTerm = this._searchTerm.asReadonly();
  searchVisible = this._searchVisible.asReadonly();

  setSearchTerm(term: string): void {
    this._searchTerm.set(term);
  }

  clearSearch(): void {
    this._searchTerm.set('');
  }

  showSearch(): void {
    this._searchVisible.set(true);
  }

  hideSearch(): void {
    this._searchVisible.set(false);
  }
}
