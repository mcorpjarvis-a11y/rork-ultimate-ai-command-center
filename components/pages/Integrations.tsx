import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { Settings, Check, X, Search, ChevronDown, ChevronUp, Key, ExternalLink } from 'lucide-react-native';
import IntegrationManager from '@/services/IntegrationManager';
import { Integration } from '@/config/integrations.config';
import { INTEGRATION_CATEGORIES } from '@/config/integrations.config';

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<Record<string, string>>({});

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    const loaded = await IntegrationManager.loadIntegrations();
    setIntegrations(loaded);
  };

  const filteredIntegrations = integrations.filter((integration) => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = IntegrationManager.getIntegrationStats();
  const categories = ['all', ...Object.values(INTEGRATION_CATEGORIES)];

  const handleToggle = async (id: string, enabled: boolean) => {
    if (enabled) {
      const integration = integrations.find((i) => i.id === id);
      if (integration && !integration.configured) {
        setEditingId(id);
        setExpandedId(id);
        setCredentials(integration.credentials);
        return;
      }
      await IntegrationManager.enableIntegration(id);
    } else {
      await IntegrationManager.disableIntegration(id);
    }
    await loadIntegrations();
  };

  const handleSaveCredentials = async (id: string) => {
    await IntegrationManager.updateCredentials(id, credentials);
    await IntegrationManager.enableIntegration(id);
    setEditingId(null);
    setCredentials({});
    await loadIntegrations();
    Alert.alert('Success', 'Integration configured successfully');
  };

  const handleTest = async (id: string) => {
    const result = await IntegrationManager.testIntegration(id);
    Alert.alert(result.success ? 'Success' : 'Error', result.message);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'critical': return '#FF3B30';
      case 'high': return '#FF9500';
      case 'medium': return '#FFD60A';
      case 'low': return '#4CAF50';
      default: return '#999';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Integrations</Text>
        <Text style={styles.subtitle}>Connect all your tools and platforms</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#7CFC00' }]}>{stats.enabled}</Text>
          <Text style={styles.statLabel}>Enabled</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#00E5FF' }]}>{stats.configured}</Text>
          <Text style={styles.statLabel}>Configured</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#FF3B30' }]}>{stats.critical}</Text>
          <Text style={styles.statLabel}>Critical</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Search color="#666" size={20} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search integrations..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[styles.categoryChip, selectedCategory === category && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text style={[styles.categoryText, selectedCategory === category && styles.categoryTextActive]}>
              {category === 'all' ? 'All' : category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filteredIntegrations.map((integration) => (
          <View key={integration.id} style={styles.integrationCard}>
            <TouchableOpacity
              style={styles.integrationHeader}
              onPress={() => setExpandedId(expandedId === integration.id ? null : integration.id)}
            >
              <View style={styles.integrationInfo}>
                <View style={styles.integrationTitleRow}>
                  <Text style={styles.integrationName}>{integration.name}</Text>
                  <View style={[styles.tierBadge, { backgroundColor: getTierColor(integration.tier) + '20', borderColor: getTierColor(integration.tier) }]}>
                    <Text style={[styles.tierText, { color: getTierColor(integration.tier) }]}>
                      {integration.tier.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.integrationDescription}>{integration.description}</Text>
                <Text style={styles.integrationCategory}>{integration.category}</Text>
              </View>
              <View style={styles.integrationActions}>
                <Switch
                  value={integration.enabled}
                  onValueChange={(value) => handleToggle(integration.id, value)}
                  trackColor={{ false: '#1a1a1a', true: '#7CFC00' }}
                  thumbColor={integration.enabled ? '#fff' : '#666'}
                />
                {expandedId === integration.id ? (
                  <ChevronUp color="#7CFC00" size={20} />
                ) : (
                  <ChevronDown color="#666" size={20} />
                )}
              </View>
            </TouchableOpacity>

            {expandedId === integration.id && (
              <View style={styles.integrationDetails}>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Capabilities</Text>
                  {integration.capabilities.map((capability: string, i: number) => (
                    <View key={i} style={styles.capabilityRow}>
                      <Check color="#7CFC00" size={14} />
                      <Text style={styles.capabilityText}>{capability}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Autonomous Actions</Text>
                  {integration.autonomousActions.map((action: string, i: number) => (
                    <View key={i} style={styles.actionRow}>
                      <Settings color="#00E5FF" size={14} />
                      <Text style={styles.actionText}>{action}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Credentials</Text>
                  {Object.keys(integration.credentials).map((key) => (
                    <View key={key} style={styles.credentialRow}>
                      <Key color="#FFD60A" size={14} />
                      <TextInput
                        style={styles.credentialInput}
                        placeholder={key}
                        placeholderTextColor="#666"
                        value={editingId === integration.id ? (credentials[key] || '') : (integration.credentials[key] ? '••••••••' : '')}
                        onChangeText={(value) => setCredentials({ ...credentials, [key]: value })}
                        editable={editingId === integration.id}
                        secureTextEntry={editingId !== integration.id && !!integration.credentials[key]}
                      />
                    </View>
                  ))}
                </View>

                <View style={styles.buttonRow}>
                  {editingId === integration.id ? (
                    <>
                      <TouchableOpacity
                        style={styles.saveButton}
                        onPress={() => handleSaveCredentials(integration.id)}
                      >
                        <Check color="#000" size={16} />
                        <Text style={styles.saveButtonText}>Save</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => {
                          setEditingId(null);
                          setCredentials({});
                        }}
                      >
                        <X color="#fff" size={16} />
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => {
                          setEditingId(integration.id);
                          setCredentials(integration.credentials);
                        }}
                      >
                        <Settings color="#fff" size={16} />
                        <Text style={styles.editButtonText}>Configure</Text>
                      </TouchableOpacity>
                      {integration.configured && (
                        <TouchableOpacity
                          style={styles.testButton}
                          onPress={() => handleTest(integration.id)}
                        >
                          <ExternalLink color="#00E5FF" size={16} />
                          <Text style={styles.testButtonText}>Test</Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#fff',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    textTransform: 'uppercase' as const,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 12,
    color: '#fff',
    fontSize: 14,
  },
  categoriesScroll: {
    maxHeight: 44,
    marginBottom: 16,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  categoryChipActive: {
    backgroundColor: 'rgba(124, 252, 0, 0.1)',
    borderColor: '#7CFC00',
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600' as const,
  },
  categoryTextActive: {
    color: '#7CFC00',
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  integrationCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    overflow: 'hidden' as const,
  },
  integrationHeader: {
    flexDirection: 'row',
    padding: 16,
  },
  integrationInfo: {
    flex: 1,
    marginRight: 12,
  },
  integrationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  integrationName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  tierText: {
    fontSize: 9,
    fontWeight: '700' as const,
  },
  integrationDescription: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
    lineHeight: 18,
  },
  integrationCategory: {
    fontSize: 11,
    color: '#7CFC00',
    textTransform: 'uppercase' as const,
  },
  integrationActions: {
    alignItems: 'center',
    gap: 8,
  },
  integrationDetails: {
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#7CFC00',
    textTransform: 'uppercase' as const,
    marginBottom: 8,
  },
  capabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  capabilityText: {
    fontSize: 12,
    color: '#e0e0e0',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  actionText: {
    fontSize: 12,
    color: '#00E5FF',
  },
  credentialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  credentialInput: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#fff',
    fontSize: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0a0a0a',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#7CFC00',
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#fff',
  },
  testButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00E5FF',
  },
  testButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#00E5FF',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#7CFC00',
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#000',
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0a0a0a',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#fff',
  },
});
