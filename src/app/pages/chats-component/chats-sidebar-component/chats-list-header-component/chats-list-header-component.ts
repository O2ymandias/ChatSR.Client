import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationDrawerComponent } from '../navigation-drawer-component/navigation-drawer-component';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-chats-list-header-component',
  imports: [
    FormsModule,
    NavigationDrawerComponent,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
  ],
  templateUrl: './chats-list-header-component.html',
  styleUrl: './chats-list-header-component.css',
})
export class ChatsListHeaderComponent {
  searchQuery = signal('');

  searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

  ngAfterViewInit() {
    this.searchInput().nativeElement.focus();
  }

  clearSearch() {
    this.searchQuery.set('');
  }
}
