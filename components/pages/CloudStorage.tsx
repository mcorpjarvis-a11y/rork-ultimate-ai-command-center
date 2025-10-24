import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Cloud, Upload, Download, Folder, File, Trash2, RefreshCw, HardDrive, CheckCircle, AlertCircle, Plus, Link as LinkIcon } from 'lucide-react-native';
import GoogleDriveService, { GoogleDriveFile } from '@/services/GoogleDriveService';
import { useApp } from '@/contexts/AppContext';

export default function CloudStorage() {
  const { backupData, restoreData, addSystemLog } = useApp();
  const insets = useSafeAreaInsets();
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [storageQuota, setStorageQuota] = useState<{ used: number; limit: number } | null>(null);
  const [accessToken, setAccessToken] = useState('');
  const [showConnectDialog, setShowConnectDialog] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    await GoogleDriveService.initialize();
    const authenticated = GoogleDriveService.isAuthenticated();
    setIsConnected(authenticated);
    
    if (authenticated) {
      await loadFiles();
      await loadQuota();
    }
  };

  const loadFiles = async () => {
    setIsLoading(true);
    const driveFiles = await GoogleDriveService.listBackups();
    setFiles(driveFiles.sort((a, b) => b.createdTime - a.createdTime));
    setIsLoading(false);
  };

  const loadQuota = async () => {
    const quota = await GoogleDriveService.getStorageQuota();
    setStorageQuota(quota);
  };

  const handleConnect = async () => {
    if (!accessToken.trim()) {
      Alert.alert('Error', 'Please enter your access token');
      return;
    }

    try {
      setIsLoading(true);
      await GoogleDriveService.authenticate(accessToken, '', 3600);
      setIsConnected(true);
      setShowConnectDialog(false);
      setAccessToken('');
      await loadFiles();
      await loadQuota();
      addSystemLog('success', 'Connected to Google Drive', 'Cloud Storage');
      Alert.alert('Success', 'Connected to Google Drive successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to Google Drive');
      addSystemLog('error', 'Failed to connect to Google Drive', 'Cloud Storage');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    Alert.alert(
      'Disconnect Google Drive',
      'Are you sure you want to disconnect from Google Drive?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            await GoogleDriveService.disconnect();
            setIsConnected(false);
            setFiles([]);
            setStorageQuota(null);
            addSystemLog('info', 'Disconnected from Google Drive', 'Cloud Storage');
          },
        },
      ]
    );
  };

  const handleBackup = async () => {
    try {
      setIsLoading(true);
      const data = await backupData();
      const file = await GoogleDriveService.backupAppData(data);
      
      if (file) {
        Alert.alert('Success', 'Backup created successfully');
        addSystemLog('success', `Backup created: ${file.name}`, 'Cloud Storage');
        await loadFiles();
      } else {
        Alert.alert('Error', 'Failed to create backup');
        addSystemLog('error', 'Failed to create backup', 'Cloud Storage');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create backup');
      addSystemLog('error', 'Failed to create backup', 'Cloud Storage');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (fileId: string, fileName: string) => {
    Alert.alert(
      'Restore Backup',
      `Are you sure you want to restore from "${fileName}"? This will overwrite all current data.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              const data = await GoogleDriveService.restoreFromBackup(fileId);
              
              if (data) {
                const success = await restoreData(data);
                if (success) {
                  Alert.alert('Success', 'Data restored successfully');
                  addSystemLog('success', `Data restored from: ${fileName}`, 'Cloud Storage');
                } else {
                  Alert.alert('Error', 'Failed to restore data');
                  addSystemLog('error', 'Failed to restore data', 'Cloud Storage');
                }
              } else {
                Alert.alert('Error', 'Failed to download backup');
                addSystemLog('error', 'Failed to download backup', 'Cloud Storage');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to restore backup');
              addSystemLog('error', 'Failed to restore backup', 'Cloud Storage');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDelete = async (fileId: string, fileName: string) => {
    Alert.alert(
      'Delete Backup',
      `Are you sure you want to delete "${fileName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              const success = await GoogleDriveService.deleteFile(fileId);
              
              if (success) {
                Alert.alert('Success', 'Backup deleted successfully');
                addSystemLog('info', `Backup deleted: ${fileName}`, 'Cloud Storage');
                await loadFiles();
              } else {
                Alert.alert('Error', 'Failed to delete backup');
                addSystemLog('error', 'Failed to delete backup', 'Cloud Storage');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete backup');
              addSystemLog('error', 'Failed to delete backup', 'Cloud Storage');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Cloud size={32} color="#00E5FF" />
          <Text style={styles.pageTitle}>Cloud Storage</Text>
          <Text style={styles.subtitle}>Backup and sync your data with Google Drive</Text>
        </View>

        {!isConnected ? (
          <View style={styles.connectSection}>
            <View style={styles.connectCard}>
              <Cloud size={48} color="#666" />
              <Text style={styles.connectTitle}>Connect to Google Drive</Text>
              <Text style={styles.connectDescription}>
                Securely backup your AI command center data to Google Drive and access it from anywhere.
              </Text>
              
              {showConnectDialog ? (
                <View style={styles.connectDialog}>
                  <Text style={styles.inputLabel}>Google Drive Access Token</Text>
                  <TextInput
                    style={styles.input}
                    value={accessToken}
                    onChangeText={setAccessToken}
                    placeholder="Enter your access token"
                    placeholderTextColor="#666"
                    secureTextEntry
                  />
                  <View style={styles.dialogButtons}>
                    <TouchableOpacity 
                      style={[styles.button, styles.buttonSecondary]} 
                      onPress={() => setShowConnectDialog(false)}
                    >
                      <Text style={styles.buttonSecondaryText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.button, styles.buttonPrimary]} 
                      onPress={handleConnect}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator color="#000" size="small" />
                      ) : (
                        <Text style={styles.buttonPrimaryText}>Connect</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity 
                  style={[styles.button, styles.buttonPrimary, styles.connectButton]} 
                  onPress={() => setShowConnectDialog(true)}
                >
                  <LinkIcon size={18} color="#000" />
                  <Text style={styles.buttonPrimaryText}>Connect Google Drive</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <>
            <View style={styles.statusSection}>
              <View style={styles.statusCard}>
                <View style={styles.statusHeader}>
                  <CheckCircle size={24} color="#10B981" />
                  <View style={styles.statusInfo}>
                    <Text style={styles.statusTitle}>Connected to Google Drive</Text>
                    <Text style={styles.statusDescription}>Your data is being synced automatically</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.disconnectButton} onPress={handleDisconnect}>
                  <Text style={styles.disconnectButtonText}>Disconnect</Text>
                </TouchableOpacity>
              </View>

              {storageQuota && (
                <View style={styles.quotaCard}>
                  <HardDrive size={24} color="#00E5FF" />
                  <View style={styles.quotaInfo}>
                    <Text style={styles.quotaLabel}>Storage Used</Text>
                    <Text style={styles.quotaValue}>
                      {formatBytes(storageQuota.used)} / {formatBytes(storageQuota.limit)}
                    </Text>
                    <View style={styles.quotaBar}>
                      <View 
                        style={[
                          styles.quotaBarFill, 
                          { width: `${(storageQuota.used / storageQuota.limit) * 100}%` }
                        ]} 
                      />
                    </View>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity 
                style={[styles.button, styles.buttonPrimary]} 
                onPress={handleBackup}
                disabled={isLoading}
              >
                <Upload size={18} color="#000" />
                <Text style={styles.buttonPrimaryText}>Create Backup</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.buttonSecondary]} 
                onPress={loadFiles}
                disabled={isLoading}
              >
                <RefreshCw size={18} color="#00E5FF" />
                <Text style={styles.buttonSecondaryText}>Refresh</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.filesSection}>
              <Text style={styles.sectionTitle}>Backups ({files.length})</Text>
              
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#00E5FF" />
                  <Text style={styles.loadingText}>Loading backups...</Text>
                </View>
              ) : files.length === 0 ? (
                <View style={styles.emptyState}>
                  <Folder size={48} color="#666" />
                  <Text style={styles.emptyStateTitle}>No backups yet</Text>
                  <Text style={styles.emptyStateDescription}>
                    Create your first backup to start protecting your data
                  </Text>
                </View>
              ) : (
                <View style={styles.filesList}>
                  {files.map((file) => (
                    <View key={file.id} style={styles.fileCard}>
                      <File size={20} color="#00E5FF" />
                      <View style={styles.fileInfo}>
                        <Text style={styles.fileName}>{file.name}</Text>
                        <Text style={styles.fileDetails}>
                          {formatBytes(file.size)} • {formatDate(file.createdTime)}
                        </Text>
                      </View>
                      <View style={styles.fileActions}>
                        <TouchableOpacity 
                          style={styles.fileActionButton}
                          onPress={() => handleRestore(file.id, file.name)}
                        >
                          <Download size={18} color="#10B981" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.fileActionButton}
                          onPress={() => handleDelete(file.id, file.name)}
                        >
                          <Trash2 size={18} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )}
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#00E5FF',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center' as const,
  },
  connectSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  connectCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    alignItems: 'center',
    maxWidth: 400,
  },
  connectTitle: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  connectDescription: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center' as const,
    lineHeight: 20,
    marginBottom: 24,
  },
  connectDialog: {
    width: '100%',
    gap: 16,
  },
  inputLabel: {
    fontSize: 13,
    color: '#ccc',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  dialogButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 10,
    flex: 1,
  },
  buttonPrimary: {
    backgroundColor: '#00E5FF',
  },
  buttonSecondary: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  buttonPrimaryText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#000',
  },
  buttonSecondaryText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#00E5FF',
  },
  connectButton: {
    width: '100%',
  },
  statusSection: {
    gap: 16,
    marginBottom: 24,
  },
  statusCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#10B98130',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#10B981',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 13,
    color: '#888',
  },
  disconnectButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  disconnectButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#EF4444',
  },
  quotaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  quotaInfo: {
    flex: 1,
  },
  quotaLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  quotaValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 8,
  },
  quotaBar: {
    height: 6,
    backgroundColor: '#1a1a1a',
    borderRadius: 3,
    overflow: 'hidden',
  },
  quotaBarFill: {
    height: '100%',
    backgroundColor: '#00E5FF',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  filesSection: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#00E5FF',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#888',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#fff',
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center' as const,
  },
  filesList: {
    gap: 12,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 4,
  },
  fileDetails: {
    fontSize: 12,
    color: '#666',
  },
  fileActions: {
    flexDirection: 'row',
    gap: 8,
  },
  fileActionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
  },
});
