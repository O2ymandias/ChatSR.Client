import { MessageResponse } from './message.model';

export type ChatResponse = {
  chatId: string;
  name: string | null;
  isGroup: boolean;
  createdAt: string;
  DisplayPictureUrl: string | null;
};

export type ChatListResponse = {
  chatId: string;
  name: string;
  isGroup: boolean;
  createdAt: string;
  memberCount: number;
  lastMessage: MessageResponse | null;
  DisplayPictureUrl: string | null;
};
