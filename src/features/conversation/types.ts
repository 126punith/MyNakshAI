import type { Recommendation } from '../recommendations/types';

export type MessageRole = 'user' | 'ai' | 'human' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'failed';
export type DislikeReason =
  | 'inaccurate'
  | 'too_generic'
  | 'didnt_help'
  | 'too_long';

export type Feedback = {
  vote: 'like' | 'dislike' | null;
  reasons: DislikeReason[];
};

export type Message = {
  id: string;
  type: MessageRole;
  text: string;
  createdAt: string;
  status: MessageStatus;
  replyToId?: string | null;
  recommendations?: Recommendation[];
  feedback?: Feedback;
};

export type ConversationSnapshot = {
  byId: Record<string, Message>;
  order: string[];
};

export type SendResult = {
  userMessage: Message;
  aiMessage: Message;
  aiMessages?: Message[];
};
