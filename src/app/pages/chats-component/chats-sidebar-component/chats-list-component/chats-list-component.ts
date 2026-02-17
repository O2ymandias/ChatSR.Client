import { Component, DestroyRef, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ChatsService } from '../../../../core/services/chats-service';
import { ChatListResponse } from '../../../../shared/models/chats.model';
import { isPlatformBrowser } from '@angular/common';
import { filter, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChatDatePipe } from '../../../../shared/pipes/chat-date-pipe';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { environment } from '../../../../environment';
import { NavigationService } from '../../../../core/services/navigation-service';
import { MessageStoreService } from '../../../../core/services/message-store-service';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-chats-list-component',
  imports: [ScrollPanelModule, ChatDatePipe, RouterLink, RouterLinkActive, BadgeModule],
  templateUrl: './chats-list-component.html',
  styleUrl: './chats-list-component.css',
})
export class ChatsListComponent implements OnInit {
  private readonly _chatService = inject(ChatsService);
  private readonly _messageStoreService = inject(MessageStoreService);
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _navigationService = inject(NavigationService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _router = inject(Router);

  serverUrl = environment.serverUrl;

  userChats = signal<ChatListResponse[]>([]);

  unreadCountsMap = this._messageStoreService.unreadCounts;

  ngOnInit(): void {
    this._loadUserChatsAndSetUnreadCount();
    this._listenToRouteChanges();
  }

  private _loadUserChatsAndSetUnreadCount(): void {
    if (!isPlatformBrowser(this._platformId)) return;

    this._chatService
      .getUserChats$()
      .pipe(
        tap((res) => {
          if (res.data) {
            // Set user chats
            this.userChats.set(res.data);

            // Set unread count
            res.data.forEach((c) => {
              this._messageStoreService.setUnreadCountForChat(c.chatId, c.unreadCount);
            });
          }
        }),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe();
  }

  private _listenToRouteChanges(): void {
    this._router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        tap((event: NavigationEnd) => {
          if (event.url.match(/\/chats\/.+/)) {
            this._navigationService.showMainContentView();
          }
        }),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe();
  }
}
