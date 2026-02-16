import { MessageResponse } from './message.model';

export type ChatResponse = {
  chatId: string;
  name: string | null;
  isGroup: boolean;
  createdAt: string;
  displayPictureUrl: string | null;
};

export type ChatListResponse = {
  chatId: string;
  name: string;
  isGroup: boolean;
  createdAt: string;
  memberCount: number;
  lastMessage: MessageResponse | null;
  displayPictureUrl: string | null;
  unreadCount: number;
};

export type ChatMemberResponse = {
  chatId: string;
  userId: string;
  displayName: string;
  pictureUrl: string | null;
  role: string;
  joinedAt: string;
};
