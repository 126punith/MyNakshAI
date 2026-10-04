import { useEffect, useMemo, useRef } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import { theme } from '../../theme';
import { MessageRow } from './MessageRow';
import { useConversationStore } from './store';
import { buildTimeline, type TimelineItem } from './timeline';

export function MessageList() {
  const order = useConversationStore(state => state.order);
  const byId = useConversationStore(state => state.byId);
  const list = useRef<FlatList<TimelineItem>>(null);
  const previousCount = useRef(order.length);
  const data = useMemo(
    () => buildTimeline(order, byId).slice().reverse(),
    [order, byId],
  );

  useEffect(() => {
    if (order.length > previousCount.current) {
      list.current?.scrollToOffset({ offset: 0, animated: true });
    }
    previousCount.current = order.length;
  }, [order.length]);

  return (
    <FlatList
      ref={list}
      inverted
      data={data}
      keyExtractor={item => item.id}
      renderItem={({ item }) =>
        item.kind === 'separator' ? (
          <DateSeparator label={item.label} />
        ) : (
          <MessageRow id={item.id} grouped={item.grouped} />
        )
      }
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    />
  );
}

function DateSeparator({ label }: { label: string }) {
  return <Text style={styles.separator}>{label}</Text>;
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  separator: {
    marginTop: 12,
    textAlign: 'center',
    color: theme.muted,
    fontSize: 12,
    fontWeight: '600',
  },
});

export type { TimelineItem };
