import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useState } from 'react';
import { IronManTheme } from '@/constants/colors';
import EmailMarketingService from '@/services/marketing/EmailMarketingService';

export default function EmailMarketing() {
  const [campaigns, setCampaigns] = useState(EmailMarketingService.getCampaigns());
  const [lists, setLists] = useState(EmailMarketingService.getLists());
  const [automations, setAutomations] = useState(EmailMarketingService.getAutomations());
  const [stats, setStats] = useState(EmailMarketingService.getStats());
  const [activeTab, setActiveTab] = useState<'campaigns' | 'lists' | 'automations' | 'templates'>('campaigns');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [generating, setGenerating] = useState(false);

  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'promotional',
    audience: 'all subscribers',
    topic: '',
    tone: 'professional',
  });

  const handleGenerateWithAI = async () => {
    setGenerating(true);
    try {
      const result = await EmailMarketingService.generateCampaignWithAI(
        newCampaign.type,
        newCampaign.audience,
        newCampaign.topic,
        newCampaign.tone
      );

      const firstList = lists[0];
      if (firstList) {
        await EmailMarketingService.createCampaign(
          newCampaign.name || `${newCampaign.type} Campaign`,
          result.subject,
          result.content,
          firstList.id,
          {
            tags: [newCampaign.type],
            aiGenerated: true,
            personalization: true,
          }
        );
      }

      refreshData();
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to generate campaign:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleSendCampaign = async (campaignId: string) => {
    try {
      await EmailMarketingService.sendCampaign(campaignId);
      refreshData();
    } catch (error) {
      console.error('Failed to send campaign:', error);
    }
  };

  const handleToggleAutomation = async (automationId: string) => {
    await EmailMarketingService.toggleAutomation(automationId);
    refreshData();
  };

  const refreshData = () => {
    setCampaigns(EmailMarketingService.getCampaigns());
    setLists(EmailMarketingService.getLists());
    setAutomations(EmailMarketingService.getAutomations());
    setStats(EmailMarketingService.getStats());
  };

  const resetForm = () => {
    setNewCampaign({
      name: '',
      type: 'promotional',
      audience: 'all subscribers',
      topic: '',
      tone: 'professional',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return IronManTheme.success;
      case 'scheduled':
        return IronManTheme.accent;
      case 'draft':
        return IronManTheme.textSecondary;
      case 'paused':
        return IronManTheme.warning;
      default:
        return IronManTheme.textSecondary;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatNumber(stats.totalSubscribers)}</Text>
          <Text style={styles.statLabel}>Total Subscribers</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.averageOpenRate.toFixed(1)}%</Text>
          <Text style={styles.statLabel}>Avg Open Rate</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.averageClickRate.toFixed(1)}%</Text>
          <Text style={styles.statLabel}>Avg Click Rate</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>${formatNumber(Math.round(stats.totalRevenue))}</Text>
          <Text style={styles.statLabel}>Total Revenue</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {(['campaigns', 'lists', 'automations', 'templates'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Create Button */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => setShowCreateModal(true)}
      >
        <Text style={styles.createButtonText}>+ Create New Campaign with AI</Text>
      </TouchableOpacity>

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email Campaigns</Text>
          {campaigns.map((campaign) => (
            <View key={campaign.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                  <Text style={styles.cardTitle}>{campaign.name}</Text>
                  {campaign.aiGenerated && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>AI Generated</Text>
                    </View>
                  )}
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(campaign.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(campaign.status) }]}>
                    {campaign.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.cardSubject}>📧 {campaign.subject}</Text>
              
              <View style={styles.cardStats}>
                <View style={styles.cardStat}>
                  <Text style={styles.cardStatValue}>{formatNumber(campaign.audienceSize)}</Text>
                  <Text style={styles.cardStatLabel}>Recipients</Text>
                </View>
                {campaign.status === 'sent' && (
                  <>
                    <View style={styles.cardStat}>
                      <Text style={styles.cardStatValue}>{campaign.openRate.toFixed(1)}%</Text>
                      <Text style={styles.cardStatLabel}>Opens</Text>
                    </View>
                    <View style={styles.cardStat}>
                      <Text style={styles.cardStatValue}>{campaign.clickRate.toFixed(1)}%</Text>
                      <Text style={styles.cardStatLabel}>Clicks</Text>
                    </View>
                    <View style={styles.cardStat}>
                      <Text style={styles.cardStatValue}>{campaign.conversionRate.toFixed(1)}%</Text>
                      <Text style={styles.cardStatLabel}>Conversions</Text>
                    </View>
                  </>
                )}
              </View>

              {campaign.status === 'draft' && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleSendCampaign(campaign.id)}
                >
                  <Text style={styles.actionButtonText}>Send Campaign</Text>
                </TouchableOpacity>
              )}

              {campaign.status === 'scheduled' && campaign.scheduledFor && (
                <Text style={styles.scheduledText}>
                  📅 Scheduled for {new Date(campaign.scheduledFor).toLocaleDateString()}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Lists Tab */}
      {activeTab === 'lists' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email Lists</Text>
          {lists.map((list) => (
            <View key={list.id} style={styles.card}>
              <Text style={styles.cardTitle}>{list.name}</Text>
              <View style={styles.cardStats}>
                <View style={styles.cardStat}>
                  <Text style={styles.cardStatValue}>{formatNumber(list.subscribers)}</Text>
                  <Text style={styles.cardStatLabel}>Subscribers</Text>
                </View>
                <View style={styles.cardStat}>
                  <Text style={[styles.cardStatValue, { color: IronManTheme.success }]}>
                    +{list.growthRate.toFixed(1)}%
                  </Text>
                  <Text style={styles.cardStatLabel}>Growth</Text>
                </View>
                <View style={styles.cardStat}>
                  <Text style={styles.cardStatValue}>{list.engagementScore}</Text>
                  <Text style={styles.cardStatLabel}>Engagement</Text>
                </View>
              </View>
              <View style={styles.tags}>
                {list.tags.map((tag, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Automations Tab */}
      {activeTab === 'automations' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email Automations</Text>
          {automations.map((automation) => (
            <View key={automation.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{automation.name}</Text>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    automation.active ? styles.toggleButtonActive : styles.toggleButtonInactive
                  ]}
                  onPress={() => handleToggleAutomation(automation.id)}
                >
                  <Text style={styles.toggleButtonText}>
                    {automation.active ? 'ON' : 'OFF'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.automationDetails}>
                <Text style={styles.automationTrigger}>
                  ⚡ Trigger: <Text style={styles.automationValue}>{automation.trigger.replace('_', ' ')}</Text>
                </Text>
                <Text style={styles.automationAction}>
                  🎯 Action: <Text style={styles.automationValue}>{automation.action}</Text>
                </Text>
                <Text style={styles.automationDelay}>
                  ⏱️ Delay: <Text style={styles.automationValue}>{automation.delay}h</Text>
                </Text>
              </View>

              <View style={styles.cardStats}>
                <View style={styles.cardStat}>
                  <Text style={styles.cardStatValue}>{automation.sentCount}</Text>
                  <Text style={styles.cardStatLabel}>Sent</Text>
                </View>
                <View style={styles.cardStat}>
                  <Text style={styles.cardStatValue}>{automation.conversionRate.toFixed(1)}%</Text>
                  <Text style={styles.cardStatLabel}>Conversion</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email Templates</Text>
          {EmailMarketingService.getTemplates().map((template) => (
            <View key={template.id} style={styles.card}>
              <Text style={styles.cardTitle}>{template.name}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{template.category.replace('_', ' ')}</Text>
              </View>
              <Text style={styles.cardSubject}>📧 {template.subject}</Text>
              <Text style={styles.templatePreview}>{template.previewText}</Text>
              <Text style={styles.templateUsage}>Used {template.usageCount} times</Text>
            </View>
          ))}
        </View>
      )}

      {/* Create Campaign Modal */}
      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Campaign with AI</Text>
            
            <Text style={styles.inputLabel}>Campaign Name</Text>
            <TextInput
              style={styles.input}
              value={newCampaign.name}
              onChangeText={(text) => setNewCampaign({ ...newCampaign, name: text })}
              placeholder="e.g., Summer Sale 2024"
              placeholderTextColor={IronManTheme.textSecondary}
            />

            <Text style={styles.inputLabel}>Campaign Type</Text>
            <View style={styles.typeButtons}>
              {['promotional', 'newsletter', 'product_launch', 'event'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    newCampaign.type === type && styles.typeButtonActive
                  ]}
                  onPress={() => setNewCampaign({ ...newCampaign, type })}
                >
                  <Text style={[
                    styles.typeButtonText,
                    newCampaign.type === type && styles.typeButtonTextActive
                  ]}>
                    {type.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Product/Topic</Text>
            <TextInput
              style={styles.input}
              value={newCampaign.topic}
              onChangeText={(text) => setNewCampaign({ ...newCampaign, topic: text })}
              placeholder="What is this campaign about?"
              placeholderTextColor={IronManTheme.textSecondary}
            />

            <Text style={styles.inputLabel}>Tone</Text>
            <View style={styles.typeButtons}>
              {['professional', 'casual', 'friendly', 'urgent'].map((tone) => (
                <TouchableOpacity
                  key={tone}
                  style={[
                    styles.typeButton,
                    newCampaign.tone === tone && styles.typeButtonActive
                  ]}
                  onPress={() => setNewCampaign({ ...newCampaign, tone })}
                >
                  <Text style={[
                    styles.typeButtonText,
                    newCampaign.tone === tone && styles.typeButtonTextActive
                  ]}>
                    {tone}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, generating && styles.modalButtonDisabled]}
                onPress={handleGenerateWithAI}
                disabled={generating || !newCampaign.topic}
              >
                <Text style={styles.modalButtonText}>
                  {generating ? 'Generating...' : '✨ Generate with AI'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: IronManTheme.background,
  },
  content: {
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: IronManTheme.surfaceLight,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: IronManTheme.accent + '20',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: IronManTheme.accent,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: IronManTheme.textSecondary,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: IronManTheme.surfaceLight,
  },
  tabActive: {
    backgroundColor: IronManTheme.accent + '20',
    borderWidth: 1,
    borderColor: IronManTheme.accent,
  },
  tabText: {
    color: IronManTheme.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: IronManTheme.accent,
  },
  createButton: {
    backgroundColor: IronManTheme.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  createButtonText: {
    color: IronManTheme.text,
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: IronManTheme.text,
    marginBottom: 8,
  },
  card: {
    backgroundColor: IronManTheme.surfaceLight,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: IronManTheme.accent + '20',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: IronManTheme.text,
  },
  cardSubject: {
    fontSize: 14,
    color: IronManTheme.accent,
    marginBottom: 12,
  },
  cardStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  cardStat: {
    flex: 1,
  },
  cardStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: IronManTheme.accent,
  },
  cardStatLabel: {
    fontSize: 11,
    color: IronManTheme.textSecondary,
    marginTop: 2,
  },
  badge: {
    backgroundColor: IronManTheme.jarvisGreen + '20',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  badgeText: {
    color: IronManTheme.jarvisGreen,
    fontSize: 11,
    fontWeight: '600',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionButton: {
    backgroundColor: IronManTheme.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  actionButtonText: {
    color: IronManTheme.text,
    fontSize: 14,
    fontWeight: '600',
  },
  scheduledText: {
    color: IronManTheme.accent,
    fontSize: 13,
    marginTop: 8,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: IronManTheme.accent + '20',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  tagText: {
    color: IronManTheme.accent,
    fontSize: 12,
  },
  toggleButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  toggleButtonActive: {
    backgroundColor: IronManTheme.success + '20',
    borderWidth: 1,
    borderColor: IronManTheme.success,
  },
  toggleButtonInactive: {
    backgroundColor: IronManTheme.textSecondary + '20',
    borderWidth: 1,
    borderColor: IronManTheme.textSecondary,
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: IronManTheme.text,
  },
  automationDetails: {
    marginVertical: 12,
    gap: 8,
  },
  automationTrigger: {
    fontSize: 13,
    color: IronManTheme.textSecondary,
  },
  automationAction: {
    fontSize: 13,
    color: IronManTheme.textSecondary,
  },
  automationDelay: {
    fontSize: 13,
    color: IronManTheme.textSecondary,
  },
  automationValue: {
    color: IronManTheme.text,
    fontWeight: '600',
  },
  templatePreview: {
    fontSize: 13,
    color: IronManTheme.textSecondary,
    marginTop: 8,
  },
  templateUsage: {
    fontSize: 12,
    color: IronManTheme.accent,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: IronManTheme.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: IronManTheme.accent + '40',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: IronManTheme.accent,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: IronManTheme.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: IronManTheme.surfaceLight,
    borderWidth: 1,
    borderColor: IronManTheme.accent + '40',
    borderRadius: 8,
    padding: 12,
    color: IronManTheme.text,
    fontSize: 14,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: IronManTheme.surfaceLight,
    borderWidth: 1,
    borderColor: IronManTheme.textSecondary,
  },
  typeButtonActive: {
    backgroundColor: IronManTheme.accent + '20',
    borderColor: IronManTheme.accent,
  },
  typeButtonText: {
    color: IronManTheme.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  typeButtonTextActive: {
    color: IronManTheme.accent,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    backgroundColor: IronManTheme.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  modalButtonText: {
    color: IronManTheme.text,
    fontSize: 14,
    fontWeight: '700',
  },
  modalButtonSecondary: {
    flex: 1,
    backgroundColor: IronManTheme.surfaceLight,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: IronManTheme.textSecondary,
  },
  modalButtonSecondaryText: {
    color: IronManTheme.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
});
