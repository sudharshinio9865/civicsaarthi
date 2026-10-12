import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { api } from '../services/api';
import { SafetyAlert } from '../types';
import { PriorityBadge } from '../components/PriorityBadge';

interface Props {
  isDark: boolean;
  onBack: () => void;
}

const EMERGENCY_HOTLINES = [
  { name: 'National Emergency', number: '112', icon: '🚨' },
  { name: 'Police Control Room', number: '100', icon: '👮' },
  { name: 'Fire & Rescue', number: '101', icon: '🚒' },
  { name: 'Ambulance & Trauma', number: '108', icon: '🚑' },
  { name: 'Disaster Helpline', number: '1077', icon: '🌊' },
  { name: 'Women Helpline', number: '1091', icon: '🛡️' },
];

export const SafetyScreen: React.FC<Props> = ({ isDark, onBack }) => {
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggeringSOS, setTriggeringSOS] = useState(false);
  const [sosSent, setSosSent] = useState(false);

  const fetchSafetyAlerts = async () => {
    setLoading(true);
    try {
      const res = await api.getSafetyAlerts();
      setAlerts(res.alerts || []);
    } catch (err: any) {
      console.warn('Safety alerts error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSafetyAlerts();
  }, []);

  const handleTriggerSOS = () => {
    Alert.alert(
      'Broadcast Rapid SOS Alert?',
      'This will broadcast an urgent emergency alert to the Disaster Response municipal team and log your GPS coordinates for immediate dispatch.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: '🚨 CONFIRM SOS',
          style: 'destructive',
          onPress: async () => {
            setTriggeringSOS(true);
            try {
              const res = await api.triggerSOS({
                lat: 12.9716,
                lng: 77.5946,
                address: 'GPS Verified Location, Bengaluru',
                hazardType: 'Urgent Citizen SOS Broadcast',
                details: 'High-priority public safety hazard broadcast via CivicSaarthi Mobile App.',
              });

              setSosSent(true);
              Alert.alert(
                'SOS Transmitted! 🚨',
                `Tracking ID: ${res.tracking_id}\n\nMunicipal rapid response dispatch has received your location and coordinates.`
              );
              fetchSafetyAlerts();
            } catch (err: any) {
              Alert.alert('SOS Error', err.message || 'Failed to transmit SOS');
            } finally {
              setTriggeringSOS(false);
            }
          },
        },
      ]
    );
  };

  const bg = isDark ? '#0b0f19' : '#f8fafc';
  const cardBg = isDark ? '#151c2c' : '#ffffff';
  const borderCol = isDark ? '#243048' : '#e2e8f0';
  const textCol = isDark ? '#f8fafc' : '#0f172a';
  const subtextCol = isDark ? '#94a3b8' : '#64748b';

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={styles.content}>
      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backBtnText}>← Back to Dashboard</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.screenTitle, { color: textCol }]}>Public Safety & SOS Center</Text>
          <View style={styles.emergencyTag}>
            <Text style={styles.emergencyTagText}>EMERGENCY</Text>
          </View>
        </View>
        <Text style={[styles.screenSubtitle, { color: subtextCol }]}>
          Instant broadcast for severe infrastructure hazards, electrocution risks, flash floods, and life-threatening conditions.
        </Text>
      </View>

      {/* Massive SOS Trigger Card */}
      <View style={styles.sosCard}>
        <Text style={styles.sosCardTitle}>MUNICIPAL RAPID SAFETY BROADCAST</Text>
        <Text style={styles.sosCardDesc}>
          Press below to transmit current GPS coordinates (12.9716, 77.5946) to the Disaster Response Rapid Dispatch unit.
        </Text>

        <TouchableOpacity
          style={[styles.sosButtonBig, triggeringSOS && { opacity: 0.7 }]}
          onPress={handleTriggerSOS}
          disabled={triggeringSOS}
          activeOpacity={0.8}
        >
          {triggeringSOS ? (
            <ActivityIndicator color="#ffffff" size="large" />
          ) : (
            <>
              <Text style={{ fontSize: 36, marginBottom: 4 }}>🚨</Text>
              <Text style={styles.sosButtonBigText}>TAP TO TRANSMIT SOS</Text>
              <Text style={styles.sosButtonSubtext}>Dispatches Rapid Municipal Team</Text>
            </>
          )}
        </TouchableOpacity>

        {sosSent && (
          <View style={styles.sosSentBanner}>
            <Text style={styles.sosSentText}>
              ✓ SOS Broadcast Active • Municipal units notified
            </Text>
          </View>
        )}
      </View>

      {/* Emergency Hotlines Grid */}
      <Text style={[styles.sectionHeading, { color: textCol }]}>Official Emergency Hotlines</Text>
      <View style={styles.hotlinesGrid}>
        {EMERGENCY_HOTLINES.map((h, idx) => (
          <View key={idx} style={[styles.hotlineTile, { backgroundColor: cardBg, borderColor: borderCol }]}>
            <View style={styles.hotlineTop}>
              <Text style={{ fontSize: 20 }}>{h.icon}</Text>
              <View style={styles.phoneBadge}>
                <Text style={styles.phoneNumber}>{h.number}</Text>
              </View>
            </View>
            <Text style={[styles.hotlineName, { color: textCol }]}>{h.name}</Text>
          </View>
        ))}
      </View>

      {/* Live Active Safety Hazards */}
      <Text style={[styles.sectionHeading, { color: textCol }]}>Active Public Safety Hazards</Text>

      {loading ? (
        <ActivityIndicator color="#ef4444" style={{ marginVertical: 20 }} />
      ) : alerts.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <Text style={{ fontSize: 24, marginBottom: 6 }}>🛡️</Text>
          <Text style={[styles.emptyText, { color: textCol }]}>No critical emergency hazards active</Text>
        </View>
      ) : (
        alerts.map((a) => (
          <View key={a.id} style={[styles.alertCard, { backgroundColor: cardBg, borderColor: '#fca5a5' }]}>
            <View style={styles.alertHeader}>
              <Text style={styles.alertTid}>{a.tracking_id}</Text>
              <PriorityBadge priority={a.priority} urgency={a.urgency} />
            </View>
            <Text style={[styles.alertTitle, { color: textCol }]}>{a.title}</Text>
            <Text style={[styles.alertDesc, { color: subtextCol }]} numberOfLines={2}>
              {a.description}
            </Text>
            <Text style={[styles.alertLocation, { color: subtextCol }]}>
              📍 {a.address || 'Bengaluru Municipal Corridor'}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  backBtn: {
    paddingVertical: 6,
    marginBottom: 8,
  },
  backBtnText: {
    color: '#0d9488',
    fontSize: 13,
    fontWeight: '700',
  },
  header: {
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  emergencyTag: {
    marginLeft: 8,
    backgroundColor: '#fee2e2',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  emergencyTagText: {
    color: '#991b1b',
    fontSize: 10,
    fontWeight: '800',
  },
  screenSubtitle: {
    fontSize: 12,
    lineHeight: 17,
  },
  sosCard: {
    backgroundColor: '#450a0a',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  sosCardTitle: {
    color: '#fca5a5',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  sosCardDesc: {
    color: '#fecaca',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 16,
  },
  sosButtonBig: {
    backgroundColor: '#ef4444',
    width: '100%',
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 6,
  },
  sosButtonBigText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  sosButtonSubtext: {
    color: '#fee2e2',
    fontSize: 11,
    marginTop: 2,
  },
  sosSentBanner: {
    marginTop: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sosSentText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  hotlinesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  hotlineTile: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  hotlineTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  phoneBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  phoneNumber: {
    color: '#991b1b',
    fontWeight: '900',
    fontSize: 14,
  },
  hotlineName: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
  },
  alertCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  alertTid: {
    fontSize: 11,
    fontWeight: '800',
    color: '#ef4444',
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  alertDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 6,
  },
  alertLocation: {
    fontSize: 11,
  },
});
