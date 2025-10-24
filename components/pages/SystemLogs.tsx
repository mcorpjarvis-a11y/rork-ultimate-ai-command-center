import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/contexts/AppContext';
import { Info, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react-native';

export default function SystemLogs() {
  const { state } = useApp();
  const insets = useSafeAreaInsets();

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'info':
        return <Info color="#3B82F6" size={18} />;
      case 'warning':
        return <AlertTriangle color="#F59E0B" size={18} />;
      case 'error':
        return <AlertCircle color="#EF4444" size={18} />;
      case 'success':
        return <CheckCircle color="#10B981" size={18} />;
      default:
        return <Info color="#888" size={18} />;
    }
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case 'info':
        return '#3B82F6';
      case 'warning':
        return '#F59E0B';
      case 'error':
        return '#EF4444';
      case 'success':
        return '#10B981';
      default:
        return '#888';
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>System Logs</Text>
        <Text style={styles.subtitle}>Monitor all system activities and events</Text>

        <View style={styles.logsContainer}>
          {state.systemLogs.map((log) => (
            <View key={log.id} style={styles.logCard}>
              <View style={styles.logHeader}>
                {getLogIcon(log.level)}
                <Text style={[styles.logCategory, { color: getLogColor(log.level) }]}>
                  {log.category}
                </Text>
                <Text style={styles.logTime}>
                  {new Date(log.timestamp).toLocaleTimeString()}
                </Text>
              </View>
              <Text style={styles.logMessage}>{log.message}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#00E5FF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
  },
  logsContainer: {
    gap: 12,
  },
  logCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  logCategory: {
    fontSize: 13,
    fontWeight: '600' as const,
    flex: 1,
  },
  logTime: {
    fontSize: 12,
    color: '#666',
  },
  logMessage: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
});
