import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PriorityLevel } from '../types';
import { PriorityColors } from '../theme/colors';

interface Props {
  priority: PriorityLevel | string;
  urgency?: number;
}

export const PriorityBadge: React.FC<Props> = ({ priority, urgency }) => {
  const p = (priority as PriorityLevel) || 'Medium';
  const color = PriorityColors[p] || PriorityColors.Medium;

  return (
    <View style={[styles.badge, { backgroundColor: color.bg, borderColor: color.border }]}>
      <View style={[styles.dot, { backgroundColor: color.dot }]} />
      <Text style={[styles.label, { color: color.text }]}>{p}</Text>
      {typeof urgency === 'number' && (
        <Text style={[styles.urgency, { color: color.text }]}> • {urgency}/100</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 16,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 5,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
  urgency: {
    fontSize: 11,
    fontWeight: '500',
  },
});
