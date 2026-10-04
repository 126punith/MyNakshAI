import { useEffect } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { theme } from '../../theme';
import { Composer } from './Composer';
import { MessageList } from './MessageList';
import { useConversationStore } from './store';

export function ConversationScreen() {
  const status = useConversationStore(state => state.status);
  const count = useConversationStore(state => state.order.length);
  const load = useConversationStore(state => state.load);

  useEffect(() => {
    load().catch(() => undefined);
  }, [load]);

  if (status === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.accent} />
        <Text style={styles.message}>Loading conversation...</Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>Unable to load conversation.</Text>
        <Pressable onPress={() => load().catch(() => undefined)} style={styles.retry}>
          <Text style={styles.retryLabel}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {count === 0 ? (
        <View style={styles.center}>
          <Text style={styles.message}>Start your conversation.</Text>
        </View>
      ) : (
        <MessageList />
      )}
      <Composer />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.bg,
    padding: 24,
  },
  message: {
    marginTop: 12,
    color: theme.ink,
    fontSize: 16,
    textAlign: 'center',
  },
  retry: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: theme.ink,
  },
  retryLabel: {
    color: theme.userText,
    fontWeight: '600',
  },
});
