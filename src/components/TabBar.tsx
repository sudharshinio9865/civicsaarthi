import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TabScreen, UserRole } from '../types';

interface Props {
  currentTab: TabScreen;
  onSelectTab: (tab: TabScreen) => void;
  userRole?: UserRole;
  isDark: boolean;
}

export const TabBar: React.FC<Props> = ({ currentTab, onSelectTab, userRole = 'citizen', isDark }) => {
  const bg = isDark ? '#0f172a' : '#ffffff';
  const border = isDark ? '#1e293b' : '#e2e8f0';
  const activeColor = '#0d9488'; // Teal
  const inactiveColor = isDark ? '#64748b' : '#94a3b8';

  const tabs: Array<{ key: TabScreen; label: string; icon: string; isAction?: boolean }> = [
    { key: 'home', label: 'Home', icon: '🏠' },
    { key: 'map', label: 'Civic Map', icon: '🗺️' },
    { key: 'report', label: 'Report Issue', icon: '➕', isAction: true },
    { key: 'complaints', label: 'Complaints', icon: '📋' },
    { key: 'profile', label: 'Profile', icon: '⚙️' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: bg, borderTopColor: border }]}>
      {tabs.map((tab) => {
        const isActive = currentTab === tab.key;

        if (tab.isAction) {
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.actionTab}
              onPress={() => onSelectTab(tab.key)}
              activeOpacity={0.85}
              accessibilityLabel={tab.label}
            >
              <View style={styles.actionCircle}>
                <Text style={styles.actionIcon}>{tab.icon}</Text>
              </View>
              <Text style={[styles.tabLabel, { color: isActive ? activeColor : inactiveColor }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onSelectTab(tab.key)}
            activeOpacity={0.7}
            accessibilityLabel={tab.label}
          >
            <Text style={[styles.tabIcon, isActive && { transform: [{ scale: 1.1 }] }]}>
              {tab.icon}
            </Text>
            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? activeColor : inactiveColor },
                isActive && styles.activeTabLabel,
              ]}
            >
              {tab.label}
            </Text>
            {isActive && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 64,
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 4,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
  },
  actionTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    marginTop: -12,
  },
  actionCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0d9488',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  actionIcon: {
    fontSize: 20,
    color: '#ffffff',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  activeTabLabel: {
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 16,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#0d9488',
  },
});
