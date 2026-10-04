import { Alert, ScrollView, StyleSheet } from 'react-native';
import { RecommendationCard } from './RecommendationCard';
import { resolve } from './registry';
import type { Recommendation } from './types';

type Props = {
  items: Recommendation[];
};

export function RecommendationCarousel({ items }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {items.map(item => {
        const descriptor = resolve(item.type);
        const Card = descriptor.Card ?? RecommendationCard;
        return (
          <Card
            key={item.id}
            recommendation={item}
            descriptor={descriptor}
            onPress={() => Alert.alert(item.title, item.subtitle ?? item.type)}
          />
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingTop: 8,
    paddingRight: 6,
  },
});
