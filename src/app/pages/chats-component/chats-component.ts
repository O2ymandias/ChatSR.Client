import { Component } from '@angular/core';
import { ChatsSidebarComponent } from './chats-sidebar-component/chats-sidebar-component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-chats-component',
  imports: [ChatsSidebarComponent, RouterOutlet],
  templateUrl: './chats-component.html',
  styleUrl: './chats-component.css',
})
export class ChatsComponent {}
