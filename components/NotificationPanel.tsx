import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { X, Bell, CheckCircle, AlertTriangle, Info, Trash2 } from 'lucide-react-native';
import { IronManTheme } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/contexts/AppContext';
import { useMemo, useState } from 'react';

interface NotificationPanelProps {
  visible: boolean;
  onClose: () => void;
}

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export default function NotificationPanel({ visible, onClose }: NotificationPanelProps) {
  const { addSystemLog } = useApp();
  
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Content Published',
      message: 'Your Instagram post has been published successfully',
      timestamp: Date.now() - 300000,
      read: false,
    },
    {
      id: '2',
      type: 'info',
      title: 'New Trend Detected',
      message: 'AI Automation is trending with 45% growth',
      timestamp: Date.now() - 600000,
      read: false,
    },
    {
      id: '3',
      type: 'warning',
      title: 'API Key Expiring',
      message: 'Your OpenAI API key will expire in 7 days',
      timestamp: Date.now() - 1800000,
      read: true,
    },
    {
      id: '4',
      type: 'success',
      title: 'Revenue Milestone',
      message: 'You reached $25,000 in total revenue!',
      timestamp: Date.now() - 3600000,
      read: true,
    },
    {
      id: '5',
      type: 'info',
      title: 'Scheduled Task Completed',
      message: 'Auto-post daily content task finished successfully',
      timestamp: Date.now() - 7200000,
      read: true,
    },
  ]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    addSystemLog('info', 'Notification deleted', 'Notifications');
  };

  const clearAll = () => {
    setNotifications([]);
    addSystemLog('info', 'All notifications cleared', 'Notifications');
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addSystemLog('info', 'All notifications marked as read', 'Notifications');
  };

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} color={IronManTheme.success} />;
      case 'warning':
        return <AlertTriangle size={20} color={IronManTheme.warning} />;
      case 'error':
        return <AlertTriangle size={20} color={IronManTheme.primary} />;
      case 'info':
        return <Info size={20} color={IronManTheme.secondary} />;
    }
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return IronManTheme.success;
      case 'warning':
        return IronManTheme.warning;
      case 'error':
        return IronManTheme.primary;
      case 'info':
        return IronManTheme.secondary;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.panel}>
          <LinearGradient
            colors={[IronManTheme.background, 'rgba(255, 50, 50, 0.05)']}
            style={styles.gradient}
          />
          
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <Bell size={20} color={IronManTheme.primary} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Notifications</Text>
                {unreadCount > 0 && (
                  <Text style={styles.unreadCount}>{unreadCount} unread</Text>
                )}
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={IronManTheme.textSecondary} />
            </TouchableOpacity>
          </View>

          {notifications.length > 0 && (
            <View style={styles.actions}>
              <TouchableOpacity onPress={markAllAsRead} style={styles.actionButton}>
                <Text style={styles.actionText}>Mark All Read</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={clearAll} style={styles.actionButton}>
                <Text style={[styles.actionText, { color: IronManTheme.primary }]}>Clear All</Text>
              </TouchableOpacity>
            </View>
          )}

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {notifications.length === 0 ? (
              <View style={styles.emptyState}>
                <Bell size={48} color={IronManTheme.borderLight} />
                <Text style={styles.emptyTitle}>No Notifications</Text>
                <Text style={styles.emptyText}>You&apos;re all caught up!</Text>
              </View>
            ) : (
              notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationItem,
                    !notification.read && styles.unreadItem,
                  ]}
                  onPress={() => markAsRead(notification.id)}
                >
                  <View style={[styles.typeIndicator, { backgroundColor: getTypeColor(notification.type) }]} />
                  
                  <View style={styles.notificationIcon}>
                    {getIcon(notification.type)}
                  </View>

                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationTitle}>{notification.title}</Text>
                    <Text style={styles.notificationMessage}>{notification.message}</Text>
                    <Text style={styles.notificationTime}>{formatTimestamp(notification.timestamp)}</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => deleteNotification(notification.id)}
                    style={styles.deleteButton}
                  >
                    <Trash2 size={18} color={IronManTheme.textMuted} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  panel: {
    backgroundColor: IronManTheme.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    borderTopWidth: 2,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: IronManTheme.primary,
    shadowColor: IronManTheme.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    position: 'relative' as const,
  },
  gradient: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: IronManTheme.borderLight,
    zIndex: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: IronManTheme.glow.red,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: IronManTheme.primary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: IronManTheme.secondary,
    letterSpacing: 0.5,
  },
  unreadCount: {
    fontSize: 12,
    color: IronManTheme.textMuted,
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: IronManTheme.borderLight,
    zIndex: 1,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: IronManTheme.secondary,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: IronManTheme.textSecondary,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: IronManTheme.textMuted,
    marginTop: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingLeft: 24,
    borderBottomWidth: 1,
    borderBottomColor: IronManTheme.borderLight,
    position: 'relative' as const,
  },
  unreadItem: {
    backgroundColor: 'rgba(255, 50, 50, 0.03)',
  },
  typeIndicator: {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  notificationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: IronManTheme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: IronManTheme.borderLight,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: IronManTheme.text,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 13,
    color: IronManTheme.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 11,
    color: IronManTheme.textMuted,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});
