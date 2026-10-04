import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { theme } from '../../theme';
import type { DislikeReason, Message } from './types';
import { useConversationStore } from './store';

const REASONS: { id: DislikeReason; label: string }[] = [
  { id: 'inaccurate', label: 'Inaccurate' },
  { id: 'too_generic', label: 'Too Generic' },
  { id: 'didnt_help', label: "Didn't Help" },
  { id: 'too_long', label: 'Too Long' },
];

type Props = {
  message: Message;
};

export function FeedbackBar({ message }: Props) {
  const setFeedback = useConversationStore(state => state.setFeedback);
  const toggleReason = useConversationStore(state => state.toggleReason);
  const vote = message.feedback?.vote ?? null;
  const selected = message.feedback?.reasons ?? [];

  return (
    <View style={styles.wrap}>
      <View style={styles.votes}>
        <Pressable onPress={() => setFeedback(message.id, 'like')} hitSlop={6}>
          <Text style={[styles.vote, vote === 'like' && styles.voteOn]}>
            👍 Like
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setFeedback(message.id, 'dislike')}
          hitSlop={6}
        >
          <Text style={[styles.vote, vote === 'dislike' && styles.voteOn]}>
            👎 Dislike
          </Text>
        </Pressable>
      </View>
      {vote === 'dislike' ? (
        <Animated.View entering={FadeIn.duration(180)} style={styles.chips}>
          {REASONS.map(reason => {
            const on = selected.includes(reason.id);
            return (
              <Pressable
                key={reason.id}
                onPress={() => toggleReason(message.id, reason.id)}
                style={[styles.chip, on && styles.chipOn]}
              >
                <Text style={[styles.chipLabel, on && styles.chipLabelOn]}>
                  {reason.label}
                </Text>
              </Pressable>
            );
          })}
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
  },
  votes: {
    flexDirection: 'row',
  },
  vote: {
    marginRight: 16,
    color: theme.muted,
    fontSize: 13,
  },
  voteOn: {
    color: theme.ink,
    fontWeight: '700',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: theme.chip,
  },
  chipOn: {
    backgroundColor: theme.ink,
  },
  chipLabel: {
    color: theme.ink,
    fontSize: 13,
  },
  chipLabelOn: {
    color: theme.userText,
  },
});
