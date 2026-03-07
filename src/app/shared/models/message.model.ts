export type MessageResponse = {
  messageId: string;
  chatId: string;
  content: string;
  sentAt: string;
  isEdited: boolean;
  editedAt: string | null;
  senderId: string;
  senderDisplayName: string;
  senderPictureUrl: string | null;
  isRead: boolean;
  replyToOverview: ReplyToOverview | null;
};

export type ReplyToOverview = {
  messageId: string;
  content: string;
  senderDisplayName: string;
};

export type MessageType = 'incoming' | 'outgoing';
export type ContextMenuMessage = MessageResponse & {
  messageType: MessageType;
};

export type SendMessageRequest = {
  content: string;
  replyToMessageId?: string;
};

export type EditMessageRequest = {
  newContent: string;
};
