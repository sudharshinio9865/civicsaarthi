import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { api } from '../services/api';
import { Complaint, User } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';

interface Props {
  user: User | null;
  isDark: boolean;
  onSelectComplaint: (complaint: Complaint) => void;
}

const OFFICER_STATUSES = ['Under Review', 'Assigned', 'In Progress', 'Resolved'];

export const OfficerScreen: React.FC<Props> = ({ user, isDark, onSelectComplaint }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [activeNote, setActiveNote] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('In Progress');

  const fetchAssigned = async () => {
    setLoading(true);
    try {
      const res = await api.getComplaints({ size: 50 });
      setComplaints(res.rows || []);
    } catch (err: any) {
      console.warn('Officer complaints error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssigned();
  }, [user]);

  const handleUpdateStatus = async (complaint: Complaint) => {
    setUpdatingId(complaint.id);
    try {
      await api.updateComplaint(complaint.id, {
        status: selectedStatus,
        note: activeNote.trim() || `Status updated to ${selectedStatus} by ${user?.name || 'Officer'}`,
      });

      Alert.alert(
        'Status Updated',
        `Complaint ${complaint.tracking_id} updated to ${selectedStatus}. Citizen notified.`
      );
      setActiveNote('');
      fetchAssigned();
    } catch (err: any) {
      Alert.alert('Update Failed', err.message || 'Could not update complaint');
    } finally {
      setUpdatingId(null);
    }
  };

  const bg = isDark ? '#0b0f19' : '#f8fafc';
  const cardBg = isDark ? '#151c2c' : '#ffffff';
  const borderCol = isDark ? '#243048' : '#e2e8f0';
  const textCol = isDark ? '#f8fafc' : '#0f172a';
  const subtextCol = isDark ? '#94a3b8' : '#64748b';
  const inputBg = isDark ? '#1e293b' : '#f1f5f9';

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.screenTitle, { color: textCol }]}>Officer Case Workbench</Text>
          <View style={styles.officerBadge}>
            <Text style={styles.officerBadgeText}>
              {user?.department || 'Public Works'} Officer
            </Text>
          </View>
        </View>
        <Text style={[styles.screenSubtitle, { color: subtextCol }]}>
          Review municipal triage, update resolution progress, upload evidence, and meet citizen SLAs.
        </Text>
      </View>

      {/* Priority Queue Summary */}
      <View style={[styles.summaryCard, { backgroundColor: '#0f172a' }]}>
        <View style={styles.summaryTop}>
          <Text style={styles.summaryTitle}>Department Queue</Text>
          <Text style={styles.summaryBadge}>Active Duty</Text>
        </View>
        <Text style={styles.summaryDesc}>
          Logged in as <Text style={{ color: '#14b8a6', fontWeight: '700' }}>{user?.name || 'Officer'}</Text> •{' '}
          {user?.department || 'Public Works'}
        </Text>
        <View style={styles.summaryCountRow}>
          <View style={styles.countItem}>
            <Text style={styles.countNumber}>{complaints.length}</Text>
            <Text style={styles.countLabel}>Assigned</Text>
          </View>
          <View style={styles.countItem}>
            <Text style={[styles.countNumber, { color: '#ef4444' }]}>
              {complaints.filter((c) => c.priority === 'Critical').length}
            </Text>
            <Text style={styles.countLabel}>Critical</Text>
          </View>
          <View style={styles.countItem}>
            <Text style={[styles.countNumber, { color: '#10b981' }]}>
              {complaints.filter((c) => c.status === 'Resolved').length}
            </Text>
            <Text style={styles.countLabel}>Resolved</Text>
          </View>
        </View>
      </View>

      {/* Case Feed */}
      <Text style={[styles.sectionHeading, { color: textCol }]}>Assigned Grievance Tickets</Text>

      {loading ? (
        <ActivityIndicator color="#0d9488" style={{ marginVertical: 30 }} />
      ) : complaints.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <Text style={{ fontSize: 24, marginBottom: 8 }}>🎉</Text>
          <Text style={[styles.emptyText, { color: textCol }]}>All tickets currently cleared</Text>
        </View>
      ) : (
        complaints.map((item) => {
          const isSelected = updatingId === item.id;

          return (
            <View
              key={item.id}
              style={[styles.ticketCard, { backgroundColor: cardBg, borderColor: borderCol }]}
            >
              <View style={styles.ticketHeader}>
                <TouchableOpacity onPress={() => onSelectComplaint(item)}>
                  <Text style={styles.ticketTid}>{item.tracking_id} →</Text>
                </TouchableOpacity>
                <StatusBadge status={item.status} size="sm" />
              </View>

              <Text style={[styles.ticketTitle, { color: textCol }]}>{item.title}</Text>
              <Text style={[styles.ticketDesc, { color: subtextCol }]} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.ticketMetaRow}>
                <PriorityBadge priority={item.priority} urgency={item.urgency} />
                <Text style={[styles.ticketAddress, { color: subtextCol }]} numberOfLines={1}>
                  📍 {item.address || 'Ward location'}
                </Text>
              </View>

              {/* Status Update Quick Action Controls */}
              <View style={styles.actionSection}>
                <Text style={[styles.actionSectionTitle, { color: subtextCol }]}>
                  Update Grievance Status:
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusChipsRow}>
                  {OFFICER_STATUSES.map((st) => (
                    <TouchableOpacity
                      key={st}
                      style={[
                        styles.statusChip,
                        {
                          backgroundColor:
                            selectedStatus === st ? '#0d9488' : inputBg,
                          borderColor: selectedStatus === st ? '#0f766e' : borderCol,
                        },
                      ]}
                      onPress={() => setSelectedStatus(st)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.statusChipText,
                          {
                            color: selectedStatus === st ? '#ffffff' : textCol,
                            fontWeight: selectedStatus === st ? '700' : '500',
                          },
                        ]}
                      >
                        {st}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TextInput
                  style={[styles.noteInput, { backgroundColor: inputBg, borderColor: borderCol, color: textCol }]}
                  placeholder="Officer progress note (e.g. road crew dispatched)..."
                  placeholderTextColor={subtextCol}
                  value={activeNote}
                  onChangeText={setActiveNote}
                />

                <TouchableOpacity
                  style={[styles.updateBtn, isSelected && { opacity: 0.7 }]}
                  onPress={() => handleUpdateStatus(item)}
                  disabled={isSelected}
                  activeOpacity={0.8}
                >
                  {isSelected ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.updateBtnText}>Save Status Update</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        })
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
  officerBadge: {
    marginLeft: 8,
    backgroundColor: '#ccfbf1',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  officerBadgeText: {
    color: '#0f766e',
    fontSize: 10,
    fontWeight: '800',
  },
  screenSubtitle: {
    fontSize: 12,
    lineHeight: 17,
  },
  summaryCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  summaryTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  summaryBadge: {
    backgroundColor: '#0d9488',
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  summaryDesc: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 12,
  },
  summaryCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 10,
  },
  countItem: {
    alignItems: 'center',
    flex: 1,
  },
  countNumber: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
  },
  countLabel: {
    color: '#94a3b8',
    fontSize: 10,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  ticketCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  ticketTid: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0d9488',
  },
  ticketTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  ticketDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  ticketMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  ticketAddress: {
    fontSize: 11,
    maxWidth: 160,
  },
  actionSection: {
    borderTopWidth: 0.5,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
  },
  actionSectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  statusChipsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 6,
  },
  statusChipText: {
    fontSize: 11,
  },
  noteInput: {
    height: 38,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 12,
    marginBottom: 8,
  },
  updateBtn: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  updateBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
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
