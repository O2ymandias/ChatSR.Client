import {
  Component,
  inject,
  input,
  computed,
  signal,
  PLATFORM_ID,
  DestroyRef,
  effect,
  OnInit,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ChatMemberResponse, ChatResponse } from '../../../../shared/models/chats.model';
import { environment } from '../../../../environment';
import { ChatHubService } from '../../../../core/services/chat-hub-service';
import { NavigationService } from '../../../../core/services/navigation-service';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { ChatsService } from '../../../../core/services/chats-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { ChatUiStateService } from '../../../../core/services/chat-ui-state-service';
import { AuthService } from '../../../../core/services/auth-service';
import { DialogModule } from 'primeng/dialog';
import { MembersModalComponent } from './members-modal-component/members-modal-component';
import { SearchChatComponent } from './search-chat-component/search-chat-component';

@Component({
  selector: 'app-chat-header-component',
  imports: [ButtonModule, DialogModule, MembersModalComponent, SearchChatComponent],
  templateUrl: './chat-header-component.html',
  styleUrl: './chat-header-component.css',
})
export class ChatHeaderComponent implements OnInit {
  private readonly _authService = inject(AuthService);
  private readonly _navigationService = inject(NavigationService);
  private readonly _chatService = inject(ChatsService);
  private readonly _chatHubService = inject(ChatHubService);
  private readonly _chatUiState = inject(ChatUiStateService);
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _router = inject(Router);
  private readonly _destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      const chatId = this.chatId();

      this._initializeChat(chatId);
      this._initializeChatMembers(chatId);
    });
  }
  ngOnInit(): void {}

  chatId = input.required<string>();
  chat = signal<ChatResponse | null>(null);
  chatMembers = signal<ChatMemberResponse[]>([]);

  serverUrl = environment.serverUrl;

  // Typing
  typingUsers = this._chatHubService.typingUsers;
  typingUsersInCurrentChat = computed(() =>
    this.typingUsers().filter((u) => u.chatId === this.chatId()),
  );
  typingText = computed(() => {
    const count = this.typingUsersInCurrentChat().length;
    const typingUsers = this.chatMembers().filter((u) =>
      this.typingUsersInCurrentChat()
        .map((u) => u.userId)
        .includes(u.userId),
    );

    if (count === 0) return '';
    if (count === 1) return `${typingUsers[0].displayName} is typing`;
    if (count === 2)
      return `${typingUsers[0].displayName} and ${typingUsers[1].displayName} are typing`;
    return `${count} people typing`;
  });

  searchVisible = this._chatUiState.searchVisible;
  showSearch() {
    this._chatUiState.showSearch();
  }

  // Current User
  currentUserId = computed(
    () =>
      this._authService.userInfo()?.[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ] ?? null,
  );

  // User Status
  onlineUsers = this._chatHubService.onlineUsers;

  onlineUsersInCurrentChat = computed(() => {
    return this.chatMembers()
      .filter((member) => this.onlineUsers().includes(member.userId))
      .map((m) => m.userId);
  });

  otherChatMember = computed(() => {
    const chatMembers = this.chatMembers();
    if (this.chat()?.isGroup) return null;
    return chatMembers.find((member) => member.userId !== this.currentUserId()) ?? null;
  });

  isOtherUserOnline = computed(() => {
    const other = this.otherChatMember();
    if (!other) return false;
    return this.onlineUsers().includes(other.userId);
  });

  userStatusLabel = computed(() => {
    const chat = this.chat();
    if (!chat) return '';

    if (chat.isGroup) {
      const count = this.onlineUsersInCurrentChat().length;
      return count === 0
        ? 'No members online'
        : `${count} ${count === 1 ? 'member' : 'members'} online`;
    }

    return this.isOtherUserOnline() ? 'Online' : 'Offline';
  });

  goBack() {
    this._navigationService.showSidebarView();
    this._router.navigate(['/chats']);
  }

  private _initializeChat(chatId: string): void {
    if (!isPlatformBrowser(this._platformId)) return;

    this._chatService
      .getChatById$(chatId)
      .pipe(
        tap((res) => {
          if (res.isSuccess && res.data) this.chat.set(res.data);
        }),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe();
  }

  private _initializeChatMembers(chatId: string): void {
    if (!isPlatformBrowser(this._platformId)) return;

    this._chatService
      .getChatMembers$(chatId)
      .pipe(
        tap((res) => {
          if (res.isSuccess && res.data) this.chatMembers.set(res.data);
        }),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe();
  }

  membersModalVisible = signal(false);
}
