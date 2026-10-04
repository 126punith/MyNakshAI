import { buildTimeline } from '../src/features/conversation/timeline';
import type { Message } from '../src/features/conversation/types';

function message(partial: Pick<Message, 'id' | 'type' | 'createdAt'>): Message {
  return {
    text: 'text',
    status: 'sent',
    ...partial,
  };
}

test('separates days and groups the same author', () => {
  const byId = {
    a: message({
      id: 'a',
      type: 'user',
      createdAt: '2026-10-03T04:00:00.000Z',
    }),
    b: message({
      id: 'b',
      type: 'user',
      createdAt: '2026-10-03T05:00:00.000Z',
    }),
    c: message({
      id: 'c',
      type: 'ai',
      createdAt: '2026-10-04T05:00:00.000Z',
    }),
  };

  const items = buildTimeline(['a', 'b', 'c'], byId);
  expect(
    items.map(item =>
      item.kind === 'message' ? `${item.id}:${item.grouped}` : item.kind,
    ),
  ).toEqual(['separator', 'a:false', 'b:true', 'separator', 'c:false']);
});
