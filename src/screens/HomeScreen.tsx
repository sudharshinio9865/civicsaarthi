import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { User, Complaint, TabScreen } from '../types';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';

interface Props {
  user: User | null;
  onNavigate: (tab: TabScreen) => void;
  onSelectComplaint: (complaint: Complaint) => void;
  onTrackId: (trackingId: string) => void;
  isDark: boolean;
}

export const HomeScreen: React.FC<Props> = ({
  user,
  onNavigate,
  onSelectComplaint,
  onTrackId,
  isDark,
}) => {
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    resolved: 0,
    critical: 0,
  });
  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
  const [trackingInput, setTrackingInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState('');

  const loadDashboardData = async () => {
    try {
      const res = await api.getComplaints({ size: 20 });
      const rows = res.rows || [];

      const total = res.total || rows.length;
      const inProgress = rows.filter((c) =>
        ['Submitted', 'Under Review', 'Assigned', 'In Progress'].includes(c.status)
      ).length;
      const resolved = rows.filter((c) => c.status === 'Resolved').length;
      const critical = rows.filter((c) => c.priority === 'Critical' || c.emergency).length;

      setStats({ total, inProgress, resolved, critical });
      setRecentComplaints(rows.slice(0, 5));
    } catch (err: any) {
      console.warn('Dashboard load error:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleTrackSubmit = async () => {
    if (!trackingInput.trim()) return;
    setTrackLoading(true);
    setTrackError('');
    try {
      const c = await api.trackComplaint(trackingInput.trim());
      onSelectComplaint(c);
      setTrackingInput('');
    } catch (err: any) {
      setTrackError('Complaint ID not found. Verify format e.g. CS-...');
    } finally {
      setTrackLoading(false);
    }
  };

  const bg = isDark ? '#0b0f19' : '#f8fafc';
  const cardBg = isDark ? '#151c2c' : '#ffffff';
  const borderCol = isDark ? '#243048' : '#e2e8f0';
  const textCol = isDark ? '#f8fafc' : '#0f172a';
  const subtextCol = isDark ? '#94a3b8' : '#64748b';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: bg }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Welcome Banner */}
      <View style={[styles.heroCard, { backgroundColor: '#0f172a' }]}>
        <View style={styles.heroRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroGreeting}>Welcome to CivicSaarthi</Text>
            <Text style={styles.heroTitle}>AI-Powered Civic Redressal</Text>
            <Text style={styles.heroSubtitle}>
              Intelligent complaint prioritization, automatic department routing & duplicate detection.
            </Text>
          </View>
          <View style={styles.heroShield}>
            <Text style={{ fontSize: 28 }}>🛡️</Text>
          </View>
        </View>

        <View style={styles.heroCtaRow}>
          <TouchableOpacity
            style={styles.heroPrimaryBtn}
            onPress={() => onNavigate('report')}
            activeOpacity={0.8}
          >
            <Text style={styles.heroPrimaryBtnText}>➕ Report Issue</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.heroSecondaryBtn}
            onPress={() => onNavigate('map')}
            activeOpacity={0.8}
          >
            <Text style={styles.heroSecondaryBtnText}>🗺️ View City Map</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Track by ID Card */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderCol }]}>
        <Text style={[styles.cardTitle, { color: textCol }]}>🔍 Track Complaint by ID</Text>
        <Text style={[styles.cardSubtitle, { color: subtextCol }]}>
          Check real-time municipal status timeline without logging in
        </Text>
        <View style={styles.trackRow}>
          <TextInput
            style={[
              styles.trackInput,
              {
                backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                borderColor: borderCol,
                color: textCol,
              },
            ]}
            placeholder="Enter tracking ID (e.g. CS-KM...)"
            placeholderTextColor={subtextCol}
            value={trackingInput}
            onChangeText={(txt) => {
              setTrackingInput(txt);
              setTrackError('');
            }}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={[styles.trackBtn, trackLoading && { opacity: 0.7 }]}
            onPress={handleTrackSubmit}
            disabled={trackLoading}
            activeOpacity={0.8}
          >
            {trackLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.trackBtnText}>Track</Text>
            )}
          </TouchableOpacity>
        </View>
        {trackError ? <Text style={styles.errorText}>{trackError}</Text> : null}
      </View>

      {/* KPI Stats Grid */}
      <Text style={[styles.sectionHeading, { color: textCol }]}>Municipal Redressal Metrics</Text>
      <View style={styles.statsGrid}>
        <View style={[styles.statBox, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <Text style={[styles.statNumber, { color: '#0d9488' }]}>{stats.total}</Text>
          <Text style={[styles.statLabel, { color: subtextCol }]}>Total Complaints</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <Text style={[styles.statNumber, { color: '#f59e0b' }]}>{stats.inProgress}</Text>
          <Text style={[styles.statLabel, { color: subtextCol }]}>Active / In Progress</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <Text style={[styles.statNumber, { color: '#10b981' }]}>{stats.resolved}</Text>
          <Text style={[styles.statLabel, { color: subtextCol }]}>Resolved Cases</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <Text style={[styles.statNumber, { color: '#ef4444' }]}>{stats.critical}</Text>
          <Text style={[styles.statLabel, { color: subtextCol }]}>Critical / SOS</Text>
        </View>
      </View>

      {/* Quick Action Tiles */}
      <Text style={[styles.sectionHeading, { color: textCol }]}>Quick Access Hub</Text>
      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={[styles.actionTile, { backgroundColor: cardBg, borderColor: borderCol }]}
          onPress={() => onNavigate('report')}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconBg, { backgroundColor: '#ccfbf1' }]}>
            <Text style={{ fontSize: 20 }}>📝</Text>
          </View>
          <Text style={[styles.actionTileTitle, { color: textCol }]}>New Complaint</Text>
          <Text style={[styles.actionTileDesc, { color: subtextCol }]}>AI urgency & duplicate check</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionTile, { backgroundColor: cardBg, borderColor: borderCol }]}
          onPress={() => onNavigate('map')}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconBg, { backgroundColor: '#e0e7ff' }]}>
            <Text style={{ fontSize: 20 }}>📍</Text>
          </View>
          <Text style={[styles.actionTileTitle, { color: textCol }]}>Civic Map</Text>
          <Text style={[styles.actionTileDesc, { color: subtextCol }]}>Live markers & hotspot radar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionTile, { backgroundColor: cardBg, borderColor: borderCol }]}
          onPress={() => onNavigate('safety')}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconBg, { backgroundColor: '#fee2e2' }]}>
            <Text style={{ fontSize: 20 }}>🚨</Text>
          </View>
          <Text style={[styles.actionTileTitle, { color: textCol }]}>Public Safety</Text>
          <Text style={[styles.actionTileDesc, { color: subtextCol }]}>SOS broadcast & hotlines</Text>
        </TouchableOpacity>

        {user?.role === 'officer' || user?.role === 'admin' ? (
          <TouchableOpacity
            style={[styles.actionTile, { backgroundColor: cardBg, borderColor: borderCol }]}
            onPress={() => onNavigate(user?.role === 'admin' ? 'admin' : 'officer')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconBg, { backgroundColor: '#fef3c7' }]}>
              <Text style={{ fontSize: 20 }}>{user?.role === 'admin' ? '👑' : '👮'}</Text>
            </View>
            <Text style={[styles.actionTileTitle, { color: textCol }]}>
              {user?.role === 'admin' ? 'Admin Console' : 'Officer Workbench'}
            </Text>
            <Text style={[styles.actionTileDesc, { color: subtextCol }]}>
              {user?.role === 'admin' ? 'Users & Audit Logs' : 'Assigned Case Queues'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionTile, { backgroundColor: cardBg, borderColor: borderCol }]}
            onPress={() => onNavigate('complaints')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconBg, { backgroundColor: '#e0f2fe' }]}>
              <Text style={{ fontSize: 20 }}>📂</Text>
            </View>
            <Text style={[styles.actionTileTitle, { color: textCol }]}>My Reports</Text>
            <Text style={[styles.actionTileDesc, { color: subtextCol }]}>View status & reopen cases</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Recent Civic Complaints */}
      <View style={styles.recentHeaderRow}>
        <Text style={[styles.sectionHeading, { color: textCol, marginBottom: 0 }]}>
          Recent Civic Reports
        </Text>
        <TouchableOpacity onPress={() => onNavigate('complaints')}>
          <Text style={{ fontSize: 13, color: '#0d9488', fontWeight: '700' }}>View All →</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#0d9488" style={{ marginVertical: 20 }} />
      ) : recentComplaints.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <Text style={{ fontSize: 24, marginBottom: 6 }}>📭</Text>
          <Text style={[styles.emptyText, { color: subtextCol }]}>No recent complaints found</Text>
        </View>
      ) : (
        recentComplaints.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[styles.complaintItem, { backgroundColor: cardBg, borderColor: borderCol }]}
            onPress={() => onSelectComplaint(c)}
            activeOpacity={0.75}
          >
            <View style={styles.complaintItemHeader}>
              <Text style={styles.trackingIdText}>{c.tracking_id}</Text>
              <StatusBadge status={c.status} size="sm" />
            </View>
            <Text style={[styles.complaintItemTitle, { color: textCol }]} numberOfLines={1}>
              {c.title}
            </Text>
            <Text style={[styles.complaintItemDesc, { color: subtextCol }]} numberOfLines={2}>
              {c.description}
            </Text>
            <View style={styles.complaintItemFooter}>
              <PriorityBadge priority={c.priority} urgency={c.urgency} />
              <Text style={[styles.deptText, { color: subtextCol }]}>🏛️ {c.department}</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  heroCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  heroGreeting: {
    color: '#14b8a6',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  heroSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 17,
  },
  heroShield: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  heroCtaRow: {
    flexDirection: 'row',
    gap: 10,
  },
  heroPrimaryBtn: {
    backgroundColor: '#0d9488',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
  },
  heroPrimaryBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  heroSecondaryBtn: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
  },
  heroSecondaryBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 13,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    marginBottom: 10,
  },
  trackRow: {
    flexDirection: 'row',
    gap: 8,
  },
  trackInput: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  trackBtn: {
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    borderRadius: 8,
    height: 42,
  },
  trackBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 11,
    marginTop: 6,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  actionTile: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  actionIconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionTileTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  actionTileDesc: {
    fontSize: 11,
  },
  recentHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  complaintItem: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  complaintItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  trackingIdText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0d9488',
  },
  complaintItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  complaintItemDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  complaintItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deptText: {
    fontSize: 11,
  },
  emptyCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
  },
});
