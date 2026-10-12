import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ComplaintStatus, ComplaintEvent } from '../types';

interface Props {
  status: ComplaintStatus | string;
  events?: ComplaintEvent[];
  isDark?: boolean;
}

const STAGES: Array<{ key: string; label: string }> = [
  { key: 'Submitted', label: 'Submitted' },
  { key: 'Under Review', label: 'Under Review' },
  { key: 'Assigned', label: 'Assigned' },
  { key: 'In Progress', label: 'In Progress' },
  { key: 'Resolved', label: 'Resolved' },
];

export const TimelineStepper: React.FC<Props> = ({ status, events = [], isDark = false }) => {
  const isRejected = status === 'Rejected';
  const isReopened = status === 'Reopened';

  const getStageIndex = (s: string) => {
    switch (s) {
      case 'Submitted':
        return 0;
      case 'Under Review':
        return 1;
      case 'Assigned':
        return 2;
      case 'In Progress':
        return 3;
      case 'Resolved':
        return 4;
      default:
        return 0;
    }
  };

  const currentIndex = getStageIndex(status);

  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const subtextColor = isDark ? '#94a3b8' : '#64748b';
  const lineInactive = isDark ? '#334155' : '#e2e8f0';

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: textColor }]}>Resolution Lifecycle</Text>

      {isRejected && (
        <View style={styles.specialBanner}>
          <Text style={styles.rejectedText}>⚠️ Complaint was reviewed and marked as Rejected</Text>
        </View>
      )}

      {isReopened && (
        <View style={[styles.specialBanner, { backgroundColor: '#f3e8ff' }]}>
          <Text style={[styles.rejectedText, { color: '#7e22ce' }]}>
            🔄 Complaint was Reopened by citizen for further investigation
          </Text>
        </View>
      )}

      <View style={styles.stepperWrap}>
        {STAGES.map((stage, idx) => {
          const isDone = idx < currentIndex || (idx === currentIndex && status === 'Resolved');
          const isCurrent = idx === currentIndex && status !== 'Resolved';
          const isPending = idx > currentIndex;

          // Find event for this stage if available
          const matchingEvent = events.find((e) => e.status === stage.key);

          let circleBg = lineInactive;
          let iconText = `${idx + 1}`;
          let circleBorder = lineInactive;

          if (isDone) {
            circleBg = '#10b981';
            circleBorder = '#059669';
            iconText = '✓';
          } else if (isCurrent) {
            circleBg = '#0d9488';
            circleBorder = '#0f766e';
            iconText = '●';
          }

          return (
            <View key={stage.key} style={styles.stageItem}>
              {/* Left indicator + vertical line */}
              <View style={styles.indicatorCol}>
                <View style={[styles.circle, { backgroundColor: circleBg, borderColor: circleBorder }]}>
                  <Text style={styles.circleText}>{iconText}</Text>
                </View>
                {idx < STAGES.length - 1 && (
                  <View
                    style={[
                      styles.verticalLine,
                      { backgroundColor: isDone ? '#10b981' : lineInactive },
                    ]}
                  />
                )}
              </View>

              {/* Right content */}
              <View style={styles.stageContent}>
                <View style={styles.labelRow}>
                  <Text
                    style={[
                      styles.stageLabel,
                      { color: isCurrent ? '#0d9488' : isDone ? textColor : subtextColor },
                      (isDone || isCurrent) && { fontWeight: '700' },
                    ]}
                  >
                    {stage.label}
                  </Text>
                  {isCurrent && (
                    <View style={styles.activePill}>
                      <Text style={styles.activePillText}>CURRENT</Text>
                    </View>
                  )}
                </View>

                {matchingEvent && (
                  <View style={styles.noteBox}>
                    <Text style={[styles.noteText, { color: textColor }]}>
                      {matchingEvent.note}
                    </Text>
                    {matchingEvent.created_at ? (
                      <Text style={[styles.timeText, { color: subtextColor }]}>
                        {new Date(matchingEvent.created_at).toLocaleString()}
                      </Text>
                    ) : null}
                  </View>
                )}

                {/* Spacing for vertical line */}
                <View style={{ height: idx === STAGES.length - 1 ? 4 : 16 }} />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  heading: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  specialBanner: {
    padding: 10,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    marginBottom: 12,
  },
  rejectedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#b91c1c',
  },
  stepperWrap: {
    paddingLeft: 4,
  },
  stageItem: {
    flexDirection: 'row',
  },
  indicatorCol: {
    alignItems: 'center',
    width: 28,
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  circleText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '700',
  },
  verticalLine: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  stageContent: {
    flex: 1,
    paddingLeft: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  stageLabel: {
    fontSize: 13,
  },
  activePill: {
    backgroundColor: '#ccfbf1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0f766e',
  },
  noteBox: {
    marginTop: 4,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 6,
  },
  noteText: {
    fontSize: 12,
    lineHeight: 16,
  },
  timeText: {
    fontSize: 10,
    marginTop: 2,
  },
});
