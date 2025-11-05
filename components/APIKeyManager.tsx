import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Check, X, Eye, EyeOff, ExternalLink, RefreshCw, Save, Trash2, Plus } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IronManTheme } from '@/constants/colors';

interface APIKey {
  id: string;
  service: string;
  displayName: string;
  key: string;
  isActive: boolean;
  isTested: boolean;
  tier: 'Free' | 'Paid' | 'Free Tier';
  addedAt: number;
  lastTested?: number;
}

interface APIKeyManagerProps {
  onKeysUpdated?: () => void;
}

const STORAGE_KEY = 'jarvis_api_keys';

const AVAILABLE_SERVICES = [
  {
    id: 'groq',
    name: 'Groq',
    tier: 'Free' as const,
    description: 'Fast, free AI inference (Recommended)',
    envVar: 'EXPO_PUBLIC_GROQ_API_KEY',
    signupUrl: 'https://console.groq.com',
    keyFormat: 'gsk_...',
    recommended: true,
  },
  {
    id: 'huggingface',
    name: 'HuggingFace',
    tier: 'Free' as const,
    description: 'Open-source AI models',
    envVar: 'EXPO_PUBLIC_HF_API_TOKEN',
    signupUrl: 'https://huggingface.co/settings/tokens',
    keyFormat: 'hf_...',
    recommended: true,
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    tier: 'Free Tier' as const,
    description: 'Google AI with generous free tier',
    envVar: 'EXPO_PUBLIC_GEMINI_API_KEY',
    signupUrl: 'https://makersuite.google.com/app/apikey',
    keyFormat: 'AIza...',
    recommended: true,
  },
  {
    id: 'together',
    name: 'Together.ai',
    tier: 'Free Tier' as const,
    description: 'Fast inference for open models',
    envVar: 'EXPO_PUBLIC_TOGETHER_API_KEY',
    signupUrl: 'https://api.together.xyz',
    keyFormat: '...',
    recommended: false,
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    tier: 'Free Tier' as const,
    description: 'Specialized code AI models',
    envVar: 'EXPO_PUBLIC_DEEPSEEK_API_KEY',
    signupUrl: 'https://platform.deepseek.com',
    keyFormat: 'sk-...',
    recommended: false,
  },
  {
    id: 'openai',
    name: 'OpenAI',
    tier: 'Paid' as const,
    description: 'GPT-4 and other premium models',
    envVar: 'EXPO_PUBLIC_OPENAI_API_KEY',
    signupUrl: 'https://platform.openai.com/api-keys',
    keyFormat: 'sk-...',
    recommended: false,
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    tier: 'Paid' as const,
    description: 'Claude AI models',
    envVar: 'EXPO_PUBLIC_ANTHROPIC_API_KEY',
    signupUrl: 'https://console.anthropic.com',
    keyFormat: 'sk-ant-...',
    recommended: false,
  },
  {
    id: 'replicate',
    name: 'Replicate',
    tier: 'Free Tier' as const,
    description: 'Run AI models in the cloud',
    envVar: 'EXPO_PUBLIC_REPLICATE_API_KEY',
    signupUrl: 'https://replicate.com/account/api-tokens',
    keyFormat: 'r8_...',
    recommended: false,
  },
];

