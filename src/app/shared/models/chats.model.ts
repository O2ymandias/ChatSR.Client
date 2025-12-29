import { MessageResponse } from './chat-hub.model';

export type ChatListResponse = {
  chatId: string;
  name: string;
  isGroup: boolean;
  createdAt: string;
  memberCount: number;
  lastMessage: MessageResponse | null;
  DisplayPictureUrl: string | null;
};
