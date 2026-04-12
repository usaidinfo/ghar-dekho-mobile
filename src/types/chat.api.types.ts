/**
 * Shapes from GET /api/chat/sessions, GET messages, POST session, Socket `chat:message`.
 */

export type MessageType =
  | 'TEXT'
  | 'IMAGE'
  | 'VIDEO'
  | 'DOCUMENT'
  | 'LOCATION'
  | 'PROPERTY_LINK'
  | 'VOICE_NOTE';

export interface ChatProfileSnippet {
  firstName: string | null;
  lastName: string | null;
  profileImage: string | null;
}

export interface ChatUserSnippet {
  id: string;
  profile: ChatProfileSnippet | null;
}

export interface ChatSessionProperty {
  id: string;
  title: string;
  price: number;
  images: { thumbnailUrl: string | null }[];
}

export interface ChatLastMessage {
  content: string;
  messageType: MessageType;
  createdAt: string;
  isRead: boolean;
  senderId: string;
}

/** Row from GET /api/chat/sessions (includes server-added otherUser + unreadCount) */
export interface ChatSessionRow {
  id: string;
  user1Id: string;
  user2Id: string;
  propertyId: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
  property: ChatSessionProperty | null;
  messages: ChatLastMessage[];
  user1: ChatUserSnippet;
  user2: ChatUserSnippet;
  unreadCount: number;
  otherUser: ChatUserSnippet;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  content: string;
  messageType: MessageType;
  mediaUrl: string | null;
  isRead: boolean;
  readAt: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  sender: ChatUserSnippet;
}