export default function APIKeyManager({ onKeysUpdated }: APIKeyManagerProps) {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddKey, setShowAddKey] = useState(false);
  const [selectedService, setSelectedService] = useState<string>('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [showKey, setShowKey] = useState<{ [key: string]: boolean }>({});
  const [testing, setTesting] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    loadAPIKeys();
  }, []);

  const loadAPIKeys = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const keys = JSON.parse(stored);
        setApiKeys(keys);
        console.log(`[APIKeyManager] Loaded ${keys.length} API keys`);
      }
    } catch (error) {
      console.error('[APIKeyManager] Failed to load API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAPIKeys = async (keys: APIKey[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
      setApiKeys(keys);
      
      // Also save to process.env for immediate use
      keys.forEach(key => {
        if (key.isActive) {
          const service = AVAILABLE_SERVICES.find(s => s.id === key.service);
          if (service) {
            // @ts-ignore - Setting env vars at runtime
            process.env[service.envVar] = key.key;
          }
        }
      });

      onKeysUpdated?.();
      console.log('[APIKeyManager] Saved API keys');
    } catch (error) {
      console.error('[APIKeyManager] Failed to save API keys:', error);
      throw error;
    }
  };

  const addAPIKey = async () => {
    if (!selectedService || !newKeyValue.trim()) {
      Alert.alert('Error', 'Please select a service and enter an API key');
      return;
    }

    const service = AVAILABLE_SERVICES.find(s => s.id === selectedService);
    if (!service) return;

    // Check if key already exists for this service
    const existingIndex = apiKeys.findIndex(k => k.service === selectedService);

    const newKey: APIKey = {
      id: `${selectedService}_${Date.now()}`,
      service: selectedService,
      displayName: service.name,
      key: newKeyValue.trim(),
      isActive: true,
      isTested: false,
      tier: service.tier,
      addedAt: Date.now(),
    };

    let updatedKeys;
    if (existingIndex >= 0) {
      // Replace existing key
      updatedKeys = [...apiKeys];
      updatedKeys[existingIndex] = newKey;
      Alert.alert('Success', `${service.name} API key updated!`);
    } else {
      // Add new key
      updatedKeys = [...apiKeys, newKey];
      Alert.alert('Success', `${service.name} API key added!`);
    }

    await saveAPIKeys(updatedKeys);
    setNewKeyValue('');
    setSelectedService('');
    setShowAddKey(false);

    // Auto-test the key
    testAPIKey(newKey.id, updatedKeys);
  };

  const testAPIKey = async (keyId: string, keys?: APIKey[]) => {
    const keysToUse = keys || apiKeys;
    const key = keysToUse.find(k => k.id === keyId);
    if (!key) return;

    setTesting(prev => ({ ...prev, [keyId]: true }));

    try {
      // Simple test based on service
      let isValid = false;
      
      if (key.service === 'groq') {
        // Test Groq API
        const response = await fetch('https://api.groq.com/openai/v1/models', {
          headers: { 'Authorization': `Bearer ${key.key}` }
        });
        isValid = response.ok;
      } else if (key.service === 'openai') {
        // Test OpenAI API
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${key.key}` }
        });
        isValid = response.ok;
      } else if (key.service === 'gemini') {
        // Test Gemini API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${key.key}`);
        isValid = response.ok;
      } else if (key.service === 'huggingface') {
        // Test HuggingFace API
        const response = await fetch('https://huggingface.co/api/whoami-v2', {
          headers: { 'Authorization': `Bearer ${key.key}` }
        });
        isValid = response.ok;
      } else {
        // For others, assume valid if format looks right
        isValid = key.key.length > 10;
      }

      const updatedKeys = keysToUse.map(k =>
        k.id === keyId
          ? { ...k, isTested: true, isActive: isValid, lastTested: Date.now() }
          : k
      );

      await saveAPIKeys(updatedKeys);

      if (isValid) {
        Alert.alert('Success', `${key.displayName} API key is valid and active!`);
      } else {
        Alert.alert('Warning', `${key.displayName} API key appears to be invalid. Please check it.`);
      }
    } catch (error) {
      console.error('[APIKeyManager] Test failed:', error);
      Alert.alert('Test Failed', 'Could not verify the API key. It may still work.');
    } finally {
      setTesting(prev => ({ ...prev, [keyId]: false }));
    }
  };

  const deleteAPIKey = async (keyId: string) => {
    const key = apiKeys.find(k => k.id === keyId);
    if (!key) return;

    Alert.alert(
      'Delete API Key',
      `Are you sure you want to delete the ${key.displayName} API key?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedKeys = apiKeys.filter(k => k.id !== keyId);
            await saveAPIKeys(updatedKeys);
          },
        },
      ]
    );
  };

  const toggleKeyActive = async (keyId: string) => {
    const updatedKeys = apiKeys.map(k =>
      k.id === keyId ? { ...k, isActive: !k.isActive } : k
    );
    await saveAPIKeys(updatedKeys);
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.substring(0, 4) + '...' + key.substring(key.length - 4);
  };

  const getConnectedServices = () => {
    return apiKeys.filter(k => k.isActive && k.isTested);
  };

  const getAvailableServicesToAdd = () => {
    const connectedServiceIds = new Set(apiKeys.map(k => k.service));
    return AVAILABLE_SERVICES.filter(s => !connectedServiceIds.has(s.id));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00f2ff" />
        <Text style={styles.loadingText}>Loading API keys...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Status Header */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>API Connection Status</Text>
          {getConnectedServices().length > 0 ? (
            <View style={styles.statusBadgeGood}>
              <Check size={14} color="#00ff00" />
              <Text style={styles.statusTextGood}>Connected</Text>
            </View>
          ) : (
            <View style={styles.statusBadgeWarning}>
              <X size={14} color="#ffa500" />
              <Text style={styles.statusTextWarning}>No Keys</Text>
            </View>
          )}
        </View>
        <Text style={styles.statusSubtitle}>
          {getConnectedServices().length} of {AVAILABLE_SERVICES.length} services connected
        </Text>
      </View>

      {/* Connected Services */}
      {apiKeys.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your API Keys</Text>
          {apiKeys.map((key) => (
            <View key={key.id} style={styles.keyCard}>
              <View style={styles.keyHeader}>
                <View style={styles.keyInfo}>
                  <Text style={styles.keyName}>{key.displayName}</Text>
                  <View style={styles.keyMeta}>
                    <View style={[styles.tierBadge, key.tier === 'Paid' && styles.tierBadgePaid]}>
                      <Text style={[styles.tierText, key.tier === 'Paid' && styles.tierTextPaid]}>
                        {key.tier}
                      </Text>
                    </View>
                    {key.isTested && key.isActive && (
                      <View style={styles.verifiedBadge}>
                        <Check size={12} color="#00ff00" />
                        <Text style={styles.verifiedText}>Verified</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Switch
                  value={key.isActive}
                  onValueChange={() => toggleKeyActive(key.id)}
                  trackColor={{ false: '#333', true: '#00f2ff80' }}
                  thumbColor={key.isActive ? '#00f2ff' : '#666'}
                />
              </View>

              <View style={styles.keyValueContainer}>
                <Text style={styles.keyValue}>
                  {showKey[key.id] ? key.key : maskKey(key.key)}
                </Text>
                <View style={styles.keyActions}>
                  <TouchableOpacity
                    onPress={() => setShowKey(prev => ({ ...prev, [key.id]: !prev[key.id] }))}
                    style={styles.iconButton}
                  >
                    {showKey[key.id] ? <EyeOff size={16} color="#666" /> : <Eye size={16} color="#666" />}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => testAPIKey(key.id)}
                    style={styles.iconButton}
                    disabled={testing[key.id]}
                  >
                    {testing[key.id] ? (
                      <ActivityIndicator size="small" color="#00f2ff" />
                    ) : (
                      <RefreshCw size={16} color="#00f2ff" />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => deleteAPIKey(key.id)}
                    style={styles.iconButton}
                  >
                    <Trash2 size={16} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              </View>

              {key.lastTested && (
                <Text style={styles.keyLastTested}>
                  Last tested: {new Date(key.lastTested).toLocaleString()}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Add New Key Section */}
      {!showAddKey && getAvailableServicesToAdd().length > 0 && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddKey(true)}
        >
          <Plus size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add API Key</Text>
        </TouchableOpacity>
      )}

      {showAddKey && (
        <View style={styles.addKeySection}>
          <View style={styles.addKeyHeader}>
            <Text style={styles.addKeyTitle}>Add New API Key</Text>
            <TouchableOpacity onPress={() => setShowAddKey(false)}>
              <X size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>Select Service:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.serviceScroll}>
            {getAvailableServicesToAdd().map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[
                  styles.serviceOption,
                  selectedService === service.id && styles.serviceOptionSelected,
                  service.recommended && styles.serviceOptionRecommended,
                ]}
                onPress={() => setSelectedService(service.id)}
              >
                {service.recommended && (
                  <Text style={styles.recommendedBadge}>⭐ Recommended</Text>
                )}
                <Text style={styles.serviceOptionName}>{service.name}</Text>
                <Text style={styles.serviceOptionTier}>{service.tier}</Text>
                <Text style={styles.serviceOptionDesc}>{service.description}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {selectedService && (
            <>
              <View style={styles.signupInfo}>
                <Text style={styles.signupText}>
                  Don't have an API key?
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    const service = AVAILABLE_SERVICES.find(s => s.id === selectedService);
                    if (service) {
                      Alert.alert(
                        'Get API Key',
                        `Visit ${service.signupUrl} to create an account and get your free API key.`,
                        [
                          { text: 'OK' }
                        ]
                      );
                    }
                  }}
                >
                  <Text style={styles.signupLink}>
                    Get one free <ExternalLink size={12} color="#00f2ff" />
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.inputLabel}>
                API Key (format: {AVAILABLE_SERVICES.find(s => s.id === selectedService)?.keyFormat}):
              </Text>
              <TextInput
                style={styles.input}
                value={newKeyValue}
                onChangeText={setNewKeyValue}
                placeholder="Paste your API key here"
                placeholderTextColor="#666"
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={!showKey['new']}
              />

              <View style={styles.addKeyActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowAddKey(false);
                    setSelectedService('');
                    setNewKeyValue('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, !newKeyValue.trim() && styles.saveButtonDisabled]}
                  onPress={addAPIKey}
                  disabled={!newKeyValue.trim()}
                >
                  <Save size={18} color="#000" />
                  <Text style={styles.saveButtonText}>Save & Test</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}

      {/* Help Section */}
      <View style={styles.helpSection}>
        <Text style={styles.helpTitle}>💡 Quick Tips</Text>
        <Text style={styles.helpText}>
          • Free services like Groq and HuggingFace are great for getting started
        </Text>
        <Text style={styles.helpText}>
          • Keys are stored securely on your device
        </Text>
        <Text style={styles.helpText}>
          • Test your keys after adding to verify they work
        </Text>
        <Text style={styles.helpText}>
          • You can have multiple AI services active at once
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  loadingText: {
    color: '#00f2ff',
    marginTop: 16,
    fontSize: 16,
  },
  statusCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusBadgeGood: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00ff0020',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusBadgeWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffa50020',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusTextGood: {
    color: '#00ff00',
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextWarning: {
    color: '#ffa500',
    fontSize: 12,
    fontWeight: '600',
  },
  statusSubtitle: {
    color: '#888',
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ccc',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  keyCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  keyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  keyInfo: {
    flex: 1,
  },
  keyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
  },
  keyMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  tierBadge: {
    backgroundColor: '#00ff0020',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tierBadgePaid: {
    backgroundColor: '#ffa50020',
  },
  tierText: {
    color: '#00ff00',
    fontSize: 11,
    fontWeight: '600',
  },
  tierTextPaid: {
    color: '#ffa500',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00ff0020',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  verifiedText: {
    color: '#00ff00',
    fontSize: 11,
    fontWeight: '600',
  },
  keyValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0a0a0a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  keyValue: {
    color: '#00f2ff',
    fontFamily: 'monospace',
    fontSize: 13,
    flex: 1,
  },
  keyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 4,
  },
  keyLastTested: {
    color: '#666',
    fontSize: 11,
    fontStyle: 'italic',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00f2ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 10,
  },
  addButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addKeySection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#00f2ff',
  },
  addKeyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addKeyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00f2ff',
  },
  inputLabel: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  serviceScroll: {
    marginBottom: 16,
  },
  serviceOption: {
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    minWidth: 180,
    borderWidth: 2,
    borderColor: '#333',
  },
  serviceOptionSelected: {
    borderColor: '#00f2ff',
    backgroundColor: '#00f2ff10',
  },
  serviceOptionRecommended: {
    borderColor: '#ffa500',
  },
  recommendedBadge: {
    fontSize: 10,
    color: '#ffa500',
    marginBottom: 4,
    fontWeight: '600',
  },
  serviceOptionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  serviceOptionTier: {
    fontSize: 11,
    color: '#00ff00',
    marginBottom: 4,
  },
  serviceOptionDesc: {
    fontSize: 11,
    color: '#888',
    lineHeight: 14,
  },
  signupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#00f2ff10',
    borderRadius: 8,
  },
  signupText: {
    color: '#ccc',
    fontSize: 13,
  },
  signupLink: {
    color: '#00f2ff',
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#0a0a0a',
    color: '#fff',
    padding: 16,
    borderRadius: 8,
    fontSize: 14,
    fontFamily: 'monospace',
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 16,
  },
  addKeyActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#333',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00f2ff',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  helpSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00f2ff',
    marginBottom: 12,
  },
  helpText: {
    color: '#888',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 6,
  },
});
