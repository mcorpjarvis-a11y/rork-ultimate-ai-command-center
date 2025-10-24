import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/contexts/AppContext';
import { Download, Upload, RefreshCw, AlertTriangle } from 'lucide-react-native';

export default function BackupRestore() {
  const { backupData, resetAll } = useApp();
  const insets = useSafeAreaInsets();

  const handleBackup = async () => {
    const data = await backupData();
    console.log('Backup data:', data);
    Alert.alert('Success', 'Data backed up successfully');
  };

  const handleRestore = () => {
    Alert.alert('Restore Data', 'Restore functionality would allow importing backup JSON');
  };

  const handleReset = () => {
    Alert.alert(
      'Reset All Data',
      'This will delete all data and restore defaults. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive' as const,
          onPress: async () => {
            await resetAll();
            Alert.alert('Success', 'All data has been reset');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>Backup & Restore</Text>
        <Text style={styles.subtitle}>Manage your data backups and system reset</Text>

        <View style={styles.actionCard}>
          <Download color="#00E5FF" size={32} />
          <Text style={styles.actionTitle}>Create Backup</Text>
          <Text style={styles.actionDescription}>
            Export all your data to a backup file
          </Text>
          <TouchableOpacity style={styles.actionButton} onPress={handleBackup}>
            <Text style={styles.actionButtonText}>Create Backup</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionCard}>
          <Upload color="#00E5FF" size={32} />
          <Text style={styles.actionTitle}>Restore Backup</Text>
          <Text style={styles.actionDescription}>
            Import data from a backup file
          </Text>
          <TouchableOpacity style={styles.actionButton} onPress={handleRestore}>
            <Text style={styles.actionButtonText}>Restore Backup</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.actionCard, styles.dangerCard]}>
          <AlertTriangle color="#EF4444" size={32} />
          <Text style={[styles.actionTitle, styles.dangerTitle]}>Reset All Data</Text>
          <Text style={styles.actionDescription}>
            Delete all data and restore system to defaults
          </Text>
          <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={handleReset}>
            <RefreshCw size={20} color="#fff" />
            <Text style={[styles.actionButtonText, styles.dangerButtonText]}>Reset Everything</Text>
          </TouchableOpacity>
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
  actionCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1a1a1a',
    marginBottom: 16,
  },
  dangerCard: {
    borderColor: '#EF4444',
    backgroundColor: '#1a0a0a',
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  dangerTitle: {
    color: '#EF4444',
  },
  actionDescription: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center' as const,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#00E5FF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 200,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dangerButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#000',
  },
  dangerButtonText: {
    color: '#fff',
  },
});
