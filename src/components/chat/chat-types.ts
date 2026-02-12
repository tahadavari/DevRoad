export type ChatMessageType = "TEXT" | "IMAGE" | "VOICE" | "VIDEO";

export interface ChatUser {
  id: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export interface ReplyToMessage {
  id: string;
  content: string;
  type: ChatMessageType;
  senderId: string;
  sender?: { firstName: string; lastName: string };
}

export interface ChatMessageRow {
  id: string;
  conversationId: string;
  senderId: string;
  type: ChatMessageType;
  content: string;
  fileUrl: string | null;
  replyToId: string | null;
  readAt: string | null;
  createdAt: string;
  sender: ChatUser;
  replyTo: ReplyToMessage | null;
}

export interface ConversationListItem {
  id: string;
  userId: string;
  mentorId: string;
  other: ChatUser;
  lastMessage: {
    id: string;
    content: string;
    type: ChatMessageType;
    createdAt: string;
    sender: ChatUser;
  } | null;
  updatedAt: string;
}

export interface ConversationDetail {
  id: string;
  userId: string;
  mentorId: string;
  user: ChatUser;
  mentor: ChatUser;
  createdAt: string;
}
