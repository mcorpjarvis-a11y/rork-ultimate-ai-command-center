import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useState } from 'react';
import { IronManTheme } from '@/constants/colors';
import CompetitorRadarService, { Competitor } from '@/services/CompetitorRadarService';

export default function CompetitorRadar() {
  const [competitors, setCompetitors] = useState(CompetitorRadarService.getCompetitors());
  const [alerts, setAlerts] = useState(CompetitorRadarService.getAlerts());
  const [insights, setInsights] = useState(CompetitorRadarService.getInsights());
  const [analysis, setAnalysis] = useState(CompetitorRadarService.getAnalysis());
  const [activeTab, setActiveTab] = useState<'competitors' | 'alerts' | 'insights'>('competitors');
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [newCompetitor, setNewCompetitor] = useState({
    name: '',
    username: '',
    platform: 'Instagram',
    niche: '',
  });

  const refreshData = () => {
    setCompetitors(CompetitorRadarService.getCompetitors());
    setAlerts(CompetitorRadarService.getAlerts());
    setInsights(CompetitorRadarService.getInsights());
    setAnalysis(CompetitorRadarService.getAnalysis());
  };

  const handleAddCompetitor = async () => {
    if (newCompetitor.name && newCompetitor.username) {
      await CompetitorRadarService.addCompetitor(
        newCompetitor.name,
        newCompetitor.username,
        newCompetitor.platform,
        newCompetitor.niche
      );
      refreshData();
      setShowAddModal(false);
      setNewCompetitor({ name: '', username: '', platform: 'Instagram', niche: '' });
    }
  };

  const handleToggleTracking = async (competitorId: string) => {
    await CompetitorRadarService.toggleTracking(competitorId);
    refreshData();
  };

  const handleRemoveCompetitor = async (competitorId: string) => {
    await CompetitorRadarService.removeCompetitor(competitorId);
    refreshData();
  };

  const handleMarkAlertRead = async (alertId: string) => {
    await CompetitorRadarService.markAlertAsRead(alertId);
    refreshData();
  };

  const getStatusColor = (status: Competitor['status']) => {
    switch (status) {
      case 'ahead': return IronManTheme.warning;
      case 'close': return IronManTheme.accent;
      case 'behind': return IronManTheme.success;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return IronManTheme.error;
      case 'high': return IronManTheme.warning;
      case 'medium': return IronManTheme.accent;
      case 'low': return IronManTheme.success;
      default: return IronManTheme.textSecondary;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getPositionEmoji = (position: string) => {
    switch (position) {
      case 'leader': return '👑';
      case 'contender': return '🥈';
      case 'challenger': return '🥉';
      case 'follower': return '📈';
      default: return '📊';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Analysis Overview */}
      <View style={styles.analysisCard}>
        <Text style={styles.analysisTitle}>Market Position</Text>
        <View style={styles.analysisRow}>
          <Text style={styles.analysisEmoji}>{getPositionEmoji(analysis.marketPosition)}</Text>
          <View style={styles.analysisDetails}>
            <Text style={styles.analysisPosition}>{analysis.marketPosition.toUpperCase()}</Text>
            <Text style={styles.analysisSubtext}>
              {analysis.totalCompetitors} competitors tracked
            </Text>
          </View>
        </View>
      </View>

      {/* Key Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatNumber(analysis.averageFollowers)}</Text>
          <Text style={styles.statLabel}>Avg Followers</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{analysis.averageEngagement}%</Text>
          <Text style={styles.statLabel}>Avg Engagement</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: IronManTheme.warning }]}>
            {analysis.threatsIdentified}
          </Text>
          <Text style={styles.statLabel}>Threats</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: IronManTheme.success }]}>
            {analysis.opportunitiesFound}
          </Text>
          <Text style={styles.statLabel}>Opportunities</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {(['competitors', 'alerts', 'insights'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'alerts' && CompetitorRadarService.getUnreadAlerts().length > 0 && (
                <Text style={styles.badge}> {CompetitorRadarService.getUnreadAlerts().length}</Text>
              )}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Add Competitor Button */}
      {activeTab === 'competitors' && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>+ Add Competitor</Text>
        </TouchableOpacity>
      )}

      {/* Competitors Tab */}
      {activeTab === 'competitors' && (
        <View style={styles.section}>
          {competitors.map((competitor) => (
            <View key={competitor.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.competitorInfo}>
                  <Text style={styles.competitorName}>{competitor.name}</Text>
                  <Text style={styles.competitorUsername}>{competitor.username}</Text>
                  <View style={styles.platformBadge}>
                    <Text style={styles.platformText}>{competitor.platform}</Text>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(competitor.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(competitor.status) }]}>
                    {competitor.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.competitorStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statItemValue}>{formatNumber(competitor.followers)}</Text>
                  <Text style={styles.statItemLabel}>Followers</Text>
                  <Text style={[styles.growthText, { color: competitor.followersGrowth > 0 ? IronManTheme.success : IronManTheme.error }]}>
                    {competitor.followersGrowth > 0 ? '+' : ''}{competitor.followersGrowth.toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statItemValue}>{competitor.engagementRate.toFixed(1)}%</Text>
                  <Text style={styles.statItemLabel}>Engagement</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statItemValue}>{competitor.postsPerWeek}</Text>
                  <Text style={styles.statItemLabel}>Posts/Week</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statItemValue}>${formatNumber(competitor.estimatedRevenue)}</Text>
                  <Text style={styles.statItemLabel}>Est. Revenue</Text>
                </View>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[
                    styles.trackingButton,
                    competitor.tracking ? styles.trackingButtonActive : styles.trackingButtonInactive
                  ]}
                  onPress={() => handleToggleTracking(competitor.id)}
                >
                  <Text style={styles.trackingButtonText}>
                    {competitor.tracking ? '👁️ Tracking' : '👁️‍🗨️ Not Tracking'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveCompetitor(competitor.id)}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <View style={styles.section}>
          {alerts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>🔔</Text>
              <Text style={styles.emptyStateText}>No alerts yet</Text>
            </View>
          ) : (
            alerts.map((alert) => (
              <TouchableOpacity
                key={alert.id}
                style={[styles.alertCard, !alert.read && styles.alertCardUnread]}
                onPress={() => handleMarkAlertRead(alert.id)}
              >
                <View style={styles.alertHeader}>
                  <View style={[styles.severityDot, { backgroundColor: getSeverityColor(alert.severity) }]} />
                  <Text style={styles.alertCompetitor}>{alert.competitorName}</Text>
                  <Text style={styles.alertTime}>
                    {Math.floor((Date.now() - alert.timestamp) / (60 * 60 * 1000))}h ago
                  </Text>
                </View>
                <Text style={styles.alertMessage}>{alert.message}</Text>
                <View style={styles.alertType}>
                  <Text style={styles.alertTypeText}>{alert.type.replace('_', ' ').toUpperCase()}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <View style={styles.section}>
          {insights.map((insight) => (
            <View key={insight.id} style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <Text style={styles.insightCompetitor}>💡 {insight.competitorName}</Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{insight.category.replace('_', ' ')}</Text>
                </View>
              </View>
              <Text style={styles.insightText}>{insight.insight}</Text>
              <View style={styles.recommendationBox}>
                <Text style={styles.recommendationLabel}>Recommendation:</Text>
                <Text style={styles.recommendationText}>{insight.recommendation}</Text>
              </View>
              <View style={styles.impactBadge}>
                <Text style={[
                  styles.impactText,
                  {
                    color: insight.impact === 'high' ? IronManTheme.warning :
                          insight.impact === 'medium' ? IronManTheme.accent : IronManTheme.success
                  }
                ]}>
                  {insight.impact.toUpperCase()} IMPACT
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Add Competitor Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Competitor</Text>
            
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.input}
              value={newCompetitor.name}
              onChangeText={(text) => setNewCompetitor({ ...newCompetitor, name: text })}
              placeholder="Competitor's name"
              placeholderTextColor={IronManTheme.textSecondary}
            />

            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={styles.input}
              value={newCompetitor.username}
              onChangeText={(text) => setNewCompetitor({ ...newCompetitor, username: text })}
              placeholder="@username"
              placeholderTextColor={IronManTheme.textSecondary}
            />

            <Text style={styles.inputLabel}>Platform</Text>
            <View style={styles.platformButtons}>
              {['Instagram', 'TikTok', 'YouTube', 'Twitter', 'LinkedIn'].map((platform) => (
                <TouchableOpacity
                  key={platform}
                  style={[
                    styles.platformButton,
                    newCompetitor.platform === platform && styles.platformButtonActive
                  ]}
                  onPress={() => setNewCompetitor({ ...newCompetitor, platform })}
                >
                  <Text style={[
                    styles.platformButtonText,
                    newCompetitor.platform === platform && styles.platformButtonTextActive
                  ]}>
                    {platform}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Niche</Text>
            <TextInput
              style={styles.input}
              value={newCompetitor.niche}
              onChangeText={(text) => setNewCompetitor({ ...newCompetitor, niche: text })}
              placeholder="e.g., Fitness, Tech, Food"
              placeholderTextColor={IronManTheme.textSecondary}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalButtonSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleAddCompetitor}
                disabled={!newCompetitor.name || !newCompetitor.username}
              >
                <Text style={styles.modalButtonText}>Add Competitor</Text>
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
  analysisCard: {
    backgroundColor: `linear-gradient(135deg, ${IronManTheme.primary}, ${IronManTheme.secondary})`,
    backgroundColor: IronManTheme.surfaceLight,
    borderWidth: 1,
    borderColor: IronManTheme.accent,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  analysisTitle: {
    fontSize: 14,
    color: IronManTheme.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  analysisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  analysisEmoji: {
    fontSize: 48,
  },
  analysisDetails: {
    flex: 1,
  },
  analysisPosition: {
    fontSize: 28,
    fontWeight: '700',
    color: IronManTheme.accent,
  },
  analysisSubtext: {
    fontSize: 14,
    color: IronManTheme.textSecondary,
    marginTop: 4,
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
    fontSize: 20,
    fontWeight: '700',
    color: IronManTheme.accent,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: IronManTheme.textSecondary,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: IronManTheme.surfaceLight,
    alignItems: 'center',
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
  badge: {
    backgroundColor: IronManTheme.warning,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 11,
    fontWeight: '700',
    color: IronManTheme.text,
  },
  addButton: {
    backgroundColor: IronManTheme.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: IronManTheme.text,
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    gap: 12,
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
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  competitorInfo: {
    flex: 1,
  },
  competitorName: {
    fontSize: 18,
    fontWeight: '700',
    color: IronManTheme.text,
    marginBottom: 4,
  },
  competitorUsername: {
    fontSize: 14,
    color: IronManTheme.accent,
    marginBottom: 8,
  },
  platformBadge: {
    backgroundColor: IronManTheme.accent + '20',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  platformText: {
    color: IronManTheme.accent,
    fontSize: 11,
    fontWeight: '600',
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  competitorStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
  },
  statItemValue: {
    fontSize: 16,
    fontWeight: '700',
    color: IronManTheme.accent,
    marginBottom: 2,
  },
  statItemLabel: {
    fontSize: 10,
    color: IronManTheme.textSecondary,
  },
  growthText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  trackingButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  trackingButtonActive: {
    backgroundColor: IronManTheme.success + '20',
    borderWidth: 1,
    borderColor: IronManTheme.success,
  },
  trackingButtonInactive: {
    backgroundColor: IronManTheme.textSecondary + '20',
    borderWidth: 1,
    borderColor: IronManTheme.textSecondary,
  },
  trackingButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: IronManTheme.text,
  },
  removeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: IronManTheme.error + '20',
    borderWidth: 1,
    borderColor: IronManTheme.error,
  },
  removeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: IronManTheme.error,
  },
  alertCard: {
    backgroundColor: IronManTheme.surfaceLight,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: IronManTheme.accent + '20',
  },
  alertCardUnread: {
    borderColor: IronManTheme.accent,
    backgroundColor: IronManTheme.accent + '10',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  severityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  alertCompetitor: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: IronManTheme.text,
  },
  alertTime: {
    fontSize: 12,
    color: IronManTheme.textSecondary,
  },
  alertMessage: {
    fontSize: 14,
    color: IronManTheme.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  alertType: {
    alignSelf: 'flex-start',
    backgroundColor: IronManTheme.accent + '20',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  alertTypeText: {
    fontSize: 10,
    fontWeight: '600',
    color: IronManTheme.accent,
  },
  insightCard: {
    backgroundColor: IronManTheme.surfaceLight,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: IronManTheme.jarvisGreen + '40',
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightCompetitor: {
    fontSize: 15,
    fontWeight: '700',
    color: IronManTheme.jarvisGreen,
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: IronManTheme.accent + '20',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: IronManTheme.accent,
    textTransform: 'capitalize',
  },
  insightText: {
    fontSize: 14,
    color: IronManTheme.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  recommendationBox: {
    backgroundColor: IronManTheme.accent + '10',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: IronManTheme.accent,
    marginBottom: 8,
  },
  recommendationLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: IronManTheme.accent,
    marginBottom: 4,
  },
  recommendationText: {
    fontSize: 13,
    color: IronManTheme.text,
    lineHeight: 18,
  },
  impactBadge: {
    alignSelf: 'flex-start',
  },
  impactText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: IronManTheme.textSecondary,
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
  platformButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  platformButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: IronManTheme.surfaceLight,
    borderWidth: 1,
    borderColor: IronManTheme.textSecondary,
  },
  platformButtonActive: {
    backgroundColor: IronManTheme.accent + '20',
    borderColor: IronManTheme.accent,
  },
  platformButtonText: {
    color: IronManTheme.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  platformButtonTextActive: {
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
