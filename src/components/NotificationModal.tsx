import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { NotificationItem } from '../types';

interface Props {
  visible: boolean;
  notifications: NotificationItem[];
  onClose: () => void;
  onMarkRead: (id: number) => void;
  onMarkAllRead: () => void;
  isDark: boolean;
}

export const NotificationModal: React.FC<Props> = ({
  visible,
  notifications,
  onClose,
  onMarkRead,
  onMarkAllRead,
  isDark,
}) => {
  const bg = isDark ? '#151c2c' : '#ffffff';
  const borderCol = isDark ? '#243048' : '#e2e8f0';
  const textCol = isDark ? '#f8fafc' : '#0f172a';
  const subtextCol = isDark ? '#94a3b8' : '#64748b';

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.modalCard, { backgroundColor: bg, borderColor: borderCol }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: textCol }]}>Municipal Notifications</Text>
              <Text style={[styles.subtitle, { color: subtextCol }]}>
                Real-time grievance updates & alerts
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={{ fontSize: 18, color: subtextCol }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Action Row */}
          <View style={styles.actionRow}>
            <Text style={[styles.countText, { color: subtextCol }]}>
              {notifications.length} Total Alerts
            </Text>
            {notifications.length > 0 && (
              <TouchableOpacity onPress={onMarkAllRead}>
                <Text style={styles.markAllText}>Mark all as read</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* List */}
          <ScrollView style={styles.list}>
            {notifications.length === 0 ? (
              <View style={styles.emptyWrap}>
                <Text style={{ fontSize: 28, marginBottom: 8 }}>🔔</Text>
                <Text style={[styles.emptyText, { color: subtextCol }]}>No new notifications</Text>
              </View>
            ) : (
              notifications.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.item,
                    {
                      borderColor: borderCol,
                      backgroundColor: item.read ? 'transparent' : 'rgba(13, 148, 136, 0.06)',
                    },
                  ]}
                  onPress={() => onMarkRead(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemTop}>
                    {!item.read && <View style={styles.unreadDot} />}
                    <Text style={[styles.itemMessage, { color: textCol }]} numberOfLines={2}>
                      {item.message}
                    </Text>
                  </View>
                  <Text style={[styles.itemTime, { color: subtextCol }]}>
                    {new Date(item.created_at).toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    maxHeight: '75%',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
  },
  countText: {
    fontSize: 11,
  },
  markAllText: {
    fontSize: 11,
    color: '#0d9488',
    fontWeight: '700',
  },
  list: {
    marginBottom: 16,
  },
  emptyWrap: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
  },
  item: {
    borderRadius: 8,
    borderWidth: 0.5,
    padding: 10,
    marginBottom: 8,
  },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0d9488',
    marginRight: 6,
    marginTop: 4,
  },
  itemMessage: {
    fontSize: 13,
    lineHeight: 17,
    flex: 1,
  },
  itemTime: {
    fontSize: 10,
  },
});
