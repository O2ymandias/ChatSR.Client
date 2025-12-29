import { Component } from '@angular/core';
import { ChatsSidebarComponent } from './chats-sidebar-component/chats-sidebar-component';
import { ChatsMainComponent } from './chats-main-component/chats-main-component';

@Component({
  selector: 'app-chats-component',
  imports: [ChatsSidebarComponent, ChatsMainComponent],
  templateUrl: './chats-component.html',
  styleUrl: './chats-component.css',
})
export class ChatsComponent {}
