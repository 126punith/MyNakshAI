import { Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '../../theme';
import type { RecommendationCardProps } from './registry';

export function RecommendationCard({
  recommendation,
  descriptor,
  onPress,
}: RecommendationCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { borderColor: descriptor.accent }]}
    >
      <Text style={styles.icon}>{descriptor.icon}</Text>
      <Text style={styles.title}>{recommendation.title}</Text>
      {recommendation.subtitle ? (
        <Text style={styles.subtitle}>{recommendation.subtitle}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 168,
    marginRight: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: theme.surface,
  },
  icon: {
    fontSize: 20,
    marginBottom: 8,
  },
  title: {
    color: theme.ink,
    fontSize: 15,
    fontWeight: '600',
  },
  subtitle: {
    color: theme.muted,
    fontSize: 13,
    marginTop: 4,
  },
});
