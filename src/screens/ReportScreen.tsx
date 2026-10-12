import React, { useState } from 'react';
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
import { AIAnalysis, DuplicateMatch, Complaint } from '../types';
import { UrgencyGauge } from '../components/UrgencyGauge';

interface Props {
  onSuccess: (complaint: Complaint) => void;
  isDark: boolean;
}

const CATEGORIES = [
  'Auto-detect via AI',
  'Roads & Potholes',
  'Sanitation & Garbage',
  'Water Supply & Leakage',
  'Streetlights & Electricity',
  'Drainage & Sewage',
  'Public Safety & Hazards',
  'Parks & Public Spaces',
];

const PRESETS = [
  {
    label: '💥 Deep Pothole (School Zone)',
    title: 'Deep pothole on MG Road near school',
    desc: 'Huge deep pothole on the main road right in front of the school gate. Two motorbikes have skidded and fallen already. Very dangerous during morning traffic.',
    category: 'Roads & Potholes',
    lat: 12.9716,
    lng: 77.5946,
    address: 'MG Road, Near National Public School, Bengaluru',
  },
  {
    label: '⚡ Sparking Wire (Live Danger)',
    title: 'Exposed live wire sparking on streetlight',
    desc: 'Streetlight pole sparking with exposed live wire near pedestrian crossing after rain. Water logging around the base makes it a severe electrocution hazard.',
    category: 'Streetlights & Electricity',
    lat: 12.96,
    lng: 77.6,
    address: '100ft Road, Indiranagar, Bengaluru',
  },
  {
    label: '🌊 Water Pipeline Burst',
    title: 'Water main burst flooding market area',
    desc: 'Major drinking water pipe leak flooding the entire vegetable market lane. Clean drinking water wasting in thousands of litres since 6 AM.',
    category: 'Water Supply & Leakage',
    lat: 12.98,
    lng: 77.61,
    address: 'Gandhi Bazaar Main Road, Bengaluru',
  },
  {
    label: '🗑️ Garbage Overflow',
    title: 'Garbage dump overflowing for a week',
    desc: 'Municipal garbage bin overflowing into the street, stray animals scattering trash, severe stench and health hazard for nearby residents.',
    category: 'Sanitation & Garbage',
    lat: 12.975,
    lng: 77.59,
    address: 'Commercial Street Corner, Tasker Town, Bengaluru',
  },
];

