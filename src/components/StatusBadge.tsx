import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ComplaintStatus } from '../types';
import { StatusColors } from '../theme/colors';

interface Props {
  status: ComplaintStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const color = StatusColors[status as ComplaintStatus] || {
    bg: '#f1f5f9',
    text: '#475569',
    border: '#cbd5e1',
  };

  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: color.bg, borderColor: color.border },
        isSm && styles.badgeSm,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color.text }]} />
      <Text style={[styles.label, { color: color.text }, isSm && styles.labelSm]}>
        {status}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  labelSm: {
    fontSize: 11,
  },
});
