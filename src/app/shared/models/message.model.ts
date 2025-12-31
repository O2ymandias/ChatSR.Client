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
};
