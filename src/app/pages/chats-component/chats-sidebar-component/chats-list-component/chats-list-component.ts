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

@Component({
  selector: 'app-chats-list-component',
  imports: [ScrollPanelModule, ChatDatePipe, RouterLink, RouterLinkActive],
  templateUrl: './chats-list-component.html',
  styleUrl: './chats-list-component.css',
})
export class ChatsListComponent implements OnInit {
  private readonly _chatService = inject(ChatsService);
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _navigationService = inject(NavigationService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _router = inject(Router);

  serverUrl = environment.serverUrl;

  userChats = signal<ChatListResponse[]>([]);

  ngOnInit(): void {
    this._initializeUserChats();
    this._listenToRouteChanges();
  }

  private _initializeUserChats(): void {
    if (!isPlatformBrowser(this._platformId)) return;

    this._chatService
      .getUserChats$()
      .pipe(
        tap((res) => {
          if (res.data) this.userChats.set(res.data);
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
          if (event.url.includes('/chats/') && event.url !== '/chats') {
            this._navigationService.showMainContentView();
          }
        }),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe();
  }
}
