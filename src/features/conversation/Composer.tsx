import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { useConversationStore } from './store';

const TOPICS = ['Career', 'Love', 'Health', 'Money'] as const;
const BIRTH_QUESTION = 'What is your date of birth?';

function readableDate(date: Date) {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function isoDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function Composer() {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const replyingToId = useConversationStore(state => state.replyingToId);
  const quoted = useConversationStore(state =>
    replyingToId ? state.byId[replyingToId] : undefined,
  );
  const send = useConversationStore(state => state.send);
  const setReplyingTo = useConversationStore(state => state.setReplyingTo);
  const awaitingBirthDate = useConversationStore(state => {
    const id = state.order[state.order.length - 1];
    const message = id ? state.byId[id] : undefined;
    return message?.type === 'ai' && message.text === BIRTH_QUESTION;
  });
  const topic = useConversationStore(state => {
    for (let index = state.order.length - 1; index >= 0; index -= 1) {
      const message = state.byId[state.order[index]];
      if (message?.type === 'user') {
        return message.text;
      }
    }
    return '';
  });
  const [birthDate, setBirthDate] = useState(() => new Date(1990, 0, 1));
  const [pickerOpen, setPickerOpen] = useState(false);

  const value = text.trim();

  const onSend = () => {
    if (!value) {
      return;
    }
    setText('');
    send(value).catch(() => undefined);
  };

  const onPickDate = (event: DateTimePickerEvent, selected?: Date) => {
    setPickerOpen(false);
    if (event.type === 'set' && selected) {
      setBirthDate(selected);
    }
  };

  const confirmBirthDate = () => {
    if (!topic) {
      return;
    }
    send(readableDate(birthDate), {
      birthDate: isoDate(birthDate),
      topic,
    }).catch(() => undefined);
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
      {awaitingBirthDate ? (
        <View style={styles.birthRow}>
          <Pressable onPress={() => setPickerOpen(true)} style={styles.topic}>
            <Text style={styles.topicLabel}>{readableDate(birthDate)}</Text>
          </Pressable>
          <Pressable onPress={confirmBirthDate} style={styles.send}>
            <Text style={styles.sendLabel}>Confirm</Text>
          </Pressable>
        </View>
      ) : null}
      {pickerOpen ? (
        <DateTimePicker
          value={birthDate}
          mode="date"
          maximumDate={new Date()}
          onChange={onPickDate}
        />
      ) : null}
      <View style={styles.topics}>
        {TOPICS.map(label => (
          <Pressable
            key={label}
            onPress={() => send(label).catch(() => undefined)}
            style={styles.topic}
          >
            <Text style={styles.topicLabel}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.row}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Ask about your chart"
          placeholderTextColor={theme.muted}
          style={styles.input}
        />
        <Pressable onPress={onSend} disabled={!value} style={styles.send}>
          <Text style={[styles.sendLabel, !value && styles.sendDisabled]}>
            Send
          </Text>
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
  birthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  topics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  topic: {
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: theme.chip,
  },
  topicLabel: {
    color: theme.ink,
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
  sendDisabled: {
    color: theme.muted,
  },
});
