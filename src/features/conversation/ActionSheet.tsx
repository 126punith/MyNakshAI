import { Modal, Pressable, StyleSheet, Text } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { theme } from '../../theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onReply: () => void;
  onCopy: () => void;
  onDelete: () => void;
};

export function ActionSheet({
  visible,
  onClose,
  onReply,
  onCopy,
  onDelete,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View entering={SlideInDown.duration(180)}>
          <Pressable style={styles.sheet} onPress={() => undefined}>
            <Action label="Reply" onPress={onReply} />
            <Action label="Copy" onPress={onCopy} />
            <Action label="Delete" onPress={onDelete} danger />
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

function Action({
  label,
  onPress,
  danger,
}: {
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={styles.action}>
      <Text style={[styles.label, danger && styles.danger]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(28, 25, 21, 0.35)',
  },
  sheet: {
    margin: 12,
    borderRadius: 16,
    backgroundColor: theme.surface,
    overflow: 'hidden',
  },
  action: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.line,
  },
  label: {
    fontSize: 17,
    color: theme.ink,
    textAlign: 'center',
  },
  danger: {
    color: theme.danger,
  },
});
