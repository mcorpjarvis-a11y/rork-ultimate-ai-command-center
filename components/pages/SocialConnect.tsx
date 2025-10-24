import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/contexts/AppContext';
import { ALL_PLATFORMS, SOCIAL_PLATFORMS, VIDEO_PLATFORMS, GAMING_PLATFORMS, ECOMMERCE_PLATFORMS, MESSAGING_PLATFORMS, OTHER_PLATFORMS } from '@/constants/platforms';
import { Check, X, Plus, Search, TrendingUp, DollarSign, Users, Zap, RefreshCw, Settings, Link as LinkIcon } from 'lucide-react-native';

export default function SocialConnect() {
  const { state, connectSocialAccount, toggleSocialAccount, updateSocialAccount, deleteSocialAccount } = useApp();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newPlatform, setNewPlatform] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newCategory, setNewCategory] = useState<any>('social');

  const categories = [
    { id: 'all', label: 'All Platforms' },
    { id: 'social', label: 'Social Media' },
    { id: 'video', label: 'Video' },
    { id: 'gaming', label: 'Gaming' },
    { id: 'ecommerce', label: 'E-Commerce' },
    { id: 'messaging', label: 'Messaging' },
    { id: 'professional', label: 'Professional' },
    { id: 'other', label: 'Other' },
  ];

  const filteredAccounts = state.socialAccounts.filter(acc => {
    const matchesCategory = selectedCategory === 'all' || acc.category === selectedCategory;
    const matchesSearch = acc.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         acc.username.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const connectedCount = state.socialAccounts.filter(a => a.connected).length;
  const totalFollowers = state.socialAccounts.reduce((sum, a) => sum + (a.followers || 0), 0);
  const totalRevenue = state.socialAccounts.reduce((sum, a) => sum + (a.revenue || 0), 0);
  const avgEngagement = state.socialAccounts.length > 0 
    ? state.socialAccounts.reduce((sum, a) => sum + (a.engagement || 0), 0) / state.socialAccounts.length 
    : 0;

  const availablePlatforms = ALL_PLATFORMS.filter(p => 
    !state.socialAccounts.some(a => a.platform === p.name)
  );

  const handleAddPlatform = () => {
    if (newPlatform && newUsername) {
      connectSocialAccount(newPlatform, newUsername, newCategory);
      setAddModalVisible(false);
      setNewPlatform('');
      setNewUsername('');
      setNewCategory('social');
    }
  };

  const handleSyncAccount = (id: string) => {
    updateSocialAccount(id, {
      followers: Math.floor(Math.random() * 50000) + 1000,
      engagement: parseFloat((Math.random() * 10).toFixed(1)),
      posts: Math.floor(Math.random() * 1000) + 50,
      revenue: parseFloat((Math.random() * 5000).toFixed(2)),
      lastSync: Date.now(),
    });
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Social Connect Hub</Text>
        <Text style={styles.subtitle}>Connect and manage 100+ platforms</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <LinkIcon color="#00E5FF" size={20} />
            <Text style={styles.statValue}>{connectedCount}</Text>
            <Text style={styles.statLabel}>Connected</Text>
          </View>
          <View style={styles.statCard}>
            <Users color="#7CFC00" size={20} />
            <Text style={styles.statValue}>{(totalFollowers / 1000).toFixed(1)}K</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statCard}>
            <TrendingUp color="#FFD700" size={20} />
            <Text style={styles.statValue}>{avgEngagement.toFixed(1)}%</Text>
            <Text style={styles.statLabel}>Avg Engage</Text>
          </View>
          <View style={styles.statCard}>
            <DollarSign color="#10B981" size={20} />
            <Text style={styles.statValue}>${(totalRevenue / 1000).toFixed(1)}K</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
        </View>

        <View style={styles.searchBar}>
          <Search color="#666" size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search platforms..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text style={[styles.categoryText, selectedCategory === cat.id && styles.categoryTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
            <Plus color="#000" size={20} />
            <Text style={styles.addButtonText}>Add Platform</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.syncAllButton}>
            <RefreshCw color="#00E5FF" size={18} />
            <Text style={styles.syncAllText}>Sync All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.accountsList}>
          {filteredAccounts.map((account) => (
            <View key={account.id} style={styles.accountCard}>
              <View style={styles.accountHeader}>
                <View style={[styles.platformBadge, styles[`${account.category}Badge` as keyof typeof styles] as any]}>
                  <Text style={styles.platformInitial}>{account.platform[0]}</Text>
                </View>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountPlatform}>{account.platform}</Text>
                  <Text style={styles.accountUsername}>{account.username}</Text>
                  <Text style={styles.accountCategory}>{account.category.toUpperCase()}</Text>
                </View>
                <View style={[styles.statusDot, account.connected && styles.statusDotActive]} />
              </View>

              <View style={styles.accountStats}>
                <View style={styles.accountStat}>
                  <Users color="#999" size={14} />
                  <Text style={styles.accountStatValue}>{(account.followers || 0).toLocaleString()}</Text>
                  <Text style={styles.accountStatLabel}>Followers</Text>
                </View>
                <View style={styles.accountStat}>
                  <TrendingUp color="#999" size={14} />
                  <Text style={styles.accountStatValue}>{(account.engagement || 0).toFixed(1)}%</Text>
                  <Text style={styles.accountStatLabel}>Engagement</Text>
                </View>
                <View style={styles.accountStat}>
                  <Zap color="#999" size={14} />
                  <Text style={styles.accountStatValue}>{account.posts || 0}</Text>
                  <Text style={styles.accountStatLabel}>Posts</Text>
                </View>
                <View style={styles.accountStat}>
                  <DollarSign color="#999" size={14} />
                  <Text style={styles.accountStatValue}>${(account.revenue || 0).toFixed(0)}</Text>
                  <Text style={styles.accountStatLabel}>Revenue</Text>
                </View>
              </View>

              {account.lastSync && (
                <Text style={styles.lastSync}>
                  Last synced: {new Date(account.lastSync).toLocaleString()}
                </Text>
              )}

              <View style={styles.accountActions}>
                <TouchableOpacity
                  style={[styles.actionButton, account.connected ? styles.disconnectButton : styles.connectButton]}
                  onPress={() => toggleSocialAccount(account.id)}
                >
                  {account.connected ? <X color="#EF4444" size={16} /> : <Check color="#10B981" size={16} />}
                  <Text style={[styles.actionText, account.connected ? styles.disconnectText : styles.connectText]}>
                    {account.connected ? 'Disconnect' : 'Connect'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleSyncAccount(account.id)}>
                  <RefreshCw color="#00E5FF" size={16} />
                  <Text style={styles.actionText}>Sync</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Settings color="#999" size={16} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.availableSection}>
          <Text style={styles.availableTitle}>Available Platforms ({availablePlatforms.length})</Text>
          <View style={styles.availableGrid}>
            {availablePlatforms.slice(0, 20).map((platform, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.availableCard}
                onPress={() => {
                  setNewPlatform(platform.name);
                  setNewCategory(platform.category);
                  setAddModalVisible(true);
                }}
              >
                <View style={[styles.availableBadge, styles[`${platform.category}Badge` as keyof typeof styles] as any]}>
                  <Text style={styles.availableInitial}>{platform.name[0]}</Text>
                </View>
                <Text style={styles.availableName}>{platform.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal visible={addModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Platform</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Platform name"
              placeholderTextColor="#666"
              value={newPlatform}
              onChangeText={setNewPlatform}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Username/handle"
              placeholderTextColor="#666"
              value={newUsername}
              onChangeText={setNewUsername}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setAddModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalAddButton} onPress={handleAddPlatform}>
                <Text style={styles.modalAddText}>Add</Text>
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
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
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
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 12,
    gap: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
  },
  categoriesRow: {
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#0a0a0a',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  categoryChipActive: {
    backgroundColor: '#0a1a1f',
    borderColor: '#00E5FF',
  },
  categoryText: {
    color: '#666',
    fontSize: 13,
    fontWeight: '600' as const,
  },
  categoryTextActive: {
    color: '#00E5FF',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00E5FF',
    borderRadius: 12,
    padding: 14,
  },
  addButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700' as const,
  },
  syncAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 14,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#00E5FF',
  },
  syncAllText: {
    color: '#00E5FF',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  accountsList: {
    gap: 16,
    marginBottom: 32,
  },
  accountCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  platformBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialBadge: { backgroundColor: '#E1306C20' },
  videoBadge: { backgroundColor: '#FF000020' },
  gamingBadge: { backgroundColor: '#9146FF20' },
  ecommerceBadge: { backgroundColor: '#FFD70020' },
  messagingBadge: { backgroundColor: '#25D36620' },
  professionalBadge: { backgroundColor: '#0A66C220' },
  otherBadge: { backgroundColor: '#99999920' },
  platformInitial: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
  },
  accountInfo: {
    flex: 1,
  },
  accountPlatform: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  accountUsername: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  accountCategory: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#444',
  },
  statusDotActive: {
    backgroundColor: '#10B981',
  },
  accountStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  accountStat: {
    alignItems: 'center',
    gap: 4,
  },
  accountStatValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#fff',
    marginTop: 2,
  },
  accountStatLabel: {
    fontSize: 9,
    color: '#666',
  },
  lastSync: {
    fontSize: 11,
    color: '#555',
    marginBottom: 12,
  },
  accountActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
  },
  connectButton: {
    backgroundColor: '#0a1a0f',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  disconnectButton: {
    backgroundColor: '#1a0a0a',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#999',
  },
  connectText: {
    color: '#10B981',
  },
  disconnectText: {
    color: '#EF4444',
  },
  availableSection: {
    marginTop: 24,
  },
  availableTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 16,
  },
  availableGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  availableCard: {
    width: 70,
    alignItems: 'center',
    gap: 8,
  },
  availableBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  availableInitial: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
  },
  availableName: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#0a0a0a',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalCancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#999',
    fontSize: 15,
    fontWeight: '600' as const,
  },
  modalAddButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#00E5FF',
    alignItems: 'center',
  },
  modalAddText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '700' as const,
  },
});
