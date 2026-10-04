import type { Message, SendResult } from '../features/conversation/types';

const HOST = 'http://10.0.2.2:3001';

export const SIMULATE_LOAD_FAILURE = false;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function fetchConversation(): Promise<Message[]> {
  const query = SIMULATE_LOAD_FAILURE ? '?fail=1' : '';
  const path = `/conversation${query}`;
  console.log(`[api] GET ${path}`);
  let response: Response;
  try {
    response = await fetch(`${HOST}${path}`);
  } catch (error) {
    console.log(`[api] GET ${path} failed ${errorMessage(error)}`);
    throw error;
  }
  console.log(`[api] GET ${path} ${response.status}`);
  if (!response.ok) {
    throw new Error('Unable to load conversation.');
  }
  return (await response.json()) as Message[];
}

export async function postMessage(input: {
  clientId: string;
  text: string;
  replyToId: string | null;
  birthDate?: string;
  topic?: string;
}): Promise<SendResult> {
  const path = '/messages';
  console.log(
    `[api] POST ${path} clientId=${input.clientId} replyToId=${String(input.replyToId)} text=${JSON.stringify(input.text)} birthDate=${input.birthDate ?? 'none'} topic=${input.topic ?? 'none'}`,
  );
  let response: Response;
  try {
    response = await fetch(`${HOST}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  } catch (error) {
    console.log(`[api] POST ${path} failed ${errorMessage(error)}`);
    throw error;
  }
  console.log(`[api] POST ${path} ${response.status}`);
  if (!response.ok) {
    throw new Error('Send failed');
  }
  const body = (await response.json()) as SendResult;
  const aiMessages =
    body.aiMessages && body.aiMessages.length > 0
      ? body.aiMessages
      : [body.aiMessage];
  return { ...body, aiMessages };
}
