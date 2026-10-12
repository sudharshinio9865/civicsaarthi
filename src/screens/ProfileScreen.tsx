import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { User, TabScreen } from '../types';
import { api, ApiConfig } from '../services/api';

interface Props {
  user: User | null;
  onLoginPersona: (email: string, pass: string) => Promise<void>;
  onLogout: () => void;
  onNavigate: (tab: TabScreen) => void;
  isDark: boolean;
  onToggleDark: () => void;
}

export const ProfileScreen: React.FC<Props> = ({
  user,
  onLoginPersona,
  onLogout,
  onNavigate,
  isDark,
  onToggleDark,
}) => {
  const [apiUrl, setApiUrl] = useState(ApiConfig.getBaseUrl());
  const [testingHost, setTestingHost] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleSwitchPersona = async (email: string, role: string) => {
    try {
      await onLoginPersona(email, 'Demo@1234');
      Alert.alert('Persona Switched', `Logged in as ${role}.`);
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Could not switch persona');
    }
  };

  const handleSaveApiUrl = async () => {
    setTestingHost(true);
    setTestResult(null);
    try {
      ApiConfig.setBaseUrl(apiUrl);
      const res = await api.getMapMarkers();
      setTestResult(`✓ Connected! Server responded with ${res.length} complaints.`);
      Alert.alert('Connected Successfully', `Connected to ${ApiConfig.getBaseUrl()}`);
    } catch (err: any) {
      setTestResult(`✗ Connection failed: ${err.message}`);
      Alert.alert('Connection Failed', err.message);
    } finally {
      setTestingHost(false);
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
      {/* User Card */}
      <View style={[styles.userCard, { backgroundColor: '#0f172a' }]}>
        <View style={styles.avatar}>
          <Text style={{ fontSize: 28 }}>
            {user?.role === 'admin' ? '👑' : user?.role === 'officer' ? '👮' : '👤'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name || 'Citizen User'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'citizen@civic.demo'}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>
            {(user?.role || 'citizen').toUpperCase()}
            {user?.department ? ` • ${user.department}` : ''}
          </Text>
        </View>
      </View>

      {/* 1-Tap Persona Switcher for Presentation & Testing */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderCol }]}>
        <Text style={[styles.cardTitle, { color: textCol }]}>🎭 1-Tap Persona Switcher (EXODIA 2K26)</Text>
        <Text style={[styles.cardDesc, { color: subtextCol }]}>
          Instantly switch roles without typing passwords to evaluate different user workflows:
        </Text>

        <View style={styles.personasRow}>
          <TouchableOpacity
            style={[
              styles.personaBtn,
              user?.role === 'citizen' && styles.personaBtnActive,
            ]}
            onPress={() => handleSwitchPersona('citizen@civic.demo', 'Citizen')}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 20 }}>👤</Text>
            <Text style={styles.personaBtnTitle}>Citizen</Text>
            <Text style={styles.personaBtnSub}>Report & Track</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.personaBtn,
              user?.role === 'officer' && styles.personaBtnActive,
            ]}
            onPress={() => handleSwitchPersona('officer@civic.demo', 'Officer Rao')}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 20 }}>👮</Text>
            <Text style={styles.personaBtnTitle}>Officer Rao</Text>
            <Text style={styles.personaBtnSub}>Public Works</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.personaBtn,
              user?.role === 'admin' && styles.personaBtnActive,
            ]}
            onPress={() => handleSwitchPersona('admin@civic.demo', 'Municipal Admin')}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 20 }}>👑</Text>
            <Text style={styles.personaBtnTitle}>SuperAdmin</Text>
            <Text style={styles.personaBtnSub}>Audit & Reset</Text>
          </TouchableOpacity>
        </View>

        {user?.role === 'officer' && (
          <TouchableOpacity
            style={styles.roleActionBtn}
            onPress={() => onNavigate('officer')}
            activeOpacity={0.8}
          >
            <Text style={styles.roleActionBtnText}>Open Officer Case Workbench →</Text>
          </TouchableOpacity>
        )}

        {user?.role === 'admin' && (
          <TouchableOpacity
            style={styles.roleActionBtn}
            onPress={() => onNavigate('admin')}
            activeOpacity={0.8}
          >
            <Text style={styles.roleActionBtnText}>Open Municipal Admin Console →</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Backend API Server Host Configuration */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderCol }]}>
        <Text style={[styles.cardTitle, { color: textCol }]}>🌐 Backend API Server Connection</Text>
        <Text style={[styles.cardDesc, { color: subtextCol }]}>
          When running on an Android phone over Wi-Fi, change localhost to your computer's local LAN IP (e.g. 192.168.1.100:4000):
        </Text>

        <TextInput
          style={[styles.input, { backgroundColor: inputBg, borderColor: borderCol, color: textCol }]}
          value={apiUrl}
          onChangeText={setApiUrl}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[styles.testHostBtn, testingHost && { opacity: 0.7 }]}
          onPress={handleSaveApiUrl}
          disabled={testingHost}
          activeOpacity={0.8}
        >
          <Text style={styles.testHostBtnText}>Save & Test Server Connection</Text>
        </TouchableOpacity>

        {testResult && (
          <Text
            style={[
              styles.testResultText,
              { color: testResult.startsWith('✓') ? '#10b981' : '#ef4444' },
            ]}
          >
            {testResult}
          </Text>
        )}
      </View>

      {/* App Settings */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderCol }]}>
        <Text style={[styles.cardTitle, { color: textCol }]}>⚙️ App Preferences</Text>
        <TouchableOpacity style={styles.settingRow} onPress={onToggleDark} activeOpacity={0.7}>
          <Text style={[styles.settingLabel, { color: textCol }]}>Dark Theme</Text>
          <Text style={{ fontSize: 16 }}>{isDark ? '☀️ Light' : '🌙 Dark'}</Text>
        </TouchableOpacity>
      </View>

      {/* EXODIA 2K26 Evaluation Guide */}
      <View style={[styles.card, { backgroundColor: cardBg, borderColor: borderCol }]}>
        <Text style={[styles.cardTitle, { color: textCol }]}>📋 EXODIA 2K26 Demo Architecture</Text>
        <Text style={[styles.guideStep, { color: subtextCol }]}>
          1. <Text style={{ fontWeight: '700', color: textCol }}>Citizen Submits Issue:</Text> Type a title or pick the "Deep Pothole" preset. Click "Analyze with Civic AI".
        </Text>
        <Text style={[styles.guideStep, { color: subtextCol }]}>
          2. <Text style={{ fontWeight: '700', color: textCol }}>AI Urgency & Duplicates:</Text> AI calculates 0–100 urgency and displays nearby duplicate matches before submission.
        </Text>
        <Text style={[styles.guideStep, { color: subtextCol }]}>
          3. <Text style={{ fontWeight: '700', color: textCol }}>Officer Updates Progress:</Text> Switch to Officer Rao & update status to "In Progress" or "Resolved".
        </Text>
        <Text style={[styles.guideStep, { color: subtextCol }]}>
          4. <Text style={{ fontWeight: '700', color: textCol }}>Citizen Verification:</Text> View the 5-stage timeline stepper, reopen if unsatisfied, or leave a 5-star review.
        </Text>
        <Text style={[styles.guideStep, { color: subtextCol }]}>
          5. <Text style={{ fontWeight: '700', color: textCol }}>Admin Governance:</Text> SuperAdmin inspects audit logs and resets demo data in 1-click.
        </Text>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.8}>
        <Text style={styles.logoutBtnText}>Log Out</Text>
      </TouchableOpacity>
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
  userCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  userName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  userEmail: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 10,
  },
  roleBadge: {
    backgroundColor: '#0d9488',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  roleBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  personasRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  personaBtn: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 10,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  personaBtnActive: {
    borderColor: '#0d9488',
    backgroundColor: 'rgba(13, 148, 136, 0.08)',
  },
  personaBtnTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  personaBtnSub: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 1,
  },
  roleActionBtn: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
    marginTop: 4,
  },
  roleActionBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 12,
    marginBottom: 10,
  },
  testHostBtn: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  testHostBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  testResultText: {
    fontSize: 11,
    marginTop: 8,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  guideStep: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 8,
  },
  logoutBtn: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
