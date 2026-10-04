import type { Message } from './types';

export type TimelineItem =
  | { kind: 'separator'; id: string; label: string }
  | { kind: 'message'; id: string; grouped: boolean };

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

export function formatDay(iso: string) {
  const date = new Date(iso);
  const diff = startOfDay(new Date()) - startOfDay(date);
  if (diff === 0) {
    return 'Today';
  }
  if (diff === DAY_MS) {
    return 'Yesterday';
  }
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function buildTimeline(
  order: string[],
  byId: Record<string, Message>,
): TimelineItem[] {
  const items: TimelineItem[] = [];
  let lastDay = '';
  let lastAuthor = '';

  for (const id of order) {
    const message = byId[id];
    if (!message) {
      continue;
    }
    const date = new Date(message.createdAt);
    const day = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    if (day !== lastDay) {
      items.push({
        kind: 'separator',
        id: `day-${day}`,
        label: formatDay(message.createdAt),
      });
      lastDay = day;
      lastAuthor = '';
    }
    const grouped = message.type !== 'system' && message.type === lastAuthor;
    items.push({ kind: 'message', id, grouped });
    lastAuthor = message.type;
  }

  return items;
}
