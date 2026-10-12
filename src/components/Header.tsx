import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { User } from '../types';

interface Props {
  user: User | null;
  unreadCount?: number;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenNotifications: () => void;
  onOpenSafety: () => void;
  onSwitchUser: () => void;
}

export const Header: React.FC<Props> = ({
  user,
  unreadCount = 0,
  isDark,
  onToggleTheme,
  onOpenNotifications,
  onOpenSafety,
  onSwitchUser,
}) => {
  const bg = isDark ? '#0f172a' : '#ffffff';
  const border = isDark ? '#1e293b' : '#e2e8f0';
  const textColor = isDark ? '#f8fafc' : '#0f172a';
  const subtextColor = isDark ? '#94a3b8' : '#64748b';

  return (
    <View style={[styles.container, { backgroundColor: bg, borderBottomColor: border }]}>
      <View style={styles.topRow}>
        <View style={styles.branding}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>CS</Text>
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.title, { color: textColor }]}>CivicSaarthi AI</Text>
              <View style={styles.hackathonPill}>
                <Text style={styles.hackathonText}>EXODIA 2K26</Text>
              </View>
            </View>
            <Text style={[styles.tagline, { color: subtextColor }]}>
              Municipal Prioritization & Rapid Response
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          {/* Safety SOS Quick Button */}
          <TouchableOpacity
            style={styles.sosButton}
            onPress={onOpenSafety}
            activeOpacity={0.8}
            accessibilityLabel="Public Safety SOS"
          >
            <Text style={styles.sosText}>🚨 SOS</Text>
          </TouchableOpacity>

          {/* Theme Toggle */}
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}
            onPress={onToggleTheme}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 16 }}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>

          {/* Notifications Bell */}
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}
            onPress={onOpenNotifications}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 16 }}>🔔</Text>
            {unreadCount > 0 && (
              <View style={styles.badgeCount}>
                <Text style={styles.badgeCountText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* User bar / Persona Switcher quick tap */}
      <View style={styles.userRow}>
        <TouchableOpacity style={styles.userBadge} onPress={onSwitchUser} activeOpacity={0.7}>
          <Text style={styles.userRoleIcon}>
            {user?.role === 'admin' ? '👑' : user?.role === 'officer' ? '👮' : '👤'}
          </Text>
          <Text style={[styles.userName, { color: textColor }]}>
            {user ? `${user.name} (${user.role.toUpperCase()})` : 'Guest Mode'}
          </Text>
          <Text style={styles.switchPersonaHint}>⇄ Switch</Text>
        </TouchableOpacity>

        <View style={styles.serverIndicator}>
          <View style={styles.serverDot} />
          <Text style={[styles.serverText, { color: subtextColor }]}>Live API :4000</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0d9488',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  hackathonPill: {
    marginLeft: 6,
    backgroundColor: '#ede9fe',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  hackathonText: {
    color: '#6366f1',
    fontSize: 9,
    fontWeight: '800',
  },
  tagline: {
    fontSize: 10,
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sosButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sosText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badgeCount: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeCountText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  userRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 148, 136, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  userRoleIcon: {
    fontSize: 12,
    marginRight: 5,
  },
  userName: {
    fontSize: 11,
    fontWeight: '700',
  },
  switchPersonaHint: {
    fontSize: 10,
    color: '#0d9488',
    marginLeft: 6,
    fontWeight: '600',
  },
  serverIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serverDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 5,
  },
  serverText: {
    fontSize: 10,
    fontWeight: '500',
  },
});
