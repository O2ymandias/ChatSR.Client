import { AfterViewInit, Component, ElementRef, signal, viewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { Ripple } from 'primeng/ripple';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { DrawerModule } from 'primeng/drawer';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { NavigationDrawerComponent } from './navigation-drawer-component/navigation-drawer-component';

@Component({
  selector: 'app-chats-sidebar-component',
  imports: [
    ButtonModule,
    InputTextModule,
    InputIconModule,
    IconFieldModule,
    FormsModule,
    TooltipModule,
    Ripple,
    ScrollPanelModule,
    DrawerModule,
    AvatarModule,
    DividerModule,
    NavigationDrawerComponent,
  ],
  templateUrl: './chats-sidebar-component.html',
  styleUrl: './chats-sidebar-component.css',
})
export class ChatsSidebarComponent implements AfterViewInit {
  searchQuery = signal('');
  clearSearch() {
    this.searchQuery.set('');
  }

  searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

  profileDrawerVisible = signal(false);

  ngAfterViewInit() {
    this.searchInput().nativeElement.focus();
  }

  visible = signal(true);

  sidebarOpen = signal(false);

  toggleSidebar() {
    this.sidebarOpen.update((v) => !v);
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }
}
