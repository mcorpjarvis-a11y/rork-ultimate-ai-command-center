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
  Modal,
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
  Wand2,
  Link2,
} from 'lucide-react-native';
import GoogleAuthAdapter from '@/services/auth/GoogleAuthAdapter';
import AuthManager from '@/services/auth/AuthManager';
import MasterProfile from '@/services/auth/MasterProfile';
import UserProfileService, { UserProfile } from '@/services/user/UserProfileService';
import GoogleDriveSync from '@/services/sync/GoogleDriveSync';
import SetupWizard from '@/components/SetupWizard';

export default function Settings() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [keyValue, setKeyValue] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);

  useEffect(() => {
    loadProfile();
    checkGoogleConnection();
  }, []);

  const loadProfile = async () => {
    const currentProfile = UserProfileService.getCurrentProfile();
    setProfile(currentProfile);
  };

  const checkGoogleConnection = async () => {
    const isConnected = await AuthManager.isConnected('google');
    setGoogleConnected(isConnected);
  };

  const handleConnectGoogle = async () => {
    try {
      setLoading(true);
      console.log('[Settings] Starting Google connection flow');

      const success = await AuthManager.startAuthFlow('google');

      if (!success) {
        Alert.alert(
          'Connection Failed', 
          'Could not connect to Google. This may happen if:\n\n' +
          '• You cancelled the connection\n' +
          '• There was a network issue\n' +
          '• You denied permissions\n\n' +
          'Please try again.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Update master profile to include Google
      const masterProfile = await MasterProfile.getMasterProfile();
      if (masterProfile) {
        // Get Google profile info
        const googleToken = await AuthManager.getAccessToken('google');
        if (googleToken) {
          try {
            const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
              headers: {
                Authorization: `Bearer ${googleToken}`,
              },
            });

            if (response.ok) {
              const googleProfile = await response.json();
              
              // Update master profile with Google info if not already set
              if (!masterProfile.avatar && googleProfile.picture) {
                await MasterProfile.updateProfileDetails({
                  avatar: googleProfile.picture,
                });
              }
            }
          } catch (error) {
            console.warn('[Settings] Could not fetch Google profile:', error);
          }
        }
      }

      setGoogleConnected(true);
      await loadProfile();
      
      Alert.alert(
        'Connected!',
        'Your Google account has been connected successfully. You can now use Google Drive sync.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('[Settings] Google connection error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      Alert.alert(
        'Connection Error',
        `Failed to connect Google account: ${errorMessage}\n\nPlease try again.`,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    Alert.alert(
      'Disconnect Google',
      'Are you sure you want to disconnect your Google account? You will lose access to Google Drive sync.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await AuthManager.revokeProvider('google');
              setGoogleConnected(false);
              await loadProfile();
              Alert.alert('Disconnected', 'Google account has been disconnected.');
            } catch (error) {
              console.error('[Settings] Google disconnect error:', error);
              Alert.alert('Error', 'Failed to disconnect Google account.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRerunWizard = () => {
    setShowWizard(true);
  };

  const handleWizardComplete = async () => {
    setShowWizard(false);
    await loadProfile();
    Alert.alert('Success', 'Configuration updated successfully');
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
              await GoogleAuthAdapter.signOut();
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
              await GoogleAuthAdapter.revokeAccess();
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
    <>
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
          <Text style={styles.sectionTitle}>Connected Accounts</Text>
          
          <View style={styles.card}>
            <View style={styles.accountRow}>
              <View style={styles.accountInfo}>
                <Text style={styles.googleIcon}>G</Text>
                <View>
                  <Text style={styles.accountName}>Google Account</Text>
                  <Text style={styles.accountStatus}>
                    {googleConnected ? 'Connected' : 'Not connected'}
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.connectButton,
                  googleConnected && styles.disconnectButton,
                  loading && styles.buttonDisabled
                ]}
                onPress={googleConnected ? handleDisconnectGoogle : handleConnectGoogle}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    {googleConnected ? null : <Link2 size={16} color="#fff" />}
                    <Text style={styles.connectButtonText}>
                      {googleConnected ? 'Disconnect' : 'Connect'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
            
            {googleConnected && (
              <Text style={styles.helpText}>
                Google Drive sync is enabled for backup and restore
              </Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OAuth Services (Connected Services)</Text>
          <Text style={styles.sectionSubtitle}>
            Manage your connected OAuth providers separately from API keys
          </Text>
          
          {[
            { id: 'google', name: 'Google', icon: '🔵', description: 'Gmail, Drive, YouTube' },
            { id: 'github', name: 'GitHub', icon: '⚫', description: 'Code repositories' },
            { id: 'discord', name: 'Discord', icon: '🟣', description: 'Server management' },
            { id: 'reddit', name: 'Reddit', icon: '🟠', description: 'Community posts' },
            { id: 'spotify', name: 'Spotify', icon: '🟢', description: 'Music playback' },
            { id: 'twitter', name: 'Twitter/X', icon: '⚪', description: 'Social posts' },
            { id: 'youtube', name: 'YouTube', icon: '🔴', description: 'Video upload' },
            { id: 'instagram', name: 'Instagram', icon: '🟣', description: 'Photo posts' },
            { id: 'notion', name: 'Notion', icon: '⚫', description: 'Workspace' },
            { id: 'slack', name: 'Slack', icon: '🟣', description: 'Team chat' },
          ].map((provider) => (
            <View key={provider.id} style={styles.card}>
              <View style={styles.accountRow}>
                <View style={styles.accountInfo}>
                  <Text style={styles.providerIcon}>{provider.icon}</Text>
                  <View>
                    <Text style={styles.accountName}>{provider.name}</Text>
                    <Text style={styles.accountDescription}>{provider.description}</Text>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={[styles.connectButton, loading && styles.buttonDisabled]}
                  onPress={async () => {
                    try {
                      setLoading(true);
                      const isConnected = await AuthManager.isConnected(provider.id);
                      
                      if (isConnected) {
                        Alert.alert(
                          'Disconnect',
                          `Disconnect ${provider.name}?`,
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Disconnect',
                              style: 'destructive',
                              onPress: async () => {
                                await AuthManager.revokeProvider(provider.id);
                                Alert.alert('Disconnected', `${provider.name} has been disconnected.`);
                              },
                            },
                          ]
                        );
                      } else {
                        const success = await AuthManager.startAuthFlow(provider.id);
                        if (success) {
                          Alert.alert('Success', `${provider.name} connected!`);
                        }
                      }
                    } catch (error) {
                      console.error(`[Settings] ${provider.name} error:`, error);
                      Alert.alert('Error', `Failed to connect ${provider.name}.`);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.connectButtonText}>Manage</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleRerunWizard}
          >
            <Wand2 size={18} color="#00f2ff" />
            <Text style={[styles.actionButtonText, styles.primaryActionText]}>
              Run Setup Wizard
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.helpText}>
            💡 Use this to update your API keys or reconfigure JARVIS at any time
          </Text>
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

    <Modal
      visible={showWizard}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SetupWizard 
        visible={showWizard} 
        onClose={handleWizardComplete}
      />
    </Modal>
  </>
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
  primaryActionText: {
    color: '#00f2ff',
  },
  helpText: {
    color: '#888',
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
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
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  googleIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00f2ff',
    marginRight: 12,
    width: 32,
    height: 32,
    textAlign: 'center',
    lineHeight: 32,
  },
  accountName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  accountStatus: {
    color: '#888',
    fontSize: 13,
    marginTop: 2,
  },
  connectButton: {
    backgroundColor: '#00f2ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  disconnectButton: {
    backgroundColor: '#ff4444',
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: -8,
    marginBottom: 12,
  },
  providerIcon: {
    fontSize: 24,
    marginRight: 12,
    width: 32,
    height: 32,
    textAlign: 'center',
    lineHeight: 32,
  },
  accountDescription: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
});
