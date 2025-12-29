import { FormsModule } from '@angular/forms';
import { Component, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-chats-main-component',
  imports: [ButtonModule, InputTextModule, FormsModule, ScrollPanelModule, TextareaModule],
  templateUrl: './chats-main-component.html',
  styleUrl: './chats-main-component.css',
})
export class ChatsMainComponent {
  searchMessagesVisible = signal(false);

  searchQuery = signal('');

  clearSearch() {
    this.searchQuery.set('');
  }
}
