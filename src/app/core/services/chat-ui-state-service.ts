import { computed, Injectable, signal } from '@angular/core';
import { MessageResponse } from '../../shared/models/message.model';

@Injectable({
  providedIn: 'root',
})
export class ChatUiStateService {
  ////////////////////////////////////////////////////////////////////////////////////
  // Search state
  ////////////////////////////////////////////////////////////////////////////////////

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

  ////////////////////////////////////////////////////////////////////////////////////
  // Edit state
  ////////////////////////////////////////////////////////////////////////////////////

  private _editingMessage = signal<MessageResponse | null>(null);

  editingMessage = this._editingMessage.asReadonly();
  isEditing = computed(() => this._editingMessage() !== null);

  startEditing(message: MessageResponse): void {
    this._editingMessage.set(message);
    this._replyToMessage.set(null);
  }

  stopEditing(): void {
    this._editingMessage.set(null);
  }

  // //////////////////////////////////////////////////////////////////////////////////
  // Reply state
  ////////////////////////////////////////////////////////////////////////////////////

  private _replyToMessage = signal<MessageResponse | null>(null);

  replyToMessage = this._replyToMessage.asReadonly();
  isReplying = computed(() => this._replyToMessage() !== null);

  startReplying(message: MessageResponse): void {
    this._replyToMessage.set(message);
    this._editingMessage.set(null);
  }

  stopReplying(): void {
    this._replyToMessage.set(null);
  }
}
