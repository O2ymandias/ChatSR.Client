import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  PLATFORM_ID,
  signal,
  viewChild,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { FormsModule } from '@angular/forms';
import { DrawerModule } from 'primeng/drawer';
import { AvatarModule } from 'primeng/avatar';
import { NavigationDrawerComponent } from './navigation-drawer-component/navigation-drawer-component';
import { ChatsService } from '../../../core/services/chats-service';
import { ChatListResponse } from '../../../shared/models/chats.model';
import { ChatsListComponent } from './chats-list-component/chats-list-component';

@Component({
  selector: 'app-chats-sidebar-component',
  imports: [
    ButtonModule,
    InputTextModule,
    InputIconModule,
    IconFieldModule,
    FormsModule,
    DrawerModule,
    AvatarModule,
    NavigationDrawerComponent,
    ChatsListComponent,
  ],
  templateUrl: './chats-sidebar-component.html',
  styleUrl: './chats-sidebar-component.css',
})
export class ChatsSidebarComponent implements AfterViewInit {
  private readonly _chatService = inject(ChatsService);
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _destroyRef = inject(DestroyRef);

  userChats = signal<ChatListResponse[]>([]);

  searchQuery = signal('');

  searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

  profileDrawerVisible = signal(false);

  ngAfterViewInit() {
    this.searchInput().nativeElement.focus();
  }

  clearSearch() {
    this.searchQuery.set('');
  }
}
