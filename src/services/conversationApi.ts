import type { Message, SendResult } from '../features/conversation/types';

const HOST = 'http://10.0.2.2:3001';

export const SIMULATE_LOAD_FAILURE = false;

export async function fetchConversation(): Promise<Message[]> {
  const query = SIMULATE_LOAD_FAILURE ? '?fail=1' : '';
  const response = await fetch(`${HOST}/conversation${query}`);
  if (!response.ok) {
    throw new Error('Unable to load conversation.');
  }
  return (await response.json()) as Message[];
}

export async function postMessage(input: {
  clientId: string;
  text: string;
  replyToId: string | null;
}): Promise<SendResult> {
  const response = await fetch(`${HOST}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error('Send failed');
  }
  return (await response.json()) as SendResult;
}
