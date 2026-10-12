import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { api } from '../services/api';
import { Complaint, User } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { TimelineStepper } from '../components/TimelineStepper';

interface Props {
  user: User | null;
  selectedComplaint: Complaint | null;
  onClearSelected: () => void;
  isDark: boolean;
}

const STATUS_FILTERS = ['All', 'Submitted', 'In Progress', 'Resolved'];

export const MyComplaintsScreen: React.FC<Props> = ({
  user,
  selectedComplaint,
  onClearSelected,
  isDark,
}) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDetail, setCurrentDetail] = useState<Complaint | null>(selectedComplaint);

  // Reopen and feedback states
  const [reopenReason, setReopenReason] = useState('');
  const [showReopenBox, setShowReopenBox] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.getComplaints({
        status: activeFilter === 'All' ? undefined : activeFilter,
        q: searchQuery.trim() || undefined,
        size: 50,
      });
      setComplaints(res.rows || []);
    } catch (err: any) {
      console.warn('Fetch complaints error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [activeFilter]);

  useEffect(() => {
    if (selectedComplaint) {
      loadFullDetail(selectedComplaint.tracking_id);
    }
  }, [selectedComplaint]);

  const loadFullDetail = async (tid: string) => {
    try {
      const full = await api.trackComplaint(tid);
      setCurrentDetail(full);
    } catch (err: any) {
      console.warn('Detail track error:', err.message);
    }
  };

  const handleReopen = async () => {
    if (!currentDetail || !reopenReason.trim()) {
      Alert.alert('Reason Required', 'Please explain why this case is not satisfactorily resolved.');
      return;
    }
    setSubmittingAction(true);
    try {
      await api.reopenComplaint(currentDetail.id, reopenReason.trim());
      Alert.alert('Complaint Reopened', 'Municipal supervisors have been alerted to review the work.');
      setShowReopenBox(false);
      setReopenReason('');
      loadFullDetail(currentDetail.tracking_id);
      fetchComplaints();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not reopen complaint');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleFeedback = async () => {
    if (!currentDetail) return;
    setSubmittingAction(true);
    try {
      await api.submitFeedback(currentDetail.id, rating, feedbackText.trim());
      setFeedbackSubmitted(true);
      Alert.alert('Thank You!', 'Citizen satisfaction rating recorded in municipal audit logs.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Feedback submission failed');
    } finally {
      setSubmittingAction(false);
    }
  };

  const bg = isDark ? '#0b0f19' : '#f8fafc';
  const cardBg = isDark ? '#151c2c' : '#ffffff';
  const borderCol = isDark ? '#243048' : '#e2e8f0';
  const textCol = isDark ? '#f8fafc' : '#0f172a';
  const subtextCol = isDark ? '#94a3b8' : '#64748b';
  const inputBg = isDark ? '#1e293b' : '#f1f5f9';

  // Detail View
  if (currentDetail) {
    const isResolved = currentDetail.status === 'Resolved';
    const isRejected = currentDetail.status === 'Rejected';

    return (
      <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={styles.content}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            setCurrentDetail(null);
            onClearSelected();
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.backBtnText}>← Back to All Complaints</Text>
        </TouchableOpacity>

        {/* Header Card */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <View style={styles.detailTopRow}>
            <View>
              <Text style={styles.detailTid}>{currentDetail.tracking_id}</Text>
              <Text style={[styles.detailHeading, { color: textCol }]}>{currentDetail.title}</Text>
            </View>
            <StatusBadge status={currentDetail.status} />
          </View>

          <Text style={[styles.detailDescription, { color: subtextCol }]}>
            {currentDetail.description}
          </Text>

          <View style={styles.metaRow}>
            <PriorityBadge priority={currentDetail.priority} urgency={currentDetail.urgency} />
            <Text style={[styles.metaText, { color: subtextCol }]}>🏛️ {currentDetail.department}</Text>
          </View>

          {currentDetail.eta ? (
            <View style={styles.slaBox}>
              <Text style={styles.slaLabel}>Estimated Resolution SLA:</Text>
              <Text style={styles.slaValue}>{currentDetail.eta}</Text>
            </View>
          ) : null}
        </View>

        {/* 5-Stage Timeline Stepper */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <TimelineStepper
            status={currentDetail.status}
            events={currentDetail.timeline}
            isDark={isDark}
          />
        </View>

        {/* Citizen Reopen Option */}
        {(isResolved || isRejected) && (
          <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderCol }]}>
            <Text style={[styles.cardTitle, { color: textCol }]}>Need Further Action?</Text>
            <Text style={[styles.cardDesc, { color: subtextCol }]}>
              If the reported issue has recurred or was not satisfactorily resolved, you can reopen it.
            </Text>

            {showReopenBox ? (
              <View style={{ marginTop: 8 }}>
                <TextInput
                  style={[styles.textArea, { backgroundColor: inputBg, borderColor: borderCol, color: textCol }]}
                  placeholder="Explain why the resolution is incomplete..."
                  placeholderTextColor={subtextCol}
                  multiline
                  value={reopenReason}
                  onChangeText={setReopenReason}
                />
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                  <TouchableOpacity
                    style={[styles.reopenConfirmBtn, submittingAction && { opacity: 0.7 }]}
                    onPress={handleReopen}
                    disabled={submittingAction}
                  >
                    <Text style={styles.reopenConfirmText}>Confirm Reopen Case</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setShowReopenBox(false)}
                  >
                    <Text style={[styles.cancelBtnText, { color: subtextCol }]}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.reopenBtn}
                onPress={() => setShowReopenBox(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.reopenBtnText}>🔄 Reopen Complaint</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Citizen Rating & Feedback */}
        {isResolved && !feedbackSubmitted && (
          <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderCol }]}>
            <Text style={[styles.cardTitle, { color: textCol }]}>Citizen Satisfaction Rating</Text>
            <Text style={[styles.cardDesc, { color: subtextCol }]}>
              Rate the speed and quality of the municipal resolution:
            </Text>

            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
                  <Text style={[styles.starIcon, { color: star <= rating ? '#f59e0b' : '#cbd5e1' }]}>
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.input, { backgroundColor: inputBg, borderColor: borderCol, color: textCol }]}
              placeholder="Optional remarks on municipal officer conduct..."
              placeholderTextColor={subtextCol}
              value={feedbackText}
              onChangeText={setFeedbackText}
            />

            <TouchableOpacity
              style={[styles.feedbackBtn, submittingAction && { opacity: 0.7 }]}
              onPress={handleFeedback}
              disabled={submittingAction}
              activeOpacity={0.8}
            >
              <Text style={styles.feedbackBtnText}>Submit Citizen Review</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    );
  }

  // List View
  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={styles.content}>
      {/* Title */}
      <View style={styles.header}>
        <Text style={[styles.screenTitle, { color: textCol }]}>Grievance Ledger</Text>
        <Text style={[styles.screenSubtitle, { color: subtextCol }]}>
          Track status timelines, officer assignments, and resolution evidence.
        </Text>
      </View>

      {/* Search Input */}
      <View style={[styles.searchBox, { backgroundColor: cardBg, borderColor: borderCol }]}>
        <TextInput
          style={[styles.searchInput, { color: textCol }]}
          placeholder="Search by ID, keyword, or address..."
          placeholderTextColor={subtextCol}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={fetchComplaints}
        />
        <TouchableOpacity style={styles.searchSubmit} onPress={fetchComplaints}>
          <Text style={{ fontSize: 16 }}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {STATUS_FILTERS.map((f) => {
          const isSelected = activeFilter === f;
          return (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterTab,
                {
                  backgroundColor: isSelected ? '#0d9488' : cardBg,
                  borderColor: isSelected ? '#0f766e' : borderCol,
                },
              ]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  { color: isSelected ? '#ffffff' : textCol, fontWeight: isSelected ? '700' : '500' },
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Complaints List */}
      {loading ? (
        <ActivityIndicator color="#0d9488" style={{ marginVertical: 30 }} />
      ) : complaints.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: cardBg, borderColor: borderCol }]}>
          <Text style={{ fontSize: 28, marginBottom: 8 }}>📭</Text>
          <Text style={[styles.emptyTitle, { color: textCol }]}>No Complaints Found</Text>
          <Text style={[styles.emptySubtitle, { color: subtextCol }]}>
            No records match the current filter criteria.
          </Text>
        </View>
      ) : (
        complaints.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.itemCard, { backgroundColor: cardBg, borderColor: borderCol }]}
            onPress={() => {
              setCurrentDetail(item);
              loadFullDetail(item.tracking_id);
            }}
            activeOpacity={0.75}
          >
            <View style={styles.itemHeader}>
              <Text style={styles.itemTid}>{item.tracking_id}</Text>
              <StatusBadge status={item.status} size="sm" />
            </View>

            <Text style={[styles.itemTitle, { color: textCol }]} numberOfLines={1}>
              {item.title}
            </Text>

            <Text style={[styles.itemDesc, { color: subtextCol }]} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={styles.itemFooter}>
              <PriorityBadge priority={item.priority} urgency={item.urgency} />
              <Text style={[styles.itemDept, { color: subtextCol }]}>🏛️ {item.department}</Text>
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
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 12,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  screenSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    height: 42,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  searchSubmit: {
    padding: 4,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  filterTabText: {
    fontSize: 11,
  },
  itemCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemTid: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0d9488',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  itemDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemDept: {
    fontSize: 11,
  },
  emptyCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
  },
  backBtn: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  backBtnText: {
    color: '#0d9488',
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  detailTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detailTid: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0d9488',
    marginBottom: 2,
  },
  detailHeading: {
    fontSize: 16,
    fontWeight: '800',
    maxWidth: 220,
  },
  detailDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
  },
  slaBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(13, 148, 136, 0.08)',
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  slaLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0f766e',
  },
  slaValue: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f766e',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  reopenBtn: {
    backgroundColor: '#9333ea',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },
  reopenBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  textArea: {
    height: 70,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingTop: 8,
    fontSize: 12,
    textAlignVertical: 'top',
  },
  reopenConfirmBtn: {
    backgroundColor: '#9333ea',
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
  },
  reopenConfirmText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 12,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  starIcon: {
    fontSize: 26,
  },
  input: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 12,
    marginBottom: 10,
  },
  feedbackBtn: {
    backgroundColor: '#0d9488',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },
  feedbackBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
});
