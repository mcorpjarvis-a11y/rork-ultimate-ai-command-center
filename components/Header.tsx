import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Bell, Zap } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { IronManTheme } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import NotificationPanel from './NotificationPanel';
import { useState } from 'react';

interface HeaderProps {
  title: string;
  section: string;
}

export default function Header({ title, section }: HeaderProps) {
  const { state } = useApp();
  const [notificationPanelVisible, setNotificationPanelVisible] = useState(false);

  return (
    <View style={styles.header}>
      <LinearGradient
        colors={['rgba(0, 0, 0, 0)', IronManTheme.glow.red]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      />
      <View style={styles.leftSection}>
        <View style={styles.iconContainer}>
          <Zap color={IronManTheme.primary} size={24} fill={IronManTheme.primary} />
        </View>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>JARVIS v1.0 | MARK VII</Text>
        </View>
      </View>
      <View style={styles.rightSection}>
        <Text style={styles.section}>{section}</Text>
        <TouchableOpacity 
          style={styles.notificationButton} 
          testID="notification-button"
          onPress={() => setNotificationPanelVisible(true)}
        >
          <View style={styles.notificationIcon}>
            <Bell color={IronManTheme.secondary} size={20} />
            {state.notifications > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{state.notifications}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
      
      <NotificationPanel 
        visible={notificationPanelVisible}
        onClose={() => setNotificationPanelVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: IronManTheme.background,
    borderBottomWidth: 2,
    borderBottomColor: IronManTheme.primary,
    position: 'relative' as const,
  },
  gradient: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.1,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 1,
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
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: IronManTheme.secondary,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 9,
    color: IronManTheme.textMuted,
    letterSpacing: 1.5,
    marginTop: 2,
    fontWeight: '600' as const,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    zIndex: 1,
  },
  section: {
    fontSize: 12,
    color: IronManTheme.textSecondary,
    letterSpacing: 0.5,
    fontWeight: '500' as const,
  },
  notificationButton: {
    position: 'relative' as const,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: IronManTheme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: IronManTheme.borderLight,
  },
  badge: {
    position: 'absolute' as const,
    top: -2,
    right: -2,
    backgroundColor: IronManTheme.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#000',
    shadowColor: IronManTheme.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 5,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700' as const,
  },
});
