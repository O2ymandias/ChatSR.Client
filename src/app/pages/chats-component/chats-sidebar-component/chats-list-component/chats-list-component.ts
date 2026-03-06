import { Component, computed, DestroyRef, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ChatsService } from '../../../../core/services/chats-service';
import { isPlatformBrowser } from '@angular/common';
import { filter, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChatDatePipe } from '../../../../shared/pipes/chat-date-pipe';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { environment } from '../../../../environment';
import { NavigationService } from '../../../../core/services/navigation-service';
import { MessageStoreService } from '../../../../core/services/message-store-service';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { AuthService } from '../../../../core/services/auth-service';

@Component({
  selector: 'app-chats-list-component',
  imports: [ChatDatePipe, RouterLink, RouterLinkActive, BadgeModule, AvatarModule],
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
  private readonly _authService = inject(AuthService);

  serverUrl = environment.serverUrl;

  filteredUserChats = this._chatService.filteredUserChats;

  unreadCountsMap = this._messageStoreService.unreadCounts;
  messagesMap = this._messageStoreService.messagesByChat;
  lastMessageMap = this._messageStoreService.lastMessagePerChat;

  currentUserId = computed(
    () =>
      this._authService.userInfo()?.[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ],
  );

  getLastMessage(chatId: string) {
    return this.lastMessageMap().get(chatId) ?? null;
  }

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
            this._chatService.setUserChats(res.data);

            res.data.forEach((c) => {
              // Set unread count
              this._messageStoreService.setUnreadCountForChat(c.chatId, c.unreadCount);

              // Set last message
              if (c.lastMessageOverview)
                this._messageStoreService.setLastMessageForChat(c.chatId, c.lastMessageOverview);
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
