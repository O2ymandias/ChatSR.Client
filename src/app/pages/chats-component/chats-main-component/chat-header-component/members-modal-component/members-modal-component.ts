import { Component, computed, EventEmitter, inject, input, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { ChatMemberResponse } from '../../../../../shared/models/chats.model';
import { ChatHubService } from '../../../../../core/services/chat-hub-service';
import { TitleCasePipe } from '@angular/common';
import { AuthService } from '../../../../../core/services/auth-service';
export interface Member {
  id: number;
  name: string;
  initials: string;
  avatarColor: string;
  status: MemberStatus;
  statusLabel: string;
  role: MemberRole;
}

export type MemberStatus = 'online' | 'away' | 'offline';
export type MemberRole = 'admin' | 'mod' | 'member';

@Component({
  selector: 'app-members-modal-component',
  imports: [
    FormsModule,
    DialogModule,
    AvatarModule,
    BadgeModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
    TagModule,
    DividerModule,
    RippleModule,
    TooltipModule,
    TitleCasePipe,
  ],
  templateUrl: './members-modal-component.html',
  styleUrl: './members-modal-component.css',
})
export class MembersModalComponent {
  private readonly _authService = inject(AuthService);
  private readonly _chatHubService = inject(ChatHubService);

  groupName = input.required<string>();

  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  chatMembers = input.required<ChatMemberResponse[]>();

  onlineUsersIds = this._chatHubService.onlineUsers;

  onlineMembers = computed(() => {
    const chatMembers = this.chatMembers();
    const onlineUsersIds = this.onlineUsersIds();
    const currentUserId = this.currentUserId();

    const currentUser = chatMembers.find((m) => m.userId === currentUserId);
    const onlineMembers = chatMembers.filter((m) => onlineUsersIds.includes(m.userId));

    if (currentUser) onlineMembers.unshift(currentUser); // add current user to online members list

    return onlineMembers;
  });

  offlineMembers = computed(() => {
    const chatMembers = this.chatMembers();
    const onlineUsersIds = this.onlineUsersIds();
    const currentUserId = this.currentUserId();

    const currentUser = chatMembers.find((m) => m.userId === currentUserId);

    const offlineMembers = chatMembers
      .filter((m) => m.userId !== currentUserId) // exclude current user from offline members list
      .filter((m) => !onlineUsersIds.includes(m.userId));

    return offlineMembers;
  });

  currentUserId = computed(
    () =>
      this._authService.userInfo()?.[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ],
  );

  searchQuery = '';

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
