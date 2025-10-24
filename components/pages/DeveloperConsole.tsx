import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/contexts/AppContext';
import { Terminal } from 'lucide-react-native';

export default function DeveloperConsole() {
  const { state } = useApp();
  const insets = useSafeAreaInsets();

  const consoleEntries = [
    { id: '1', type: 'info', message: 'System initialized', timestamp: Date.now() - 300000 },
    { id: '2', type: 'success', message: 'API connection established', timestamp: Date.now() - 240000 },
    { id: '3', type: 'info', message: 'Loading AI modules...', timestamp: Date.now() - 180000 },
    { id: '4', type: 'success', message: 'AI modules loaded successfully', timestamp: Date.now() - 120000 },
    { id: '5', type: 'info', message: `State: ${Object.keys(state).length} keys`, timestamp: Date.now() - 60000 },
  ];

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>Developer Console</Text>
        <Text style={styles.subtitle}>System logs and debugging information</Text>

        <View style={styles.consoleCard}>
          <View style={styles.consoleHeader}>
            <Terminal color="#00E5FF" size={20} />
            <Text style={styles.consoleTitle}>Console Output</Text>
          </View>
          <View style={styles.consoleOutput}>
            {consoleEntries.map((entry) => (
              <Text key={entry.id} style={styles.consoleEntry}>
                <Text style={styles.consoleTimestamp}>
                  [{new Date(entry.timestamp).toLocaleTimeString()}]
                </Text>
                <Text style={[styles.consoleType, entry.type === 'info' ? styles.typeinfo : entry.type === 'success' ? styles.typesuccess : styles.typeerror]}>
                  {' '}{entry.type.toUpperCase()}:
                </Text>
                <Text style={styles.consoleMessage}> {entry.message}</Text>
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>System Stats</Text>
          <View style={styles.statsList}>
            <View style={styles.statRow}>
              <Text style={styles.statKey}>Total Insights:</Text>
              <Text style={styles.statValue}>{state.insights.length}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statKey}>API Keys:</Text>
              <Text style={styles.statValue}>{state.apiKeys.length}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statKey}>Social Accounts:</Text>
              <Text style={styles.statValue}>{state.socialAccounts.length}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statKey}>Scheduled Tasks:</Text>
              <Text style={styles.statValue}>{state.scheduledTasks.length}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statKey}>Workflow Rules:</Text>
              <Text style={styles.statValue}>{state.workflowRules.length}</Text>
            </View>
          </View>
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
  consoleCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    marginBottom: 24,
  },
  consoleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  consoleTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  consoleOutput: {
    gap: 8,
  },
  consoleEntry: {
    fontFamily: 'monospace' as const,
    fontSize: 12,
    color: '#ccc',
    lineHeight: 18,
  },
  consoleTimestamp: {
    color: '#666',
  },
  consoleType: {
    fontWeight: '600' as const,
  },
  typeinfo: {
    color: '#3B82F6',
  },
  typesuccess: {
    color: '#10B981',
  },
  typeerror: {
    color: '#EF4444',
  },
  consoleMessage: {
    color: '#ccc',
  },
  statsCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 16,
  },
  statsList: {
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statKey: {
    fontSize: 14,
    color: '#888',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#00E5FF',
  },
});
