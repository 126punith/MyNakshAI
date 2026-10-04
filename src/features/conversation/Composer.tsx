import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { useConversationStore } from './store';

export function Composer() {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const replyingToId = useConversationStore(state => state.replyingToId);
  const quoted = useConversationStore(state =>
    replyingToId ? state.byId[replyingToId] : undefined,
  );
  const send = useConversationStore(state => state.send);
  const setReplyingTo = useConversationStore(state => state.setReplyingTo);

  const onSend = () => {
    const value = text.trim();
    if (!value) {
      return;
    }
    setText('');
    send(value).catch(() => undefined);
  };

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {quoted ? (
        <View style={styles.preview}>
          <Text style={styles.previewText} numberOfLines={1}>
            {quoted.text}
          </Text>
          <Pressable onPress={() => setReplyingTo(null)} hitSlop={8}>
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>
        </View>
      ) : null}
      <View style={styles.row}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Ask about your chart"
          placeholderTextColor={theme.muted}
          style={styles.input}
        />
        <Pressable onPress={onSend} style={styles.send}>
          <Text style={styles.sendLabel}>Send</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: 1,
    borderTopColor: theme.line,
    backgroundColor: theme.surface,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: theme.chip,
  },
  previewText: {
    flex: 1,
    color: theme.ink,
    marginRight: 8,
  },
  cancel: {
    color: theme.accent,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: theme.bg,
    color: theme.ink,
    fontSize: 16,
  },
  send: {
    marginLeft: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sendLabel: {
    color: theme.user,
    fontWeight: '700',
    fontSize: 16,
  },
});
