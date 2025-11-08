/**
 * ConnectionsHub - Provider connection management UI
 * Displays a grid of provider tiles with connection status
 * Handles connect, disconnect, and local token actions
 * Android/Expo/Termux only - NO iOS support
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import AuthManager from '@/services/auth/AuthManager';
import { PROVIDERS, getProvider } from '@/services/auth/providerHelpers/config';
import { ProviderStatus } from '@/services/auth/types';

interface ProviderTileData {
  name: string;
  displayName: string;
  status: ProviderStatus;
  supportsLocalToken: boolean;
}

export default function ConnectionsHub() {
  const [providers, setProviders] = useState<ProviderTileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [localTokenModalVisible, setLocalTokenModalVisible] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [localToken, setLocalToken] = useState('');
  const [localTokenMetadata, setLocalTokenMetadata] = useState('');

  useEffect(() => {
    loadProviders();
    
    // Subscribe to auth events
    const handleConnected = (provider: string) => {
      console.log('[ConnectionsHub] Provider connected:', provider);
      loadProviders();
    };

    const handleDisconnected = (provider: string) => {
      console.log('[ConnectionsHub] Provider disconnected:', provider);
      loadProviders();
    };

    const handleTokenRefreshed = (provider: string) => {
      console.log('[ConnectionsHub] Token refreshed:', provider);
      loadProviders();
    };

    AuthManager.on('connected', handleConnected);
    AuthManager.on('disconnected', handleDisconnected);
    AuthManager.on('token_refreshed', handleTokenRefreshed);

    return () => {
      AuthManager.off('connected', handleConnected);
      AuthManager.off('disconnected', handleDisconnected);
      AuthManager.off('token_refreshed', handleTokenRefreshed);
    };
  }, []);

  const loadProviders = async () => {
    try {
      const providerData: ProviderTileData[] = [];

      for (const [name, config] of Object.entries(PROVIDERS)) {
        const status = await AuthManager.getProviderStatus(name);
        
        providerData.push({
          name,
          displayName: config.displayName,
          status,
          supportsLocalToken: config.supportsLocalToken || false,
        });
      }

      setProviders(providerData);
    } catch (error) {
      console.error('[ConnectionsHub] Failed to load providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (providerName: string) => {
    try {
      const provider = getProvider(providerName);
      
      if (!provider) {
        Alert.alert('Error', 'Provider not found');
        return;
      }

      // Check if provider supports local tokens
      if (provider.supportsLocalToken && provider.requiresManualSetup) {
        setSelectedProvider(providerName);
        setLocalTokenModalVisible(true);
        return;
      }

      // Start OAuth flow
      Alert.alert(
        'Connecting...',
        `Starting authentication flow for ${provider.displayName}`,
        [{ text: 'OK' }]
      );

      const success = await AuthManager.startAuthFlow(providerName);
      
      if (success) {
        Alert.alert('Success', `Connected to ${provider.displayName}`);
      } else {
        Alert.alert('Failed', `Could not connect to ${provider.displayName}`);
      }
    } catch (error) {
      console.error('[ConnectionsHub] Connect error:', error);
      Alert.alert('Error', 'Failed to connect. Please try again.');
    }
  };

  const handleDisconnect = async (providerName: string) => {
    const provider = getProvider(providerName);
    
    Alert.alert(
      'Disconnect',
      `Are you sure you want to disconnect from ${provider?.displayName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              await AuthManager.revokeProvider(providerName);
              Alert.alert('Success', `Disconnected from ${provider?.displayName}`);
            } catch (error) {
              console.error('[ConnectionsHub] Disconnect error:', error);
              Alert.alert('Error', 'Failed to disconnect. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleAddLocalToken = async () => {
    if (!selectedProvider || !localToken) {
      Alert.alert('Error', 'Please enter a valid token');
      return;
    }

    try {
      let metadata: any = {};
      
      // Parse metadata if provided
      if (localTokenMetadata) {
        try {
          metadata = JSON.parse(localTokenMetadata);
        } catch (e) {
          Alert.alert('Error', 'Invalid metadata JSON');
          return;
        }
      }

      await AuthManager.addLocalToken(selectedProvider, localToken, metadata);
      
      Alert.alert('Success', `Token added for ${getProvider(selectedProvider)?.displayName}`);
      
      // Reset modal state
      setLocalTokenModalVisible(false);
      setSelectedProvider(null);
      setLocalToken('');
      setLocalTokenMetadata('');
    } catch (error) {
      console.error('[ConnectionsHub] Add local token error:', error);
      Alert.alert('Error', 'Failed to add token. Please try again.');
    }
  };

  const getStatusColor = (status: ProviderStatus): string => {
    switch (status) {
      case 'connected':
        return '#10b981'; // green
      case 'needs_reauth':
        return '#f59e0b'; // amber
      case 'not_connected':
      default:
        return '#6b7280'; // gray
    }
  };

  const getStatusText = (status: ProviderStatus): string => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'needs_reauth':
        return 'Needs Re-Auth';
      case 'not_connected':
      default:
        return 'Not Connected';
    }
  };

  const renderProviderTile = (provider: ProviderTileData) => {
    const statusColor = getStatusColor(provider.status);
    const isConnected = provider.status === 'connected' || provider.status === 'needs_reauth';

    return (
      <View key={provider.name} style={styles.tile}>
        <View style={styles.tileHeader}>
          <Text style={styles.providerName}>{provider.displayName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{getStatusText(provider.status)}</Text>
          </View>
        </View>

        <View style={styles.tileActions}>
          {isConnected ? (
            <TouchableOpacity
              style={[styles.button, styles.disconnectButton]}
              onPress={() => handleDisconnect(provider.name)}
            >
              <Text style={styles.buttonText}>Disconnect</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.button, styles.connectButton]}
                onPress={() => handleConnect(provider.name)}
              >
                <Text style={styles.buttonText}>Connect</Text>
              </TouchableOpacity>
              
              {provider.supportsLocalToken && (
                <TouchableOpacity
                  style={[styles.button, styles.localTokenButton]}
                  onPress={() => {
                    setSelectedProvider(provider.name);
                    setLocalTokenModalVisible(true);
                  }}
                >
                  <Text style={styles.buttonText}>Add Token</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading providers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connections Hub</Text>
      <Text style={styles.subtitle}>
        Connect your accounts and services
      </Text>

      <ScrollView style={styles.scrollView}>
        <View style={styles.grid}>
          {providers.map(renderProviderTile)}
        </View>
      </ScrollView>

      {/* Local Token Modal */}
      <Modal
        visible={localTokenModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setLocalTokenModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Add Local Token
            </Text>
            <Text style={styles.modalSubtitle}>
              {selectedProvider && getProvider(selectedProvider)?.displayName}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter access token"
              value={localToken}
              onChangeText={setLocalToken}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder='Optional metadata JSON (e.g., {"baseUrl": "http://..."})'
              value={localTokenMetadata}
              onChangeText={setLocalTokenMetadata}
              multiline
              numberOfLines={4}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setLocalTokenModalVisible(false);
                  setSelectedProvider(null);
                  setLocalToken('');
                  setLocalTokenMetadata('');
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.addButton]}
                onPress={handleAddLocalToken}
              >
                <Text style={styles.buttonText}>Add Token</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#6b7280',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tile: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tileHeader: {
    marginBottom: 12,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
  tileActions: {
    flexDirection: 'column',
    gap: 8,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  connectButton: {
    backgroundColor: '#3b82f6',
  },
  disconnectButton: {
    backgroundColor: '#ef4444',
  },
  localTokenButton: {
    backgroundColor: '#8b5cf6',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6b7280',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#10b981',
  },
});
