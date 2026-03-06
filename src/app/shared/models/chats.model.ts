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
  lastMessageOverview: LastMessageOverview | null;
  displayPictureUrl: string | null;
  unreadCount: number;
};

export type LastMessageOverview = {
  messageId: string;
  senderId: string;
  content: string;
  senderDisplayName: string;
  sentAt: string;
  isRead: boolean;
};

export type ChatMemberResponse = {
  chatId: string;
  userId: string;
  displayName: string;
  pictureUrl: string | null;
  role: 'Admin' | 'Member';
  joinedAt: string;
};
