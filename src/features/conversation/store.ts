import { create } from 'zustand';
import { fetchConversation, postMessage } from '../../services/conversationApi';
import { readConversation, writeConversation } from './storage';
import type { DislikeReason, Feedback, Message } from './types';

type ScreenStatus = 'loading' | 'ready' | 'error';

type ConversationState = {
  status: ScreenStatus;
  byId: Record<string, Message>;
  order: string[];
  replyingToId: string | null;
  load: () => Promise<void>;
  send: (text: string) => Promise<void>;
  retry: (id: string) => Promise<void>;
  remove: (id: string) => void;
  setReplyingTo: (id: string | null) => void;
  setFeedback: (id: string, value: 'like' | 'dislike') => void;
  toggleReason: (id: string, reason: DislikeReason) => void;
};

type StoreGet = () => ConversationState;
type StoreSet = (
  partial:
    | Partial<ConversationState>
    | ((state: ConversationState) => Partial<ConversationState>),
) => void;

function save(byId: Record<string, Message>, order: string[]) {
  writeConversation({ byId, order });
}

async function deliver(get: StoreGet, set: StoreSet, clientId: string) {
  const current = get().byId[clientId];
  if (!current) {
    return;
  }
  if (current.status !== 'sending') {
    const byId = {
      ...get().byId,
      [clientId]: { ...current, status: 'sending' as const },
    };
    set({ byId });
    save(byId, get().order);
  }

  try {
    const result = await postMessage({
      clientId,
      text: current.text,
      replyToId: current.replyToId ?? null,
    });
    const nextById = {
      ...get().byId,
      [clientId]: {
        ...result.userMessage,
        status: 'sent' as const,
        replyToId: current.replyToId ?? null,
      },
      [result.aiMessage.id]: { ...result.aiMessage, status: 'sent' as const },
    };
    const order = get().order.includes(result.aiMessage.id)
      ? get().order
      : [...get().order, result.aiMessage.id];
    set({ byId: nextById, order });
    save(nextById, order);
  } catch {
    const message = get().byId[clientId];
    if (!message) {
      return;
    }
    const byId = {
      ...get().byId,
      [clientId]: { ...message, status: 'failed' as const },
    };
    set({ byId });
    save(byId, get().order);
  }
}

const cached = readConversation();

export const useConversationStore = create<ConversationState>((set, get) => ({
  status: cached ? 'ready' : 'loading',
  byId: cached?.byId ?? {},
  order: cached?.order ?? [],
  replyingToId: null,

  load: async () => {
    const stored = readConversation();
    if (stored) {
      set({ status: 'ready', byId: stored.byId, order: stored.order });
      return;
    }
    set({ status: 'loading' });
    try {
      const messages = await fetchConversation();
      const byId: Record<string, Message> = {};
      const order: string[] = [];
      for (const message of messages) {
        byId[message.id] = message;
        order.push(message.id);
      }
      save(byId, order);
      set({ status: 'ready', byId, order });
    } catch {
      set({ status: 'error' });
    }
  },

  send: async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }
    const clientId = `local-${Date.now()}`;
    const replyToId = get().replyingToId;
    const optimistic: Message = {
      id: clientId,
      type: 'user',
      text: trimmed,
      createdAt: new Date().toISOString(),
      status: 'sending',
      replyToId,
    };
    const byId = { ...get().byId, [clientId]: optimistic };
    const order = [...get().order, clientId];
    set({ byId, order, replyingToId: null });
    save(byId, order);
    await deliver(get, set, clientId);
  },

  retry: async (id: string) => {
    const message = get().byId[id];
    if (!message || message.status !== 'failed') {
      return;
    }
    await deliver(get, set, id);
  },

  remove: (id: string) => {
    const byId = { ...get().byId };
    delete byId[id];
    const order = get().order.filter(item => item !== id);
    const replyingToId = get().replyingToId === id ? null : get().replyingToId;
    set({ byId, order, replyingToId });
    save(byId, order);
  },

  setReplyingTo: (id: string | null) => set({ replyingToId: id }),

  setFeedback: (id: string, value: 'like' | 'dislike') => {
    const message = get().byId[id];
    if (!message) {
      return;
    }
    const current = message.feedback?.vote ?? null;
    const vote = current === value ? null : value;
    const feedback: Feedback = {
      vote,
      reasons: vote === 'dislike' ? message.feedback?.reasons ?? [] : [],
    };
    const byId = { ...get().byId, [id]: { ...message, feedback } };
    set({ byId });
    save(byId, get().order);
  },

  toggleReason: (id: string, reason: DislikeReason) => {
    const message = get().byId[id];
    if (!message || message.feedback?.vote !== 'dislike') {
      return;
    }
    const reasons = message.feedback.reasons.includes(reason)
      ? message.feedback.reasons.filter(item => item !== reason)
      : [...message.feedback.reasons, reason];
    const byId = {
      ...get().byId,
      [id]: { ...message, feedback: { vote: 'dislike' as const, reasons } },
    };
    set({ byId });
    save(byId, get().order);
  },
}));
