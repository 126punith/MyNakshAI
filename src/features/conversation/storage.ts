import { createMMKV } from 'react-native-mmkv';
import type { ConversationSnapshot } from './types';

const KEY = 'conversation.v1';
const db = createMMKV({ id: 'mynaksh.conversation' });

export function readConversation(): ConversationSnapshot | null {
  const raw = db.getString(KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as ConversationSnapshot;
    if (
      !parsed ||
      typeof parsed.byId !== 'object' ||
      !Array.isArray(parsed.order)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeConversation(snapshot: ConversationSnapshot) {
  db.set(KEY, JSON.stringify(snapshot));
}

export function clearConversation() {
  db.remove(KEY);
}
