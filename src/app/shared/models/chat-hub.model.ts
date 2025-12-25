export type MessageResponse = {
  messageId: string;
  chatId: string;
  content: string;
  sentAt: Date;
  isEdited: boolean;
  editedAt?: Date;
  senderId: string;
  senderDisplayName: string;
  senderPictureUrl?: string;
};
