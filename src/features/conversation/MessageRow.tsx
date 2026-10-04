import { memo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { RecommendationCarousel } from '../recommendations/RecommendationCarousel';
import { theme } from '../../theme';
import { ActionSheet } from './ActionSheet';
import { FeedbackBar } from './FeedbackBar';
import { useConversationStore } from './store';
import type { Message } from './types';

type Props = {
  id: string;
  grouped: boolean;
};

export const MessageRow = memo(function Row({ id, grouped }: Props) {
  const message = useConversationStore(state => state.byId[id]);
  if (!message) {
    return null;
  }
  if (message.type === 'system') {
    return <SystemEvent text={message.text} />;
  }
  if (message.type === 'ai') {
    return <AiMessage message={message} grouped={grouped} />;
  }
  return <ChatBubble message={message} grouped={grouped} />;
});

function SystemEvent({ text }: { text: string }) {
  return <Text style={styles.system}>{text}</Text>;
}

function ChatBubble({
  message,
  grouped,
}: {
  message: Message;
  grouped: boolean;
}) {
  const mine = message.type === 'user';
  return (
    <View
      style={[styles.block, grouped && styles.grouped, mine && styles.mine]}
    >
      {grouped ? null : (
        <Text style={[styles.role, mine && styles.roleMine]}>
          {mine ? 'You' : 'Astrologer'}
        </Text>
      )}
      <View
        style={[styles.bubble, mine ? styles.userBubble : styles.humanBubble]}
      >
        <Quote replyToId={message.replyToId} light={mine} />
        <Text style={[styles.body, mine && styles.userBody]}>
          {message.text}
        </Text>
      </View>
      <StatusLine message={message} />
    </View>
  );
}

function AiMessage({
  message,
  grouped,
}: {
  message: Message;
  grouped: boolean;
}) {
  const [open, setOpen] = useState(false);
  const setReplyingTo = useConversationStore(state => state.setReplyingTo);
  const remove = useConversationStore(state => state.remove);

  return (
    <View style={[styles.block, grouped && styles.grouped]}>
      {grouped ? null : <Text style={styles.role}>AI Astrologer</Text>}
      <Pressable
        onLongPress={() => setOpen(true)}
        style={[styles.bubble, styles.aiBubble]}
      >
        <Text style={styles.body}>{message.text}</Text>
      </Pressable>
      {message.recommendations?.length ? (
        <View style={styles.cards}>
          <RecommendationCarousel items={message.recommendations} />
        </View>
      ) : null}
      <FeedbackBar message={message} />
      <ActionSheet
        visible={open}
        onClose={() => setOpen(false)}
        onReply={() => {
          setReplyingTo(message.id);
          setOpen(false);
        }}
        onCopy={() => {
          Clipboard.setString(message.text);
          setOpen(false);
        }}
        onDelete={() => {
          setOpen(false);
          remove(message.id);
        }}
      />
    </View>
  );
}

function Quote({
  replyToId,
  light,
}: {
  replyToId?: string | null;
  light?: boolean;
}) {
  const quoted = useConversationStore(state =>
    replyToId ? state.byId[replyToId] : undefined,
  );
  if (!quoted) {
    return null;
  }
  return (
    <Text style={[styles.quote, light && styles.quoteLight]} numberOfLines={2}>
      {quoted.text}
    </Text>
  );
}

function StatusLine({ message }: { message: Message }) {
  const retry = useConversationStore(state => state.retry);
  if (message.type !== 'user') {
    return null;
  }
  if (message.status === 'sending') {
    return <Text style={styles.status}>Sending...</Text>;
  }
  if (message.status === 'sent') {
    if (!message.id.startsWith('local-')) {
      return null;
    }
    return <Text style={styles.status}>Sent</Text>;
  }
  return (
    <View style={styles.statusRow}>
      <Text style={styles.failed}>Failed</Text>
      <Pressable
        onPress={() => retry(message.id).catch(() => undefined)}
        hitSlop={8}
      >
        <Text style={styles.retry}>Retry</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    marginTop: 12,
    maxWidth: '88%',
    alignSelf: 'flex-start',
  },
  grouped: {
    marginTop: 4,
  },
  mine: {
    alignSelf: 'flex-end',
  },
  role: {
    marginBottom: 4,
    color: theme.muted,
    fontSize: 12,
  },
  roleMine: {
    textAlign: 'right',
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: theme.user,
  },
  humanBubble: {
    backgroundColor: theme.human,
  },
  aiBubble: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.line,
  },
  cards: {
    flexGrow: 0,
  },
  body: {
    color: theme.ink,
    fontSize: 16,
    lineHeight: 22,
  },
  userBody: {
    color: theme.userText,
  },
  quote: {
    marginBottom: 6,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: theme.accent,
    color: theme.muted,
    fontSize: 13,
  },
  quoteLight: {
    borderLeftColor: theme.userText,
    color: theme.userText,
  },
  status: {
    marginTop: 4,
    color: theme.muted,
    fontSize: 12,
    textAlign: 'right',
  },
  statusRow: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  failed: {
    color: theme.danger,
    fontSize: 12,
  },
  retry: {
    marginLeft: 8,
    color: theme.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  system: {
    marginTop: 12,
    textAlign: 'center',
    color: theme.muted,
    fontSize: 13,
  },
});
