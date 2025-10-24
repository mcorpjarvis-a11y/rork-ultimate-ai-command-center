import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Shield, Lock, Eye, Key, AlertTriangle, CheckCircle, Clock, Activity, Settings, LogOut } from 'lucide-react-native';
import SecurityService, { SecurityEvent, AccessToken, SecuritySettings } from '@/services/SecurityService';
import { useApp } from '@/contexts/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Security() {
  const { addSystemLog } = useApp();
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [tokens, setTokens] = useState<AccessToken[]>([]);
  const [settings, setSettings] = useState<SecuritySettings | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await SecurityService.initialize();
    const securityEvents = await SecurityService.getEvents(50);
    const accessTokens = await SecurityService.getAccessTokens();
    const securitySettings = await SecurityService.getSettings();
    
    setEvents(securityEvents);
    setTokens(accessTokens);
    setSettings(securitySettings);
  };

  const handleToggleSetting = async (key: keyof SecuritySettings, value: boolean) => {
    if (!settings) return;
    
    const newSettings = { ...settings, [key]: value };
    const success = await SecurityService.saveSettings(newSettings);
    
    if (success) {
      setSettings(newSettings);
      addSystemLog('success', `Security setting updated: ${key}`, 'Security');
    }
  };

  const handleGenerateToken = async () => {
    Alert.prompt(
      'Generate Access Token',
      'Enter a name for this token:',
      async (name) => {
        if (!name.trim()) return;
        
        try {
          const token = await SecurityService.generateAccessToken(name, ['read', 'write']);
          Alert.alert(
            'Token Generated',
            `Token: ${token.token}\n\nCopy this token now. You won't be able to see it again.`,
            [{ text: 'OK' }]
          );
          await loadData();
        } catch {
          Alert.alert('Error', 'Failed to generate token');
        }
      }
    );
  };

  const handleRevokeToken = async (id: string, name: string) => {
    Alert.alert(
      'Revoke Token',
      `Are you sure you want to revoke the token "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            const success = await SecurityService.revokeAccessToken(id);
            if (success) {
              Alert.alert('Success', 'Token revoked successfully');
              await loadData();
            } else {
              Alert.alert('Error', 'Failed to revoke token');
            }
          },
        },
      ]
    );
  };

  const handleExportReport = async () => {
    try {
      const report = await SecurityService.exportSecurityReport();
      Alert.alert(
        'Security Report',
        `Report generated with ${events.length} events.\n\nReport preview:\n${report.substring(0, 200)}...`,
        [{ text: 'OK' }]
      );
      addSystemLog('success', 'Security report exported', 'Security');
    } catch {
      Alert.alert('Error', 'Failed to export security report');
    }
  };

  const getSeverityColor = (severity: SecurityEvent['severity']) => {
    switch (severity) {
      case 'critical': return '#EF4444';
      case 'high': return '#F59E0B';
      case 'medium': return '#3B82F6';
      case 'low': return '#10B981';
    }
  };

  const getSeverityIcon = (severity: SecurityEvent['severity']) => {
    if (severity === 'critical' || severity === 'high') {
      return <AlertTriangle size={16} color={getSeverityColor(severity)} />;
    }
    return <CheckCircle size={16} color={getSeverityColor(severity)} />;
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const criticalEvents = events.filter(e => e.severity === 'critical').length;
  const highEvents = events.filter(e => e.severity === 'high').length;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Shield size={32} color="#00E5FF" />
          <Text style={styles.pageTitle}>Security Center</Text>
          <Text style={styles.subtitle}>Protect your AI command center with advanced security</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <AlertTriangle size={20} color="#EF4444" />
              <Text style={styles.statLabel}>Critical</Text>
            </View>
            <Text style={styles.statValue}>{criticalEvents}</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <AlertTriangle size={20} color="#F59E0B" />
              <Text style={styles.statLabel}>High Priority</Text>
            </View>
            <Text style={styles.statValue}>{highEvents}</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Activity size={20} color="#3B82F6" />
              <Text style={styles.statLabel}>Total Events</Text>
            </View>
            <Text style={styles.statValue}>{events.length}</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Key size={20} color="#10B981" />
              <Text style={styles.statLabel}>Active Tokens</Text>
            </View>
            <Text style={styles.statValue}>{tokens.length}</Text>
          </View>
        </View>

        {settings && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Settings size={20} color="#00E5FF" />
              <Text style={styles.sectionTitle}>Security Settings</Text>
            </View>

            <View style={styles.settingsList}>
              <View style={styles.settingCard}>
                <View style={styles.settingInfo}>
                  <Lock size={20} color="#fff" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>Two-Factor Authentication</Text>
                    <Text style={styles.settingDescription}>Add an extra layer of security</Text>
                  </View>
                </View>
                <Switch
                  value={settings.twoFactorEnabled}
                  onValueChange={(value) => handleToggleSetting('twoFactorEnabled', value)}
                  trackColor={{ false: '#1a1a1a', true: '#00E5FF' }}
                  thumbColor={settings.twoFactorEnabled ? '#fff' : '#666'}
                />
              </View>

              <View style={styles.settingCard}>
                <View style={styles.settingInfo}>
                  <Shield size={20} color="#fff" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>Data Encryption</Text>
                    <Text style={styles.settingDescription}>Encrypt sensitive data at rest</Text>
                  </View>
                </View>
                <Switch
                  value={settings.dataEncryptionEnabled}
                  onValueChange={(value) => handleToggleSetting('dataEncryptionEnabled', value)}
                  trackColor={{ false: '#1a1a1a', true: '#00E5FF' }}
                  thumbColor={settings.dataEncryptionEnabled ? '#fff' : '#666'}
                />
              </View>

              <View style={styles.settingCard}>
                <View style={styles.settingInfo}>
                  <Eye size={20} color="#fff" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>Audit Logging</Text>
                    <Text style={styles.settingDescription}>Track all system activities</Text>
                  </View>
                </View>
                <Switch
                  value={settings.auditLoggingEnabled}
                  onValueChange={(value) => handleToggleSetting('auditLoggingEnabled', value)}
                  trackColor={{ false: '#1a1a1a', true: '#00E5FF' }}
                  thumbColor={settings.auditLoggingEnabled ? '#fff' : '#666'}
                />
              </View>

              <View style={styles.settingCard}>
                <View style={styles.settingInfo}>
                  <AlertTriangle size={20} color="#fff" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>Suspicious Activity Detection</Text>
                    <Text style={styles.settingDescription}>AI-powered threat detection</Text>
                  </View>
                </View>
                <Switch
                  value={settings.suspiciousActivityDetection}
                  onValueChange={(value) => handleToggleSetting('suspiciousActivityDetection', value)}
                  trackColor={{ false: '#1a1a1a', true: '#00E5FF' }}
                  thumbColor={settings.suspiciousActivityDetection ? '#fff' : '#666'}
                />
              </View>

              <View style={styles.settingCard}>
                <View style={styles.settingInfo}>
                  <Activity size={20} color="#fff" />
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>API Rate Limiting</Text>
                    <Text style={styles.settingDescription}>Prevent abuse and attacks</Text>
                  </View>
                </View>
                <Switch
                  value={settings.apiRateLimiting}
                  onValueChange={(value) => handleToggleSetting('apiRateLimiting', value)}
                  trackColor={{ false: '#1a1a1a', true: '#00E5FF' }}
                  thumbColor={settings.apiRateLimiting ? '#fff' : '#666'}
                />
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Key size={20} color="#00E5FF" />
            <Text style={styles.sectionTitle}>Access Tokens</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleGenerateToken}>
              <Text style={styles.addButtonText}>+ Generate</Text>
            </TouchableOpacity>
          </View>

          {tokens.length === 0 ? (
            <View style={styles.emptyState}>
              <Key size={40} color="#666" />
              <Text style={styles.emptyStateText}>No access tokens yet</Text>
            </View>
          ) : (
            <View style={styles.tokensList}>
              {tokens.map((token) => (
                <View key={token.id} style={styles.tokenCard}>
                  <View style={styles.tokenInfo}>
                    <Text style={styles.tokenName}>{token.name}</Text>
                    <Text style={styles.tokenDetails}>
                      Created {formatTimestamp(token.createdAt)}
                      {token.lastUsed && ` • Last used ${formatTimestamp(token.lastUsed)}`}
                    </Text>
                    <View style={styles.tokenPermissions}>
                      {token.permissions.map((perm, idx) => (
                        <View key={idx} style={styles.permissionBadge}>
                          <Text style={styles.permissionText}>{perm}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.revokeButton}
                    onPress={() => handleRevokeToken(token.id, token.name)}
                  >
                    <Text style={styles.revokeButtonText}>Revoke</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Clock size={20} color="#00E5FF" />
            <Text style={styles.sectionTitle}>Recent Security Events</Text>
            <TouchableOpacity style={styles.exportButton} onPress={handleExportReport}>
              <Text style={styles.exportButtonText}>Export Report</Text>
            </TouchableOpacity>
          </View>

          {events.length === 0 ? (
            <View style={styles.emptyState}>
              <Activity size={40} color="#666" />
              <Text style={styles.emptyStateText}>No security events recorded</Text>
            </View>
          ) : (
            <View style={styles.eventsList}>
              {events.slice(0, 20).map((event) => (
                <View key={event.id} style={[styles.eventCard, { borderLeftColor: getSeverityColor(event.severity) }]}>
                  <View style={styles.eventHeader}>
                    {getSeverityIcon(event.severity)}
                    <Text style={styles.eventType}>{event.type.replace('_', ' ').toUpperCase()}</Text>
                    <Text style={styles.eventTime}>{formatTimestamp(event.timestamp)}</Text>
                  </View>
                  <Text style={styles.eventDescription}>{event.description}</Text>
                  <View style={styles.eventFooter}>
                    <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(event.severity) + '20' }]}>
                      <Text style={[styles.severityText, { color: getSeverityColor(event.severity) }]}>
                        {event.severity.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.eventCategory}>{event.category}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <LogOut size={20} color="#00E5FF" />
            <Text style={styles.sectionTitle}>Account Access</Text>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              Alert.alert(
                'Logout',
                'Are you sure you want to logout? You will need to enter your password again.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                      await AsyncStorage.removeItem('authenticated');
                      Alert.alert('Logged Out', 'Please restart the app to login again.', [
                        { text: 'OK', onPress: () => {} }
                      ]);
                    },
                  },
                ]
              );
            }}
          >
            <LogOut size={20} color="#F59E0B" />
            <Text style={styles.logoutButtonText}>Logout from JARVIS</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetPasswordButton}
            onPress={() => {
              Alert.alert(
                'Reset Password',
                'Are you sure you want to reset your password? This will delete your current credentials.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: async () => {
                      await AsyncStorage.removeItem('local_credentials');
                      await AsyncStorage.removeItem('authenticated');
                      Alert.alert('Password Reset', 'Please restart the app to create a new password.');
                    },
                  },
                ]
              );
            }}
          >
            <Lock size={20} color="#EF4444" />
            <Text style={styles.resetPasswordButtonText}>Reset Password</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dangerZone}>
          <Text style={styles.dangerZoneTitle}>Danger Zone</Text>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={() => {
              Alert.alert(
                'Clear All Security Data',
                'This will permanently delete all security events and access tokens. This action cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: async () => {
                      await SecurityService.clearAllData();
                      await loadData();
                      Alert.alert('Success', 'All security data cleared');
                    },
                  },
                ]
              );
            }}
          >
            <Text style={styles.dangerButtonText}>Clear All Security Data</Text>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#fff',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#00E5FF',
  },
  settingsList: {
    gap: 12,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  settingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#888',
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#00E5FF',
    borderRadius: 6,
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#000',
  },
  exportButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#1a1a1a',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  exportButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#00E5FF',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
  },
  tokensList: {
    gap: 12,
  },
  tokenCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  tokenInfo: {
    flex: 1,
  },
  tokenName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 4,
  },
  tokenDetails: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  tokenPermissions: {
    flexDirection: 'row',
    gap: 6,
  },
  permissionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#00E5FF20',
    borderRadius: 4,
  },
  permissionText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#00E5FF',
  },
  revokeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#EF444420',
    borderRadius: 6,
  },
  revokeButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#EF4444',
  },
  eventsList: {
    gap: 12,
  },
  eventCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    borderLeftWidth: 4,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  eventType: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#fff',
  },
  eventTime: {
    fontSize: 11,
    color: '#666',
  },
  eventDescription: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    marginBottom: 12,
  },
  eventFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '700' as const,
  },
  eventCategory: {
    fontSize: 11,
    color: '#666',
  },
  dangerZone: {
    marginTop: 16,
    padding: 20,
    backgroundColor: '#1a0a0a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF444430',
  },
  dangerZoneTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#EF4444',
    marginBottom: 12,
  },
  dangerButton: {
    padding: 14,
    backgroundColor: '#EF444420',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#EF4444',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
    marginBottom: 12,
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#F59E0B',
  },
  resetPasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  resetPasswordButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#EF4444',
  },
});
