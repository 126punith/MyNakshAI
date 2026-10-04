import type { ComponentType } from 'react';
import { theme } from '../../theme';
import type { Recommendation } from './types';

export type RecommendationCardProps = {
  recommendation: Recommendation;
  descriptor: RecommendationDescriptor;
  onPress: () => void;
};

export type RecommendationDescriptor = {
  accent: string;
  icon: string;
  Card?: ComponentType<RecommendationCardProps>;
};

const registry = new Map<string, RecommendationDescriptor>();

const fallback: RecommendationDescriptor = {
  accent: theme.fallback,
  icon: '✦',
};

export function register(type: string, descriptor: RecommendationDescriptor) {
  registry.set(type, descriptor);
}

export function resolve(type: string): RecommendationDescriptor {
  return registry.get(type) ?? fallback;
}

register('gemstone', { accent: '#1d4e89', icon: '💎' });
register('tarot', { accent: '#6b3fa0', icon: '🔮' });
register('consultation', { accent: '#0f6e56', icon: '👨‍🏫' });
register('article', { accent: '#8a5a2a', icon: '📖' });
register('promotion', { accent: '#9b3a2f', icon: '🎁' });
register('panchang', { accent: '#3d5a40', icon: '📅' });
