import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  User,
  Key,
  Cloud,
  LogOut,
  RefreshCw,
  Shield,
  Trash2,
  Settings as SettingsIcon,
} from 'lucide-react-native';
import GoogleAuthService from '@/services/auth/GoogleAuthService';
import UserProfileService, { UserProfile } from '@/services/user/UserProfileService';
import GoogleDriveSync from '@/services/sync/GoogleDriveSync';

export default function Settings() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [keyValue, setKeyValue] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const currentProfile = UserProfileService.getCurrentProfile();
    setProfile(currentProfile);
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await GoogleDriveSync.syncProfile();
      Alert.alert('Success', 'Profile synced with cloud');
      await loadProfile();
    } catch (error) {
      Alert.alert('Error', 'Failed to sync profile');
      console.error('[Settings] Sync error:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleEditKey = (service: string) => {
    const currentKey = profile?.apiKeys[service as keyof UserProfile['apiKeys']] || '';
    setKeyValue(currentKey);
    setEditingKey(service);
  };

  const handleSaveKey = async () => {
    if (!editingKey) return;

    try {
      setLoading(true);
      if (keyValue.trim()) {
        await UserProfileService.saveAPIKey(editingKey, keyValue.trim());
        Alert.alert('Success', `${editingKey} API key updated`);
      } else {
        await UserProfileService.deleteAPIKey(editingKey);
        Alert.alert('Success', `${editingKey} API key removed`);
      }
      await loadProfile();
      setEditingKey(null);
      setKeyValue('');
    } catch (error) {
      Alert.alert('Error', 'Failed to update API key');
      console.error('[Settings] Save key error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? Your data is safely stored and will be restored when you sign in again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              // Sync before logout
              await GoogleDriveSync.uploadProfile();
              await GoogleAuthService.signOut();
              await UserProfileService.clearProfile();
              // Reload app (this will show the wizard again)
              Alert.alert('Logged Out', 'Please restart the app');
            } catch (error) {
              console.error('[Settings] Logout error:', error);
              Alert.alert('Error', 'Failed to logout properly');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and will remove all your data from the cloud.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await GoogleDriveSync.deleteProfile();
              await GoogleAuthService.revokeAccess();
              await UserProfileService.clearProfile();
              Alert.alert('Account Deleted', 'Please restart the app');
            } catch (error) {
              console.error('[Settings] Delete account error:', error);
              Alert.alert('Error', 'Failed to delete account');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const services = [
    { id: 'groq', name: 'Groq', tier: 'Free' },
    { id: 'gemini', name: 'Google Gemini', tier: 'Free Tier' },
    { id: 'huggingface', name: 'HuggingFace', tier: 'Free' },
    { id: 'openai', name: 'OpenAI', tier: 'Paid' },
    { id: 'anthropic', name: 'Anthropic Claude', tier: 'Paid' },
    { id: 'together', name: 'Together.ai', tier: 'Free Tier' },
    { id: 'deepseek', name: 'DeepSeek', tier: 'Free Tier' },
  ];

  const getSyncStatus = () => {
    const status = GoogleDriveSync.getSyncStatus();
    if (status.syncInProgress) return 'Syncing...';
    if (status.lastError) return `Error: ${status.lastError}`;
    if (status.lastSyncTime) {
      const date = new Date(status.lastSyncTime);
      return `Last synced: ${date.toLocaleString()}`;
    }
    return 'Not synced yet';
  };

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.noProfileText}>No profile loaded</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <User size={24} color="#00f2ff" />
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>{profile.name}</Text>
              <Text style={styles.cardSubtitle}>{profile.email}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cloud Sync</Text>
        
        <View style={styles.card}>
          <View style={styles.syncStatus}>
            <Cloud size={20} color="#00f2ff" />
            <Text style={styles.syncStatusText}>{getSyncStatus()}</Text>
          </View>
          
          <TouchableOpacity
            style={[styles.button, syncing && styles.buttonDisabled]}
            onPress={handleSync}
            disabled={syncing}
          >
            {syncing ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <>
                <RefreshCw size={18} color="#000" />
                <Text style={styles.buttonText}>Sync Now</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>API Keys</Text>
        
        {services.map((service) => {
          const hasKey = !!profile.apiKeys[service.id as keyof UserProfile['apiKeys']];
          const isEditing = editingKey === service.id;

          return (
            <View key={service.id} style={styles.card}>
              <View style={styles.apiKeyHeader}>
                <View style={styles.apiKeyInfo}>
                  <Text style={styles.apiKeyName}>{service.name}</Text>
                  <View style={styles.tierBadge}>
                    <Text style={styles.tierText}>{service.tier}</Text>
                  </View>
                </View>
                <View style={styles.keyStatus}>
                  {hasKey ? (
                    <Shield size={16} color="#00ff00" />
                  ) : (
                    <Shield size={16} color="#666" />
                  )}
                  <Text style={[styles.keyStatusText, hasKey && styles.keyStatusActive]}>
                    {hasKey ? 'Configured' : 'Not set'}
                  </Text>
                </View>
              </View>

              {isEditing && (
                <View style={styles.editContainer}>
                  <TextInput
                    style={styles.input}
                    value={keyValue}
                    onChangeText={setKeyValue}
                    placeholder="Enter API key"
                    placeholderTextColor="#666"
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry
                  />
                  <View style={styles.editButtons}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => {
                        setEditingKey(null);
                        setKeyValue('');
                      }}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.saveButton, loading && styles.buttonDisabled]}
                      onPress={handleSaveKey}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator size="small" color="#000" />
                      ) : (
                        <Text style={styles.saveButtonText}>Save</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {!isEditing && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => handleEditKey(service.id)}
                >
                  <Key size={16} color="#00f2ff" />
                  <Text style={styles.editButtonText}>
                    {hasKey ? 'Update' : 'Add'} Key
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        <TouchableOpacity
          style={[styles.actionButton, loading && styles.buttonDisabled]}
          onPress={handleLogout}
          disabled={loading}
        >
          <LogOut size={18} color="#fff" />
          <Text style={styles.actionButtonText}>Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.dangerButton, loading && styles.buttonDisabled]}
          onPress={handleDeleteAccount}
          disabled={loading}
        >
          <Trash2 size={18} color="#ff4444" />
          <Text style={[styles.actionButtonText, styles.dangerText]}>
            Delete Account
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Your API keys are stored securely using hardware encryption
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  noProfileText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  syncStatusText: {
    color: '#ccc',
    fontSize: 13,
  },
  button: {
    backgroundColor: '#00f2ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  apiKeyHeader: {
    marginBottom: 12,
  },
  apiKeyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  apiKeyName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  tierBadge: {
    backgroundColor: '#00ff0020',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tierText: {
    color: '#00ff00',
    fontSize: 11,
    fontWeight: '600',
  },
  keyStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  keyStatusText: {
    fontSize: 13,
    color: '#666',
  },
  keyStatusActive: {
    color: '#00ff00',
  },
  editContainer: {
    marginTop: 8,
  },
  input: {
    backgroundColor: '#0a0a0a',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 8,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#00f2ff',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  editButtonText: {
    color: '#00f2ff',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#1a1a1a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    gap: 8,
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  dangerButton: {
    borderColor: '#ff4444',
  },
  dangerText: {
    color: '#ff4444',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
});