export const ReportScreen: React.FC<Props> = ({ onSuccess, isDark }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Auto-detect via AI');
  const [address, setAddress] = useState('MG Road, Bengaluru');
  const [lat, setLat] = useState('12.9716');
  const [lng, setLng] = useState('77.5946');
  const [photoSelected, setPhotoSelected] = useState(false);

  // AI & Duplicates preview state
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysis | null>(null);
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setTitle(preset.title);
    setDescription(preset.desc);
    setCategory(preset.category);
    setAddress(preset.address);
    setLat(String(preset.lat));
    setLng(String(preset.lng));
    setAiResult(null);
    setDuplicates([]);
    setHasAnalyzed(false);
  };

  const handleAnalyzeAI = async () => {
    if (!description.trim() || description.length < 10) {
      Alert.alert('Description Required', 'Please provide at least 10 characters describing the civic issue.');
      return;
    }

    setAnalyzing(true);
    try {
      const res = await api.analyzeIssue(description, Number(lat) || 12.9716, Number(lng) || 77.5946);
      setAiResult(res.ai);
      setDuplicates(res.duplicates || []);
      setHasAnalyzed(true);

      // If category was auto-detect, set it from AI
      if (category === 'Auto-detect via AI' && res.ai?.category) {
        setCategory(res.ai.category);
      }
    } catch (err: any) {
      Alert.alert('Analysis Failed', err.message || 'Could not analyze complaint');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || title.length < 3) {
      Alert.alert('Invalid Title', 'Please enter a clear title (at least 3 characters).');
      return;
    }
    if (!description.trim() || description.length < 10) {
      Alert.alert('Description Required', 'Please explain the issue details (minimum 10 characters).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.createComplaint({
        title,
        description,
        category: category === 'Auto-detect via AI' ? undefined : category,
        address,
        lat: Number(lat) || 12.9716,
        lng: Number(lng) || 77.5946,
      });

      // Construct complaint object for callback
      const newComplaint: Complaint = {
        id: res.id,
        tracking_id: res.tracking_id,
        title,
        description,
        category: res.ai?.category || category,
        urgency: res.ai?.urgency || 50,
        priority: res.ai?.priority || 'Medium',
        department: res.ai?.department || 'Public Works',
        emergency: res.ai?.emergency || false,
        factors: res.ai?.factors || [],
        address,
        lat: Number(lat),
        lng: Number(lng),
        eta: res.eta,
        status: 'Submitted',
        created_at: new Date().toISOString(),
      };

      Alert.alert(
        'Complaint Submitted! 🎉',
        `Your tracking ID is ${res.tracking_id}.\nPriority: ${newComplaint.priority}\nAssigned Dept: ${newComplaint.department}\nEstimated Resolution SLA: ${res.eta}`,
        [{ text: 'Track Progress', onPress: () => onSuccess(newComplaint) }]
      );
    } catch (err: any) {
      Alert.alert('Submission Error', err.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
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
      {/* Title & Badge */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.screenTitle, { color: textCol }]}>Smart Complaint Report</Text>
          <View style={styles.aiTag}>
            <Text style={styles.aiTagText}>AI POWERED</Text>
          </View>
        </View>
        <Text style={[styles.screenSubtitle, { color: subtextCol }]}>
          Submit civic grievances with automated urgency scoring, duplicate prevention, and municipal SLA tracking.
        </Text>
      </View>

      {/* Demo Presets Bar */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderCol }]}>
        <Text style={[styles.cardLabel, { color: textCol }]}>⚡ 1-Tap Demo Presets (EXODIA 2K26)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
          {PRESETS.map((p, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.presetChip, { borderColor: '#0d9488' }]}
              onPress={() => applyPreset(p)}
              activeOpacity={0.7}
            >
              <Text style={styles.presetChipText}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Main Form Card */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderCol }]}>
        {/* Title Field */}
        <Text style={[styles.inputLabel, { color: textCol }]}>Issue Title *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: inputBg, borderColor: borderCol, color: textCol }]}
          placeholder="e.g. Hazardous pothole on main road"
          placeholderTextColor={subtextCol}
          value={title}
          onChangeText={setTitle}
        />

        {/* Category Selector */}
        <Text style={[styles.inputLabel, { color: textCol }]}>Civic Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: isSelected ? '#0d9488' : inputBg,
                    borderColor: isSelected ? '#0f766e' : borderCol,
                  },
                ]}
                onPress={() => setCategory(cat)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    { color: isSelected ? '#ffffff' : textCol, fontWeight: isSelected ? '700' : '500' },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Description Field */}
        <Text style={[styles.inputLabel, { color: textCol }]}>Issue Description *</Text>
        <TextInput
          style={[
            styles.textArea,
            { backgroundColor: inputBg, borderColor: borderCol, color: textCol },
          ]}
          placeholder="Describe the issue, hazards, landmarks, and duration..."
          placeholderTextColor={subtextCol}
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={(txt) => {
            setDescription(txt);
            setHasAnalyzed(false);
          }}
        />

        {/* AI Analyze & Predict Button */}
        <TouchableOpacity
          style={[styles.analyzeBtn, analyzing && { opacity: 0.7 }]}
          onPress={handleAnalyzeAI}
          disabled={analyzing}
          activeOpacity={0.8}
        >
          {analyzing ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.analyzeBtnText}>✨ Analyze with Civic AI & Check Duplicates</Text>
          )}
        </TouchableOpacity>

        {/* Real-time AI Intelligence Results */}
        {aiResult && <UrgencyGauge ai={aiResult} isDark={isDark} />}

        {/* Duplicate Detection Alert Banner */}
        {duplicates.length > 0 && (
          <View style={styles.duplicateAlert}>
            <View style={styles.duplicateHeader}>
              <Text style={{ fontSize: 18, marginRight: 6 }}>🔍</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.duplicateTitle}>
                  {duplicates.length} Potential Duplicate(s) Found Nearby
                </Text>
                <Text style={styles.duplicateSubtitle}>
                  Citizens have already reported similar complaints nearby:
                </Text>
              </View>
            </View>

            {duplicates.map((dup) => (
              <View key={dup.id} style={styles.duplicateItem}>
                <View style={styles.dupItemTop}>
                  <Text style={styles.dupTrackingId}>{dup.tracking_id}</Text>
                  <View style={styles.dupMatchBadge}>
                    <Text style={styles.dupMatchText}>{Math.round(dup.similarity * 100)}% Match</Text>
                  </View>
                </View>
                <Text style={styles.dupItemTitle}>{dup.title}</Text>
                <Text style={styles.dupItemDesc} numberOfLines={2}>
                  {dup.description}
                </Text>
              </View>
            ))}

            <Text style={styles.duplicateNotice}>
              💡 Submitting will link your report to this thread to prevent municipal duplicate ticket backlog.
            </Text>
          </View>
        )}

        {/* Photo Upload Section */}
        <Text style={[styles.inputLabel, { color: textCol, marginTop: 12 }]}>Photo Evidence</Text>
        <View style={styles.photoRow}>
          <TouchableOpacity
            style={[
              styles.photoBtn,
              {
                backgroundColor: photoSelected ? '#ccfbf1' : inputBg,
                borderColor: photoSelected ? '#0d9488' : borderCol,
              },
            ]}
            onPress={() => setPhotoSelected(!photoSelected)}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 20 }}>📸</Text>
            <Text style={[styles.photoBtnText, { color: textCol }]}>
              {photoSelected ? 'Photo Attached (pothole_evidence.jpg)' : 'Take Photo or Choose Gallery'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Location & GPS */}
        <Text style={[styles.inputLabel, { color: textCol }]}>Location & Coordinates *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: inputBg, borderColor: borderCol, color: textCol }]}
          placeholder="Street address or landmark"
          placeholderTextColor={subtextCol}
          value={address}
          onChangeText={setAddress}
        />

        <View style={styles.coordsRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.coordSublabel, { color: subtextCol }]}>Latitude</Text>
            <TextInput
              style={[styles.coordInput, { backgroundColor: inputBg, borderColor: borderCol, color: textCol }]}
              value={lat}
              onChangeText={setLat}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.coordSublabel, { color: subtextCol }]}>Longitude</Text>
            <TextInput
              style={[styles.coordInput, { backgroundColor: inputBg, borderColor: borderCol, color: textCol }]}
              value={lng}
              onChangeText={setLng}
              keyboardType="numeric"
            />
          </View>
          <TouchableOpacity
            style={styles.gpsAutoBtn}
            onPress={() => {
              setLat('12.9716');
              setLng('77.5946');
              Alert.alert('GPS Calibrated', 'Pin updated to Bengaluru civic center (12.9716, 77.5946).');
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.gpsAutoBtnText}>🎯 Current GPS</Text>
          </TouchableOpacity>
        </View>

        {/* Submit Complaint Button */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.8}
        >
          {submitting ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.submitBtnText}>🚀 Submit Civic Grievance</Text>
          )}
        </TouchableOpacity>
      </View>
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
  aiTag: {
    marginLeft: 8,
    backgroundColor: '#ede9fe',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  aiTagText: {
    color: '#6366f1',
    fontSize: 10,
    fontWeight: '800',
  },
  screenSubtitle: {
    fontSize: 12,
    lineHeight: 17,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  presetScroll: {
    flexDirection: 'row',
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    backgroundColor: 'rgba(13, 148, 136, 0.08)',
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0d9488',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
    marginBottom: 12,
  },
  categoryScroll: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 6,
  },
  categoryPillText: {
    fontSize: 12,
  },
  textArea: {
    height: 90,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
    fontSize: 13,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  analyzeBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  analyzeBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  duplicateAlert: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  duplicateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  duplicateTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400e',
  },
  duplicateSubtitle: {
    fontSize: 11,
    color: '#b45309',
  },
  duplicateItem: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
    padding: 8,
    marginBottom: 6,
    borderWidth: 0.5,
    borderColor: '#fcd34d',
  },
  dupItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  dupTrackingId: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0d9488',
  },
  dupMatchBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dupMatchText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#b45309',
  },
  dupItemTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  dupItemDesc: {
    fontSize: 11,
    color: '#64748b',
  },
  duplicateNotice: {
    fontSize: 10,
    color: '#92400e',
    marginTop: 4,
  },
  photoRow: {
    marginBottom: 12,
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  photoBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  coordsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  coordSublabel: {
    fontSize: 10,
    marginBottom: 3,
  },
  coordInput: {
    height: 38,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    fontSize: 12,
  },
  gpsAutoBtn: {
    backgroundColor: '#0f172a',
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  gpsAutoBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: '#0d9488',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
});
