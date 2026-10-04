import { useEffect, useMemo, useRef } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';
import { MessageRow } from './MessageRow';
import { useConversationStore } from './store';
import { buildTimeline, type TimelineItem } from './timeline';

export function MessageList() {
  const order = useConversationStore(state => state.order);
  const byId = useConversationStore(state => state.byId);
  const list = useRef<FlatList<TimelineItem>>(null);
  const previousCount = useRef(order.length);
  const latestId = order[order.length - 1];
  const latest = latestId ? byId[latestId] : undefined;
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

  useEffect(() => {
    if (latest?.type === 'user' && latest.status === 'failed') {
      list.current?.scrollToOffset({ offset: 0, animated: true });
    }
  }, [latestId, latest?.type, latest?.status]);

  return (
    <View style={styles.list}>
      <FlatList
        ref={list}
        inverted
        style={styles.list}
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
      {data.length === 0 ? (
        <View pointerEvents="none" style={styles.emptyWrap}>
          <Text style={styles.empty}>Start your conversation.</Text>
        </View>
      ) : null}
    </View>
  );
}

function DateSeparator({ label }: { label: string }) {
  return <Text style={styles.separator}>{label}</Text>;
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  emptyWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  empty: {
    color: theme.ink,
    fontSize: 16,
    textAlign: 'center',
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
