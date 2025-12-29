import { Component } from '@angular/core';
import { ChatsListHeaderComponent } from "./chats-list-header-component/chats-list-header-component";
import { ChatsListComponent } from "./chats-list-component/chats-list-component";

@Component({
  selector: 'app-chats-sidebar-component',
  imports: [ChatsListHeaderComponent, ChatsListComponent],
  templateUrl: './chats-sidebar-component.html',
  styleUrl: './chats-sidebar-component.css',
})
export class ChatsSidebarComponent {}
