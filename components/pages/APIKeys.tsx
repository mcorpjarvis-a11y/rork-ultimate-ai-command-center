import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/contexts/AppContext';
import { Key, Plus, Trash2, ChevronDown, ChevronUp, HelpCircle, CheckCircle, AlertCircle, ExternalLink, TestTube } from 'lucide-react-native';
import PlugAndPlayService, { IntegrationConfig } from '@/services/PlugAndPlayService';

export default function APIKeys() {
  const { state, addAPIKey, deleteAPIKey } = useApp();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [expandedTutorial, setExpandedTutorial] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [testingIntegration, setTestingIntegration] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [integrationKeys, setIntegrationKeys] = useState<Record<string, string>>({});

  const loadIntegrations = useCallback(async () => {
    await PlugAndPlayService.detectMissingConfigurations(state);
    const allIntegrations = PlugAndPlayService.getAllIntegrations();
    setIntegrations(allIntegrations);
  }, [state]);

  useEffect(() => {
    loadIntegrations();
  }, [loadIntegrations]);

  const handleAdd = () => {
    if (name.trim() && key.trim()) {
      addAPIKey(name, key);
      setName('');
      setKey('');
      loadIntegrations();
    }
  };

  const handleIntegrationKeyAdd = (integrationId: string, integrationName: string) => {
    const keyValue = integrationKeys[integrationId];
    if (keyValue && keyValue.trim()) {
      addAPIKey(integrationName, keyValue);
      setIntegrationKeys({ ...integrationKeys, [integrationId]: '' });
      loadIntegrations();
    }
  };

  const toggleTutorial = (integrationId: string) => {
    setExpandedTutorial(expandedTutorial === integrationId ? null : integrationId);
  };

  const testIntegration = async (integrationId: string) => {
    setTestingIntegration(integrationId);
    try {
      await PlugAndPlayService.checkIntegration(integrationId, state);
      const result = await PlugAndPlayService.testConnection(integrationId, state);
      alert(result.success ? '✅ ' + result.message : '❌ ' + result.message);
      await loadIntegrations();
    } catch (error: any) {
      alert('❌ Test failed: ' + error.message);
    } finally {
      setTestingIntegration(null);
    }
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
  };

  const filteredIntegrations = integrations.filter(integration => 
    integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    integration.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle color="#10B981" size={20} />;
      case 'configured':
        return <CheckCircle color="#F59E0B" size={20} />;
      case 'error':
        return <AlertCircle color="#EF4444" size={20} />;
      default:
        return <AlertCircle color="#6B7280" size={20} />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Connected';
      case 'configured': return 'Configured';
      case 'error': return 'Error';
      default: return 'Not Configured';
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>API Keys</Text>
        <Text style={styles.subtitle}>Manage your API integrations</Text>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search integrations or add custom service..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.addCard}>
          <View style={styles.addHeader}>
            <Key color="#00E5FF" size={24} />
            <Text style={styles.addTitle}>Add New API Key</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Service name..."
            placeholderTextColor="#666"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="API key..."
            placeholderTextColor="#666"
            value={key}
            onChangeText={setKey}
            secureTextEntry
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Plus size={20} color="#000" />
            <Text style={styles.addButtonText}>Add Key</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Integration Setup & Tutorials</Text>
        <Text style={styles.sectionSubtitle}>Click any integration to see setup instructions and enter API keys</Text>

        {['ai', 'social', 'storage', 'payment'].map(category => {
          const categoryIntegrations = filteredIntegrations.filter(i => i.category === category);
          if (categoryIntegrations.length === 0) return null;

          return (
            <View key={category} style={styles.categorySection}>
              <Text style={styles.categoryTitle}>
                {category.charAt(0).toUpperCase() + category.slice(1)} Integrations
              </Text>
              {categoryIntegrations.map(integration => (
                <View key={integration.id} style={styles.integrationCard}>
                  <TouchableOpacity
                    style={styles.integrationHeader}
                    onPress={() => toggleTutorial(integration.id)}
                  >
                    <View style={styles.integrationInfo}>
                      {getStatusIcon(integration.status)}
                      <View style={styles.integrationTextInfo}>
                        <Text style={styles.integrationName}>{integration.name}</Text>
                        <Text style={styles.integrationStatus}>
                          {getStatusText(integration.status)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.integrationActions}>
                      {integration.status === 'configured' && (
                        <TouchableOpacity
                          style={styles.testButton}
                          onPress={() => testIntegration(integration.id)}
                          disabled={testingIntegration === integration.id}
                        >
                          <TestTube color="#00E5FF" size={16} />
                        </TouchableOpacity>
                      )}
                      {expandedTutorial === integration.id ? (
                        <ChevronUp color="#888" size={20} />
                      ) : (
                        <ChevronDown color="#888" size={20} />
                      )}
                    </View>
                  </TouchableOpacity>

                  {expandedTutorial === integration.id && (
                    <View style={styles.tutorialContent}>
                      <View style={styles.keyInputSection}>
                        <Text style={styles.keyInputTitle}>Add API Key for {integration.name}</Text>
                        <View style={styles.keyInputRow}>
                          <TextInput
                            style={styles.integrationKeyInput}
                            placeholder="Enter API key..."
                            placeholderTextColor="#666"
                            value={integrationKeys[integration.id] || ''}
                            onChangeText={(text) => setIntegrationKeys({ ...integrationKeys, [integration.id]: text })}
                            secureTextEntry
                          />
                          <TouchableOpacity
                            style={styles.addKeyButton}
                            onPress={() => handleIntegrationKeyAdd(integration.id, integration.name)}
                          >
                            <Plus size={18} color="#000" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={styles.tutorialSection}>
                        <View style={styles.tutorialHeaderRow}>
                          <HelpCircle color="#00E5FF" size={18} />
                          <Text style={styles.tutorialSectionTitle}>Requirements</Text>
                        </View>
                        {integration.requirements.map((req, idx) => (
                          <View key={idx} style={styles.requirementItem}>
                            {req.satisfied ? (
                              <CheckCircle color="#10B981" size={16} />
                            ) : (
                              <AlertCircle color="#F59E0B" size={16} />
                            )}
                            <View style={styles.requirementText}>
                              <Text style={styles.requirementName}>
                                {req.name} {req.required && <Text style={styles.requiredBadge}>*Required</Text>}
                              </Text>
                              <Text style={styles.requirementDesc}>{req.description}</Text>
                              {req.helpText && (
                                <Text style={styles.requirementHelp}>💡 {req.helpText}</Text>
                              )}
                            </View>
                          </View>
                        ))}
                      </View>

                      {(integration.setupUrl || integration.docsUrl) && (
                        <View style={styles.tutorialSection}>
                          <Text style={styles.tutorialSectionTitle}>Quick Links</Text>
                          {integration.setupUrl && (
                            <TouchableOpacity
                              style={styles.linkButton}
                              onPress={() => openLink(integration.setupUrl!)}
                            >
                              <ExternalLink color="#00E5FF" size={16} />
                              <Text style={styles.linkButtonText}>Setup Page</Text>
                            </TouchableOpacity>
                          )}
                          {integration.docsUrl && (
                            <TouchableOpacity
                              style={styles.linkButton}
                              onPress={() => openLink(integration.docsUrl!)}
                            >
                              <ExternalLink color="#00E5FF" size={16} />
                              <Text style={styles.linkButtonText}>Documentation</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      )}

                      <View style={styles.tutorialSection}>
                        <Text style={styles.tutorialSectionTitle}>Setup Steps</Text>
                        <Text style={styles.tutorialStep}>1. Get your API key or complete OAuth from the setup page</Text>
                        <Text style={styles.tutorialStep}>2. Add the key using the form at the top of this page</Text>
                        <Text style={styles.tutorialStep}>3. Test the connection using the test button</Text>
                        <Text style={styles.tutorialStep}>4. Start using the integration in your workflows!</Text>
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>
          );
        })}

        <Text style={styles.sectionTitle}>Your API Keys</Text>
        {state.apiKeys.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No API keys added yet</Text>
            <Text style={styles.emptyHint}>Add keys using the form above to connect integrations</Text>
          </View>
        ) : (
          <View style={styles.keysList}>
            {state.apiKeys.map((apiKey) => (
              <View key={apiKey.id} style={styles.keyCard}>
                <View style={styles.keyInfo}>
                  <Text style={styles.keyName}>{apiKey.name}</Text>
                  <Text style={styles.keyValue}>•••••••••••••••{apiKey.key.slice(-4)}</Text>
                  <Text style={styles.keyMeta}>
                    Added {new Date(apiKey.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteAPIKey(apiKey.id)}
                >
                  <Trash2 color="#EF4444" size={20} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
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
  addCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    marginBottom: 24,
  },
  addHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  addTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#fff',
  },
  input: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#00E5FF',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#000',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 16,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
  },
  keysList: {
    gap: 12,
  },
  keyCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  keyInfo: {
    flex: 1,
  },
  keyName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 4,
  },
  keyValue: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'monospace' as const,
    marginBottom: 4,
  },
  keyMeta: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    padding: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 20,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#00E5FF',
    marginBottom: 12,
  },
  integrationCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    marginBottom: 12,
    overflow: 'hidden' as const,
  },
  integrationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  integrationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  integrationTextInfo: {
    flex: 1,
  },
  integrationName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 2,
  },
  integrationStatus: {
    fontSize: 12,
    color: '#888',
  },
  integrationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  testButton: {
    padding: 6,
  },
  tutorialContent: {
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    padding: 16,
    gap: 16,
  },
  tutorialSection: {
    gap: 12,
  },
  tutorialHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tutorialSectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
  requirementItem: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 8,
  },
  requirementText: {
    flex: 1,
    gap: 4,
  },
  requirementName: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#fff',
  },
  requiredBadge: {
    fontSize: 11,
    color: '#F59E0B',
    fontWeight: '700' as const,
  },
  requirementDesc: {
    fontSize: 12,
    color: '#888',
    lineHeight: 16,
  },
  requirementHelp: {
    fontSize: 12,
    color: '#00E5FF',
    lineHeight: 16,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#111',
    padding: 10,
    borderRadius: 8,
  },
  linkButtonText: {
    fontSize: 13,
    color: '#00E5FF',
    fontWeight: '500' as const,
  },
  tutorialStep: {
    fontSize: 13,
    color: '#ccc',
    lineHeight: 20,
  },
  emptyHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#00E5FF',
  },
  keyInputSection: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  keyInputTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#00E5FF',
    marginBottom: 12,
  },
  keyInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  integrationKeyInput: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  addKeyButton: {
    backgroundColor: '#00E5FF',
    borderRadius: 8,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
