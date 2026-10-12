import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import { TabScreen, User, Complaint, NotificationItem } from './src/types';
import { api, ApiConfig } from './src/services/api';
import { Header } from './src/components/Header';
import { TabBar } from './src/components/TabBar';
import { NotificationModal } from './src/components/NotificationModal';
import { HomeScreen } from './src/screens/HomeScreen';
import { ReportScreen } from './src/screens/ReportScreen';
import { MapScreen } from './src/screens/MapScreen';
import { MyComplaintsScreen } from './src/screens/MyComplaintsScreen';
import { OfficerScreen } from './src/screens/OfficerScreen';
import { AdminScreen } from './src/screens/AdminScreen';
import { SafetyScreen } from './src/screens/SafetyScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabScreen>('home');
  const [user, setUser] = useState<User | null>(null);
  const [isDark, setIsDark] = useState<boolean>(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifVisible, setNotifVisible] = useState<boolean>(false);
  const [initializing, setInitializing] = useState<boolean>(true);

  // Auto-authenticate default Citizen persona on boot for instant hackathon demonstration
  const loginUser = async (email: string, pass: string = 'Demo@1234') => {
    try {
      const res = await api.login(email, pass);
      setUser(res.user);
      fetchNotifications();
    } catch (err: any) {
      console.warn('Login persona error:', err.message);
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data || []);
    } catch (err) {
      // Ignore if unauthenticated
    }
  };

  useEffect(() => {
    const init = async () => {
      await loginUser('citizen@civic.demo', 'Demo@1234');
      setInitializing(false);
    };
    init();
  }, []);

  const handleToggleTheme = () => {
    setIsDark(!isDark);
  };

  const handleSelectComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setCurrentTab('complaints');
  };

  const handleReportSuccess = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setCurrentTab('complaints');
  };

  const handleMarkRead = async (id: number) => {
    await api.markNotificationRead(id);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    fetchNotifications();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (initializing) {
    return (
      <View style={[styles.loadingWrap, { backgroundColor: isDark ? '#0b0f19' : '#f8fafc' }]}>
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  const bg = isDark ? '#0b0f19' : '#f8fafc';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Top Header Bar */}
      <Header
        user={user}
        unreadCount={unreadCount}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        onOpenNotifications={() => setNotifVisible(true)}
        onOpenSafety={() => setCurrentTab('safety')}
        onSwitchUser={() => setCurrentTab('profile')}
      />

      {/* Screen Body */}
      <View style={styles.screenBody}>
        {currentTab === 'home' && (
          <HomeScreen
            user={user}
            onNavigate={(tab) => setCurrentTab(tab)}
            onSelectComplaint={handleSelectComplaint}
            onTrackId={(tid) => setCurrentTab('complaints')}
            isDark={isDark}
          />
        )}

        {currentTab === 'report' && (
          <ReportScreen onSuccess={handleReportSuccess} isDark={isDark} />
        )}

        {currentTab === 'map' && (
          <MapScreen onSelectComplaint={handleSelectComplaint} isDark={isDark} />
        )}

        {currentTab === 'complaints' && (
          <MyComplaintsScreen
            user={user}
            selectedComplaint={selectedComplaint}
            onClearSelected={() => setSelectedComplaint(null)}
            isDark={isDark}
          />
        )}

        {currentTab === 'officer' && (
          <OfficerScreen
            user={user}
            isDark={isDark}
            onSelectComplaint={handleSelectComplaint}
          />
        )}

        {currentTab === 'admin' && (
          <AdminScreen user={user} isDark={isDark} />
        )}

        {currentTab === 'safety' && (
          <SafetyScreen isDark={isDark} onBack={() => setCurrentTab('home')} />
        )}

        {currentTab === 'profile' && (
          <ProfileScreen
            user={user}
            onLoginPersona={loginUser}
            onLogout={() => {
              api.logout();
              setUser(null);
            }}
            onNavigate={(tab) => setCurrentTab(tab)}
            isDark={isDark}
            onToggleDark={handleToggleTheme}
          />
        )}
      </View>

      {/* Bottom Navigation Tab Bar */}
      <TabBar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setSelectedComplaint(null);
          setCurrentTab(tab);
        }}
        userRole={user?.role}
        isDark={isDark}
      />

      {/* Notifications Drawer Modal */}
      <NotificationModal
        visible={notifVisible}
        notifications={notifications}
        onClose={() => setNotifVisible(false)}
        onMarkRead={handleMarkRead}
        onMarkAllRead={handleMarkAllRead}
        isDark={isDark}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenBody: {
    flex: 1,
  },
});
