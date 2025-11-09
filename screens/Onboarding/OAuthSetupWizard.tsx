/**
 * OAuthSetupWizard - Connect OAuth providers after permissions
 * Iron Man themed UI with connection status tracking
 * Android only - NO iOS support
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import AuthManager from '@/services/auth/AuthManager';
import OnboardingStatus from '@/services/onboarding/OnboardingStatus';

interface OAuthProvider {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'not_connected' | 'connecting' | 'connected' | 'failed';
  testEndpoint?: string;
  error?: string;
}

export default function OAuthSetupWizard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<OAuthProvider[]>([
    {
      id: 'google',
      name: 'Google',
      description: 'Gmail, Drive, YouTube, Calendar access',
      icon: '🔵',
      status: 'not_connected',
      testEndpoint: 'https://www.googleapis.com/oauth2/v2/userinfo',
    },
    {
      id: 'github',
      name: 'GitHub',
      description: 'Code repositories and project management',
      icon: '⚫',
      status: 'not_connected',
      testEndpoint: 'https://api.github.com/user',
    },
    {
      id: 'discord',
      name: 'Discord',
      description: 'Server management and messaging',
      icon: '🟣',
      status: 'not_connected',
      testEndpoint: 'https://discord.com/api/users/@me',
    },
    {
      id: 'reddit',
      name: 'Reddit',
      description: 'Post content and manage communities',
      icon: '🟠',
      status: 'not_connected',
      testEndpoint: 'https://oauth.reddit.com/api/v1/me',
    },
    {
      id: 'spotify',
      name: 'Spotify',
      description: 'Music playback and playlist management',
      icon: '🟢',
      status: 'not_connected',
      testEndpoint: 'https://api.spotify.com/v1/me',
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      description: 'Tweet and manage your timeline',
      icon: '⚪',
      status: 'not_connected',
      testEndpoint: 'https://api.twitter.com/2/users/me',
    },
    {
      id: 'youtube',
      name: 'YouTube',
      description: 'Upload videos and manage channel',
      icon: '🔴',
      status: 'not_connected',
      testEndpoint: 'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
    },
    {
      id: 'instagram',
      name: 'Instagram',
      description: 'Post photos and manage content',
      icon: '🟣',
      status: 'not_connected',
    },
    {
      id: 'notion',
      name: 'Notion',
      description: 'Workspace and database integration',
      icon: '⚫',
      status: 'not_connected',
      testEndpoint: 'https://api.notion.com/v1/users/me',
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Team communication and workspace',
      icon: '🟣',
      status: 'not_connected',
      testEndpoint: 'https://slack.com/api/auth.test',
    },
  ]);

  useEffect(() => {
    checkExistingConnections();
  }, []);

  const checkExistingConnections = async () => {
    const updatedProviders = await Promise.all(
      providers.map(async (provider) => {
        try {
          const isConnected = await AuthManager.isConnected(provider.id);
          return {
            ...provider,
            status: isConnected ? 'connected' : 'not_connected',
          } as OAuthProvider;
        } catch (error) {
          console.error(`Error checking ${provider.id}:`, error);
          return provider;
        }
      })
    );

    setProviders(updatedProviders);
  };

  const connectProvider = async (provider: OAuthProvider) => {
    if (provider.status === 'connected') {
      Alert.alert(
        'Already Connected',
        `${provider.name} is already connected. Disconnect first to reconnect.`,
        [
          { text: 'OK', style: 'cancel' },
          { text: 'Disconnect', onPress: () => disconnectProvider(provider), style: 'destructive' },
        ]
      );
      return;
    }

    setProviders((prev) =>
      prev.map((p) => (p.id === provider.id ? { ...p, status: 'connecting', error: undefined } : p))
    );

    try {
      console.log(`[OAuthWizard] Connecting to ${provider.name}...`);

      const success = await AuthManager.startAuthFlow(provider.id);

      if (!success) {
        throw new Error('Authentication cancelled or failed');
      }

      // Test the endpoint if available
      if (provider.testEndpoint) {
        await testEndpoint(provider);
      }

      setProviders((prev) =>
        prev.map((p) => (p.id === provider.id ? { ...p, status: 'connected', error: undefined } : p))
      );

      Alert.alert('Success', `${provider.name} connected successfully!`);
    } catch (error) {
      console.error(`[OAuthWizard] Failed to connect ${provider.name}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      setProviders((prev) =>
        prev.map((p) =>
          p.id === provider.id ? { ...p, status: 'failed', error: errorMessage } : p
        )
      );

      Alert.alert('Connection Failed', `Could not connect ${provider.name}: ${errorMessage}`);
    }
  };

  const disconnectProvider = async (provider: OAuthProvider) => {
    try {
      await AuthManager.revokeProvider(provider.id);

      setProviders((prev) =>
        prev.map((p) =>
          p.id === provider.id ? { ...p, status: 'not_connected', error: undefined } : p
        )
      );

      Alert.alert('Disconnected', `${provider.name} has been disconnected.`);
    } catch (error) {
      console.error(`[OAuthWizard] Failed to disconnect ${provider.name}:`, error);
      Alert.alert('Error', `Failed to disconnect ${provider.name}.`);
    }
  };

  const testEndpoint = async (provider: OAuthProvider) => {
    if (!provider.testEndpoint) {
      return;
    }

    try {
      const token = await AuthManager.getAccessToken(provider.id);
      if (!token) {
        throw new Error('No access token available');
      }

      const response = await fetch(provider.testEndpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Test endpoint failed: ${response.status}`);
      }

      console.log(`[OAuthWizard] ${provider.name} test endpoint succeeded`);
    } catch (error) {
      console.error(`[OAuthWizard] ${provider.name} test endpoint failed:`, error);
      throw error;
    }
  };

  const testProvider = async (provider: OAuthProvider) => {
    if (provider.status !== 'connected') {
      Alert.alert('Not Connected', 'Please connect to the provider first.');
      return;
    }

    if (!provider.testEndpoint) {
      Alert.alert('No Test Available', 'This provider does not have a test endpoint.');
      return;
    }

    try {
      await testEndpoint(provider);
      Alert.alert('Test Successful', `${provider.name} is working correctly!`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert('Test Failed', `${provider.name} test failed: ${errorMessage}`);
    }
  };

  const handleContinue = async () => {
    const connectedCount = providers.filter((p) => p.status === 'connected').length;

    if (connectedCount === 0) {
      Alert.alert(
        'No Connections',
        'You haven\'t connected any services. Connect at least one to get started.',
        [
          { text: 'OK', style: 'cancel' },
          { text: 'Skip', onPress: handleSkip, style: 'default' },
        ]
      );
      return;
    }

    // Mark onboarding as complete before navigating to dashboard
    await OnboardingStatus.markOnboardingComplete();
    console.log('[OAuthWizard] Onboarding marked as complete, navigating to dashboard');
    router.replace('/');
  };

  const handleSkip = async () => {
    // Mark onboarding as complete even if user skips
    await OnboardingStatus.markOnboardingComplete();
    console.log('[OAuthWizard] Onboarding skipped and marked as complete');
    router.replace('/');
  };

  const getProgress = () => {
    const connected = providers.filter((p) => p.status === 'connected').length;
    const total = providers.length;
    return { connected, total, percentage: Math.round((connected / total) * 100) };
  };

  const progress = getProgress();

  const getStatusIcon = (status: OAuthProvider['status']) => {
    switch (status) {
      case 'connected':
        return '✅';
      case 'connecting':
        return '🔄';
      case 'failed':
        return '❌';
      default:
        return '⚪';
    }
  };

  const getStatusText = (status: OAuthProvider['status']) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'failed':
        return 'Failed';
      default:
        return 'Not Connected';
    }
  };

  const getStatusColor = (status: OAuthProvider['status']) => {
    switch (status) {
      case 'connected':
        return '#00f2ff';
      case 'connecting':
        return '#ffaa00';
      case 'failed':
        return '#ff4444';
      default:
        return '#666';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Connect Your Services</Text>
          <Text style={styles.subtitle}>
            Link your accounts to unlock JARVIS's full potential
          </Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress.percentage}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {progress.connected} of {progress.total} services connected ({progress.percentage}%)
            </Text>
          </View>
        </View>

        <View style={styles.providersList}>
          {providers.map((provider) => {
            const isConnected = provider.status === 'connected';
            const isConnecting = provider.status === 'connecting';
            const isFailed = provider.status === 'failed';

            return (
              <View key={provider.id} style={[styles.providerCard, isConnected && styles.providerConnected]}>
                <View style={styles.providerHeader}>
                  <View style={styles.providerIconContainer}>
                    <Text style={styles.providerEmoji}>{provider.icon}</Text>
                  </View>
                  <View style={styles.providerInfo}>
                    <Text style={styles.providerName}>{provider.name}</Text>
                    <Text style={styles.providerDescription}>{provider.description}</Text>
                    {provider.error && (
                      <Text style={styles.providerError}>Error: {provider.error}</Text>
                    )}
                  </View>
                </View>

                <View style={styles.providerStatus}>
                  <Text style={[styles.statusText, { color: getStatusColor(provider.status) }]}>
                    {getStatusIcon(provider.status)} {getStatusText(provider.status)}
                  </Text>
                </View>

                <View style={styles.providerActions}>
                  {isConnected ? (
                    <>
                      {provider.testEndpoint && (
                        <TouchableOpacity
                          style={[styles.actionButton, styles.testButton]}
                          onPress={() => testProvider(provider)}
                        >
                          <Text style={styles.testButtonText}>Test Connection</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={[styles.actionButton, styles.disconnectButton]}
                        onPress={() => disconnectProvider(provider)}
                      >
                        <Text style={styles.disconnectButtonText}>Disconnect</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        styles.connectButton,
                        isConnecting && styles.connectingButton,
                      ]}
                      onPress={() => connectProvider(provider)}
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <ActivityIndicator size="small" color="#000" />
                      ) : (
                        <Text style={styles.connectButtonText}>
                          {isFailed ? 'Retry Connection' : 'Connect'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={[styles.button, styles.continueButton]} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue to Dashboard →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.skipButton]}
            onPress={handleSkip}
          >
            <Text style={styles.skipButtonText}>Skip for Now</Text>
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            You can connect more services later from Settings
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#00f2ff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    lineHeight: 24,
    marginBottom: 24,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00f2ff',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#00f2ff',
    marginTop: 8,
    textAlign: 'center',
  },
  providersList: {
    padding: 16,
  },
  providerCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  providerConnected: {
    borderColor: '#00f2ff',
    backgroundColor: '#001a1f',
  },
  providerHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  providerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  providerEmoji: {
    fontSize: 32,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  providerDescription: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  providerError: {
    fontSize: 12,
    color: '#ff4444',
    marginTop: 4,
  },
  providerStatus: {
    marginBottom: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  providerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectButton: {
    backgroundColor: '#00f2ff',
  },
  connectingButton: {
    backgroundColor: '#00b8cc',
  },
  connectButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  testButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#00f2ff',
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00f2ff',
  },
  disconnectButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  disconnectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ff4444',
  },
  footer: {
    padding: 24,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  continueButton: {
    backgroundColor: '#00f2ff',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888',
  },
  footerNote: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});
