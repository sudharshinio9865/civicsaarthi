import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AIAnalysis } from '../types';

interface Props {
  ai: AIAnalysis;
  isDark?: boolean;
}

export const UrgencyGauge: React.FC<Props> = ({ ai, isDark = false }) => {
  const score = Math.min(100, Math.max(0, ai.urgency || 0));

  let gaugeColor = '#10b981'; // Green
  let gaugeBg = '#d1fae5';
  let badgeLabel = 'LOW URGENCY';

  if (score >= 85) {
    gaugeColor = '#ef4444'; // Red
    gaugeBg = '#fee2e2';
    badgeLabel = 'CRITICAL HAZARD';
  } else if (score >= 65) {
    gaugeColor = '#f97316'; // Orange
    gaugeBg = '#ffedd5';
    badgeLabel = 'HIGH URGENCY';
  } else if (score >= 40) {
    gaugeColor = '#eab308'; // Yellow/Amber
    gaugeBg = '#fef9c3';
    badgeLabel = 'MEDIUM ATTENTION';
  }

  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const subtextColor = isDark ? '#94a3b8' : '#64748b';
  const cardBg = isDark ? '#1a2234' : '#f8fafc';
  const borderCol = isDark ? '#2a354c' : '#e2e8f0';

  return (
    <View style={[styles.container, { backgroundColor: cardBg, borderColor: borderCol }]}>
      {ai.emergency ? (
        <View style={styles.emergencyBanner}>
          <Text style={styles.emergencyIcon}>🚨</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.emergencyTitle}>EMERGENCY SAFETY HAZARD DETECTED</Text>
            <Text style={styles.emergencySubtitle}>
              Flagged for immediate rapid-response municipal dispatch.
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: textColor }]}>AI Prioritization Assessment</Text>
          <Text style={[styles.subtitle, { color: subtextColor }]}>
            Target Dept: <Text style={{ fontWeight: '700', color: '#0d9488' }}>{ai.department}</Text>
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: gaugeBg }]}>
          <Text style={[styles.badgeText, { color: gaugeColor }]}>{badgeLabel}</Text>
        </View>
      </View>

      {/* Urgency Progress Bar */}
      <View style={styles.meterContainer}>
        <View style={styles.meterLabels}>
          <Text style={[styles.meterLabel, { color: subtextColor }]}>Urgency Score</Text>
          <Text style={[styles.scoreValue, { color: gaugeColor }]}>{score} / 100</Text>
        </View>
        <View style={[styles.track, { backgroundColor: isDark ? '#334155' : '#e2e8f0' }]}>
          <View
            style={[
              styles.fill,
              {
                width: `${score}%`,
                backgroundColor: gaugeColor,
              },
            ]}
          />
        </View>
      </View>

      {/* AI Summary */}
      {ai.summary ? (
        <View style={[styles.summaryBox, { backgroundColor: isDark ? '#141c2c' : '#ffffff' }]}>
          <Text style={[styles.summaryLabel, { color: subtextColor }]}>AI GENERATED SUMMARY</Text>
          <Text style={[styles.summaryText, { color: textColor }]}>{ai.summary}</Text>
        </View>
      ) : null}

      {/* Factors Breakdown */}
      {Array.isArray(ai.factors) && ai.factors.length > 0 && (
        <View style={styles.factorsBox}>
          <Text style={[styles.factorsTitle, { color: subtextColor }]}>
            Explainable Risk Factors ({ai.factors.length}):
          </Text>
          <View style={styles.factorTagsWrap}>
            {ai.factors.map((factor, idx) => (
              <View
                key={idx}
                style={[
                  styles.factorTag,
                  {
                    backgroundColor: isDark ? '#1e293b' : '#ede9fe',
                    borderColor: isDark ? '#334155' : '#c7d2fe',
                  },
                ]}
              >
                <Text style={[styles.factorTagText, { color: isDark ? '#c7d2fe' : '#4338ca' }]}>
                  {factor}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Engine Transparency */}
      <View style={styles.engineFooter}>
        <Text style={[styles.engineText, { color: subtextColor }]}>
          Analyzed by: <Text style={{ fontWeight: '600' }}>{ai.engine || 'rule-based heuristics fallback'}</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginVertical: 10,
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  emergencyIcon: {
    fontSize: 22,
    marginRight: 8,
  },
  emergencyTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#991b1b',
  },
  emergencySubtitle: {
    fontSize: 11,
    color: '#b91c1c',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  meterContainer: {
    marginBottom: 12,
  },
  meterLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  meterLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  summaryBox: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: '#cbd5e1',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  summaryText: {
    fontSize: 13,
    lineHeight: 18,
  },
  factorsBox: {
    marginBottom: 8,
  },
  factorsTitle: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  factorTagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  factorTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 0.5,
  },
  factorTagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  engineFooter: {
    marginTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: '#e2e8f0',
    paddingTop: 6,
  },
  engineText: {
    fontSize: 10,
    textAlign: 'right',
  },
});
