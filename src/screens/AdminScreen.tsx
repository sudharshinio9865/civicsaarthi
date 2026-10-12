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
import { User, AuditLog, DepartmentMetric } from '../types';

interface Props {
  user: User | null;
  isDark: boolean;
}

export const AdminScreen: React.FC<Props> = ({ user, isDark }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [departments, setDepartments] = useState<DepartmentMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [activeTab, setActiveTab] = useState<'departments' | 'users' | 'audit'>('departments');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [uData, aData, dData] = await Promise.all([
        api.getUsers().catch(() => []),
        api.getAuditLogs().catch(() => []),
        api.getDepartments().catch(() => []),
      ]);
      setUsers(uData || []);
      setAuditLogs(aData || []);
      setDepartments(dData || []);
    } catch (err: any) {
      console.warn('Admin fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [user]);

  const handleResetDemo = () => {
    Alert.alert(
      'Reset Demo Environment',
      'This will delete temporary demo complaints and re-seed the standard EXODIA 2K26 test cases with fresh AI categorization and duplicate records.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Demo Data',
          style: 'destructive',
          onPress: async () => {
            setResetting(true);
            try {
              const res = await api.resetDemoData();
              Alert.alert('Demo Reset Complete', `Seeded ${res.count} realistic test complaints.`);
              fetchAdminData();
            } catch (err: any) {
              Alert.alert('Reset Failed', err.message || 'Error resetting demo');
            } finally {
              setResetting(false);
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.screenTitle, { color: textCol }]}>Municipal Administration</Text>
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>SUPERADMIN</Text>
          </View>
        </View>
        <Text style={[styles.screenSubtitle, { color: subtextCol }]}>
          Governance console for department quotas, officer access, audit trails, and demo management.
        </Text>
      </View>

      {/* Demo Reset Card */}
      <View style={[styles.demoCard, { backgroundColor: '#0f172a' }]}>
        <View style={styles.demoHeader}>
          <Text style={styles.demoTitle}>EXODIA 2K26 Hackathon Demo Tools</Text>
          <Text style={{ fontSize: 20 }}>🧪</Text>
        </View>
        <Text style={styles.demoDesc}>
          Re-seed sample complaints (deep pothole, streetlight sparks, water leak) with explainable AI scores.
        </Text>
        <TouchableOpacity
          style={[styles.resetBtn, resetting && { opacity: 0.7 }]}
          onPress={handleResetDemo}
          disabled={resetting}
          activeOpacity={0.8}
        >
          {resetting ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.resetBtnText}>🔄 1-Click Reset Demo Complaints</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Sub Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[
            styles.subTab,
            activeTab === 'departments' && styles.subTabActive,
            { borderColor: borderCol },
          ]}
          onPress={() => setActiveTab('departments')}
        >
          <Text
            style={[
              styles.subTabText,
              { color: activeTab === 'departments' ? '#0d9488' : subtextCol },
              activeTab === 'departments' && { fontWeight: '700' },
            ]}
          >
            🏛️ Departments
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.subTab,
            activeTab === 'users' && styles.subTabActive,
            { borderColor: borderCol },
          ]}
          onPress={() => setActiveTab('users')}
        >
          <Text
            style={[
              styles.subTabText,
              { color: activeTab === 'users' ? '#0d9488' : subtextCol },
              activeTab === 'users' && { fontWeight: '700' },
            ]}
          >
            👥 Officers & Users
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.subTab,
            activeTab === 'audit' && styles.subTabActive,
            { borderColor: borderCol },
          ]}
          onPress={() => setActiveTab('audit')}
        >
          <Text
            style={[
              styles.subTabText,
              { color: activeTab === 'audit' ? '#0d9488' : subtextCol },
              activeTab === 'audit' && { fontWeight: '700' },
            ]}
          >
            📜 Audit Logs
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#0d9488" style={{ marginVertical: 30 }} />
      ) : activeTab === 'departments' ? (
        <View>
          {departments.map((d, idx) => (
            <View key={idx} style={[styles.card, { backgroundColor: cardBg, borderColor: borderCol }]}>
              <View style={styles.deptHeader}>
                <Text style={[styles.deptName, { color: textCol }]}>{d.name}</Text>
                <View style={styles.officerCountBadge}>
                  <Text style={styles.officerCountText}>{d.officers} Officers</Text>
                </View>
              </View>
              <View style={styles.deptMetricsRow}>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricVal, { color: textCol }]}>{d.total}</Text>
                  <Text style={[styles.metricLbl, { color: subtextCol }]}>Total Cases</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricVal, { color: '#f59e0b' }]}>{d.pending}</Text>
                  <Text style={[styles.metricLbl, { color: subtextCol }]}>Pending</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricVal, { color: '#10b981' }]}>{d.resolved}</Text>
                  <Text style={[styles.metricLbl, { color: subtextCol }]}>Resolved</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricVal, { color: '#0d9488' }]}>
                    {d.total > 0 ? `${Math.round((d.resolved / d.total) * 100)}%` : '0%'}
                  </Text>
                  <Text style={[styles.metricLbl, { color: subtextCol }]}>Rate</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : activeTab === 'users' ? (
        <View>
          {users.map((u) => (
            <View key={u.id} style={[styles.card, { backgroundColor: cardBg, borderColor: borderCol }]}>
              <View style={styles.userTop}>
                <View>
                  <Text style={[styles.userName, { color: textCol }]}>{u.name}</Text>
                  <Text style={[styles.userEmail, { color: subtextCol }]}>{u.email}</Text>
                </View>
                <View
                  style={[
                    styles.roleBadge,
                    {
                      backgroundColor:
                        u.role === 'admin'
                          ? '#fef3c7'
                          : u.role === 'officer'
                          ? '#ccfbf1'
                          : '#e0f2fe',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.roleText,
                      {
                        color:
                          u.role === 'admin'
                            ? '#b45309'
                            : u.role === 'officer'
                            ? '#0f766e'
                            : '#0369a1',
                      },
                    ]}
                  >
                    {u.role.toUpperCase()}
                  </Text>
                </View>
              </View>
              {u.department ? (
                <Text style={[styles.userDept, { color: subtextCol }]}>
                  Department: <Text style={{ fontWeight: '600', color: textCol }}>{u.department}</Text>
                </Text>
              ) : null}
            </View>
          ))}
        </View>
      ) : (
        <View>
          {auditLogs.slice(0, 15).map((log) => (
            <View key={log.id} style={[styles.card, { backgroundColor: cardBg, borderColor: borderCol }]}>
              <View style={styles.auditHeader}>
                <Text style={styles.auditAction}>{log.action}</Text>
                <Text style={[styles.auditTime, { color: subtextCol }]}>
                  {new Date(log.created_at).toLocaleTimeString()}
                </Text>
              </View>
              <Text style={[styles.auditDetails, { color: textCol }]}>{log.details}</Text>
            </View>
          ))}
        </View>
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
  adminBadge: {
    marginLeft: 8,
    backgroundColor: '#ede9fe',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  adminBadgeText: {
    color: '#6366f1',
    fontSize: 10,
    fontWeight: '800',
  },
  screenSubtitle: {
    fontSize: 12,
    lineHeight: 17,
  },
  demoCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  demoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  demoTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  demoDesc: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  resetBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  resetBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  subTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  subTabActive: {
    backgroundColor: 'rgba(13, 148, 136, 0.08)',
    borderColor: '#0d9488',
  },
  subTabText: {
    fontSize: 11,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  deptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deptName: {
    fontSize: 14,
    fontWeight: '700',
  },
  officerCountBadge: {
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  officerCountText: {
    color: '#0d9488',
    fontSize: 11,
    fontWeight: '700',
  },
  deptMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 15,
    fontWeight: '800',
  },
  metricLbl: {
    fontSize: 10,
    marginTop: 2,
  },
  userTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 12,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
  },
  userDept: {
    fontSize: 11,
    marginTop: 4,
  },
  auditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  auditAction: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6366f1',
  },
  auditTime: {
    fontSize: 10,
  },
  auditDetails: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
});
