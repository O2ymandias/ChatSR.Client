import { Component } from '@angular/core';
import { ChatsSidebarComponent } from "./chats-sidebar-component/chats-sidebar-component";

@Component({
  selector: 'app-chats-component',
  imports: [ChatsSidebarComponent],
  templateUrl: './chats-component.html',
  styleUrl: './chats-component.css',
})
export class ChatsComponent {

}
