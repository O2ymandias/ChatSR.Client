import { Component, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ChatUiStateService } from '../../../../../core/services/chat-ui-state-service';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";

@Component({
  selector: 'app-search-chat-component',
  imports: [ButtonModule, FormsModule, InputTextModule, IconFieldModule, InputIconModule],
  templateUrl: './search-chat-component.html',
  styleUrl: './search-chat-component.css',
})
export class SearchChatComponent {
  private readonly _chatUiStateService = inject(ChatUiStateService);

  searchTerm = signal<string>('');

  search(): void {
    this._chatUiStateService.setSearchTerm(this.searchTerm());
  }

  clearSearch() {
    this._chatUiStateService.clearSearch();
    this.searchTerm.set('');
  }

  clearSearchAndHide() {
    this.clearSearch();
    this._chatUiStateService.hideSearch();
  }
}
