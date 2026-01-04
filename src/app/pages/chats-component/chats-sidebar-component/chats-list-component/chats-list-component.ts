import { Component, DestroyRef, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ChatsService } from '../../../../core/services/chats-service';
import { ChatListResponse } from '../../../../shared/models/chats.model';
import { isPlatformBrowser } from '@angular/common';
import { tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChatDatePipe } from '../../../../shared/pipes/chat-date-pipe';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { environment } from '../../../../environment';

@Component({
  selector: 'app-chats-list-component',
  imports: [ScrollPanelModule, ChatDatePipe, RouterLink, RouterLinkActive, RippleModule],
  templateUrl: './chats-list-component.html',
  styleUrl: './chats-list-component.css',
})
export class ChatsListComponent implements OnInit {
  private readonly _chatService = inject(ChatsService);
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _destroyRef = inject(DestroyRef);

  serverUrl = environment.serverUrl;

  userChats = signal<ChatListResponse[]>([]);

  ngOnInit(): void {
    this._initializeUserChats();
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
}
