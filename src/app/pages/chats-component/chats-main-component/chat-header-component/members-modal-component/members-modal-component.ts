import { Component, EventEmitter, Input, Output } from '@angular/core';
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
import { TitleCasePipe } from '@angular/common';
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
  @Input() visible = false;
  @Input() groupName = 'Design Team';
  @Input() members: Member[] = [
    {
      id: 1,
      name: 'Sara Hossam',
      initials: 'SH',
      avatarColor: 'linear-gradient(135deg,#0d7a45,#128c7e)',
      status: 'online',
      statusLabel: 'Online',
      role: 'admin',
    },
    {
      id: 2,
      name: 'Karim Adel',
      initials: 'KA',
      avatarColor: 'linear-gradient(135deg,#1a4fa0,#2b6cb0)',
      status: 'online',
      statusLabel: 'Online',
      role: 'mod',
    },
    {
      id: 3,
      name: 'Nour Tarek',
      initials: 'NT',
      avatarColor: 'linear-gradient(135deg,#6b21a8,#9333ea)',
      status: 'online',
      statusLabel: 'Typing…',
      role: 'member',
    },
    {
      id: 4,
      name: 'Omar Fathy',
      initials: 'OF',
      avatarColor: 'linear-gradient(135deg,#92400e,#d97706)',
      status: 'away',
      statusLabel: 'Away · 5m ago',
      role: 'member',
    },
    {
      id: 5,
      name: 'Layla Mostafa',
      initials: 'LM',
      avatarColor: 'linear-gradient(135deg,#be185d,#ec4899)',
      status: 'online',
      statusLabel: 'Online',
      role: 'member',
    },
    {
      id: 6,
      name: 'Ahmed Sami',
      initials: 'AS',
      avatarColor: 'linear-gradient(135deg,#374151,#4b5563)',
      status: 'offline',
      statusLabel: 'Last seen 2h ago',
      role: 'member',
    },
    {
      id: 7,
      name: 'Yasmine Khaled',
      initials: 'YK',
      avatarColor: 'linear-gradient(135deg,#374151,#4b5563)',
      status: 'offline',
      statusLabel: 'Last seen yesterday',
      role: 'member',
    },
    {
      id: 8,
      name: 'Hassan Nabil',
      initials: 'HN',
      avatarColor: 'linear-gradient(135deg,#374151,#4b5563)',
      status: 'offline',
      statusLabel: 'Last seen 3d ago',
      role: 'member',
    },
  ];

  @Output() visibleChange = new EventEmitter<boolean>();

  searchQuery = '';

  get onlineMembers(): Member[] {
    return this.members.filter(
      (m) =>
        (m.status === 'online' || m.status === 'away') &&
        m.name.toLowerCase().includes(this.searchQuery.toLowerCase()),
    );
  }

  get offlineMembers(): Member[] {
    return this.members.filter(
      (m) =>
        m.status === 'offline' && m.name.toLowerCase().includes(this.searchQuery.toLowerCase()),
    );
  }

  get onlineCount(): number {
    return this.members.filter((m) => m.status === 'online').length;
  }

  get offlineCount(): number {
    return this.members.filter((m) => m.status === 'offline').length;
  }

  close(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
