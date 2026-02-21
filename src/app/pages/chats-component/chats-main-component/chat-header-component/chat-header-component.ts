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
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { ChatsService } from '../../../../core/services/chats-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from '../../../../core/services/message-service';
import { MessageStoreService } from '../../../../core/services/message-store-service';

@Component({
  selector: 'app-chat-header-component',
  imports: [ButtonModule, FormsModule, InputTextModule],
  templateUrl: './chat-header-component.html',
  styleUrl: './chat-header-component.css',
})
export class ChatHeaderComponent implements OnInit {
  private readonly _messageService = inject(MessageService);
  private readonly _messageStoreService = inject(MessageStoreService);
  private readonly _navigationService = inject(NavigationService);
  private readonly _chatService = inject(ChatsService);
  private readonly _chatHubService = inject(ChatHubService);
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
  typingUsers = this._chatHubService.typingUsers;
  typingUsersInCurrentChat = computed(() =>
    this.typingUsers().filter((u) => u.chatId === this.chatId()),
  );

  searchTerm = this._messageService.searchTerm;
  searchMessagesVisible = signal(false);

  defaultPage = this._messageService.DEFAULT_PAGE;
  defaultPageSize = this._messageService.DEFAULT_PAGE_SIZE;

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

  clearSearch() {
    this.searchTerm.set('');
    this.loadMessages(true);
  }

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

  loadMessages(clearSearch: boolean = false) {
    this._messageService.resetPagination.update((old) => old + 1);

    this._messageService
      .getChatMessages$(this.chatId(), {
        page: this.defaultPage,
        pageSize: this.defaultPageSize,
        searchTerm: clearSearch ? null : this.searchTerm(),
      })
      .pipe(
        tap((res) => {
          if (!res.isSuccess) return;
          this._messageStoreService.setMessagesForChat(this.chatId(), res.items);
        }),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe();
  }
}
