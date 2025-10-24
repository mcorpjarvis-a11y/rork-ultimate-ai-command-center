import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useEffect } from 'react';
import { Zap, TrendingUp, DollarSign, Target, AlertCircle, CheckCircle, Clock, Settings } from 'lucide-react-native';
import AutonomousEngine from '@/services/AutonomousEngine';

export default function AutonomousOpsPage() {
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [recentActions, setRecentActions] = useState<any[]>([]);
  const [autonomyLevel, setAutonomyLevel] = useState('moderate');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const metricsData = await AutonomousEngine.getPerformanceMetrics();
    const campaignsData = AutonomousEngine.getCampaigns();
    const opportunitiesData = AutonomousEngine.getOpportunities();
    const actionsData = AutonomousEngine.getRecentActions(20);
    const level = AutonomousEngine.getAutonomyLevel();
    
    setMetrics(metricsData);
    setCampaigns(campaignsData);
    setOpportunities(opportunitiesData);
    setRecentActions(actionsData);
    setAutonomyLevel(level);
    setLoading(false);
  };

  const handleOptimize = async () => {
    setLoading(true);
    const result = await AutonomousEngine.optimizeCampaigns();
    console.log('Optimization result:', result);
    await loadData();
  };

  const handleApprove = async (id: string) => {
    await AutonomousEngine.approveOpportunity(id);
    await loadData();
  };

  const handleReject = async (id: string) => {
    await AutonomousEngine.rejectOpportunity(id);
    await loadData();
  };

  const setLevel = (level: 'conservative' | 'moderate' | 'aggressive') => {
    AutonomousEngine.setAutonomyLevel(level);
    setAutonomyLevel(level);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#7CFC00';
      case 'testing': return '#FFD60A';
      case 'paused': return '#FF9500';
      case 'killed': return '#FF3B30';
      default: return '#666';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#FF3B30';
      case 'high': return '#FF9500';
      case 'medium': return '#FFD60A';
      case 'low': return '#7CFC00';
      default: return '#666';
    }
  };

  if (!metrics) return null;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadData} tintColor="#7CFC00" />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Autonomous Operations</Text>
          <Text style={styles.subtitle}>AI-driven decision making and optimization</Text>
        </View>
        <TouchableOpacity style={styles.optimizeButton} onPress={handleOptimize}>
          <Zap color="#000" size={18} />
          <Text style={styles.optimizeButtonText}>Optimize</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.autonomyLevelSection}>
        <Text style={styles.sectionTitle}>Autonomy Level</Text>
        <View style={styles.levelButtons}>
          <TouchableOpacity
            style={[styles.levelButton, autonomyLevel === 'conservative' && styles.levelButtonActive]}
            onPress={() => setLevel('conservative')}
          >
            <Text style={[styles.levelText, autonomyLevel === 'conservative' && styles.levelTextActive]}>
              Conservative
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.levelButton, autonomyLevel === 'moderate' && styles.levelButtonActive]}
            onPress={() => setLevel('moderate')}
          >
            <Text style={[styles.levelText, autonomyLevel === 'moderate' && styles.levelTextActive]}>
              Moderate
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.levelButton, autonomyLevel === 'aggressive' && styles.levelButtonActive]}
            onPress={() => setLevel('aggressive')}
          >
            <Text style={[styles.levelText, autonomyLevel === 'aggressive' && styles.levelTextActive]}>
              Aggressive
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <DollarSign color="#7CFC00" size={24} />
          <Text style={styles.metricValue}>${metrics.revenue.today.toFixed(0)}</Text>
          <Text style={styles.metricLabel}>Today's Revenue</Text>
          <Text style={[styles.metricChange, { color: metrics.revenue.change > 0 ? '#7CFC00' : '#FF3B30' }]}>
            {metrics.revenue.change > 0 ? '+' : ''}{metrics.revenue.change.toFixed(1)}%
          </Text>
        </View>
        <View style={styles.metricCard}>
          <TrendingUp color="#00E5FF" size={24} />
          <Text style={styles.metricValue}>{metrics.profit.margin.toFixed(1)}%</Text>
          <Text style={styles.metricLabel}>Profit Margin</Text>
          <Text style={styles.metricSubtext}>${metrics.profit.month.toFixed(0)}/mo</Text>
        </View>
        <View style={styles.metricCard}>
          <Target color="#FFD60A" size={24} />
          <Text style={styles.metricValue}>{metrics.campaigns.avgRoi.toFixed(2)}x</Text>
          <Text style={styles.metricLabel}>Avg ROI</Text>
          <Text style={styles.metricSubtext}>{metrics.campaigns.active} active</Text>
        </View>
        <View style={styles.metricCard}>
          <Zap color="#FF9500" size={24} />
          <Text style={styles.metricValue}>{metrics.content.posted}</Text>
          <Text style={styles.metricLabel}>Content Posted</Text>
          <Text style={styles.metricSubtext}>{metrics.content.avgEngagement.toFixed(1)}% engagement</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Opportunities ({opportunities.length})</Text>
          <Text style={styles.sectionSubtitle}>Requires your approval</Text>
        </View>
        {opportunities.map((opp) => (
          <View key={opp.id} style={styles.opportunityCard}>
            <View style={styles.opportunityHeader}>
              <View style={styles.opportunityTitleRow}>
                <Text style={styles.opportunityType}>{opp.type.toUpperCase()}</Text>
                <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(opp.priority) + '20', borderColor: getPriorityColor(opp.priority) }]}>
                  <Text style={[styles.priorityText, { color: getPriorityColor(opp.priority) }]}>
                    {opp.priority.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.opportunityTitle}>{opp.title}</Text>
              <Text style={styles.opportunityDescription}>{opp.description}</Text>
            </View>
            <View style={styles.opportunityMetrics}>
              <View style={styles.opportunityMetric}>
                <Text style={styles.opportunityMetricLabel}>Projected Revenue</Text>
                <Text style={styles.opportunityMetricValue}>${opp.projectedRevenue.toFixed(0)}</Text>
              </View>
              <View style={styles.opportunityMetric}>
                <Text style={styles.opportunityMetricLabel}>Investment</Text>
                <Text style={styles.opportunityMetricValue}>${opp.investment.toFixed(0)}</Text>
              </View>
              <View style={styles.opportunityMetric}>
                <Text style={styles.opportunityMetricLabel}>ROI</Text>
                <Text style={styles.opportunityMetricValue}>{opp.roi.toFixed(1)}x</Text>
              </View>
              <View style={styles.opportunityMetric}>
                <Text style={styles.opportunityMetricLabel}>Confidence</Text>
                <Text style={styles.opportunityMetricValue}>{(opp.confidence * 100).toFixed(0)}%</Text>
              </View>
            </View>
            <View style={styles.opportunityActions}>
              <TouchableOpacity
                style={styles.approveButton}
                onPress={() => handleApprove(opp.id)}
              >
                <CheckCircle color="#000" size={16} />
                <Text style={styles.approveButtonText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectButton}
                onPress={() => handleReject(opp.id)}
              >
                <AlertCircle color="#fff" size={16} />
                <Text style={styles.rejectButtonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Campaigns ({campaigns.length})</Text>
        {campaigns.map((campaign) => (
          <View key={campaign.id} style={styles.campaignCard}>
            <View style={styles.campaignHeader}>
              <View style={styles.campaignInfo}>
                <Text style={styles.campaignName}>{campaign.name}</Text>
                <Text style={styles.campaignPlatform}>{campaign.platform}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(campaign.status) + '20', borderColor: getStatusColor(campaign.status) }]}>
                <Text style={[styles.statusText, { color: getStatusColor(campaign.status) }]}>
                  {campaign.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <View style={styles.campaignMetrics}>
              <View style={styles.campaignMetric}>
                <Text style={styles.campaignMetricLabel}>Spend</Text>
                <Text style={styles.campaignMetricValue}>${campaign.spend}</Text>
              </View>
              <View style={styles.campaignMetric}>
                <Text style={styles.campaignMetricLabel}>Revenue</Text>
                <Text style={styles.campaignMetricValue}>${campaign.revenue}</Text>
              </View>
              <View style={styles.campaignMetric}>
                <Text style={styles.campaignMetricLabel}>ROI</Text>
                <Text style={[styles.campaignMetricValue, { color: campaign.roi > 2 ? '#7CFC00' : campaign.roi > 1.5 ? '#FFD60A' : '#FF3B30' }]}>
                  {campaign.roi.toFixed(2)}x
                </Text>
              </View>
              <View style={styles.campaignMetric}>
                <Text style={styles.campaignMetricLabel}>Risk</Text>
                <Text style={[styles.campaignMetricValue, { color: campaign.risk < 0.3 ? '#7CFC00' : campaign.risk < 0.5 ? '#FFD60A' : '#FF3B30' }]}>
                  {(campaign.risk * 100).toFixed(0)}%
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Autonomous Actions</Text>
        {recentActions.map((action) => (
          <View key={action.id} style={styles.actionCard}>
            <View style={styles.actionHeader}>
              <Settings color="#7CFC00" size={16} />
              <Text style={styles.actionType}>{action.type.toUpperCase()}</Text>
              <Clock color="#666" size={12} />
              <Text style={styles.actionTime}>
                {new Date(action.timestamp).toLocaleTimeString()}
              </Text>
            </View>
            <Text style={styles.actionText}>{action.action}</Text>
            <Text style={styles.actionResult}>{action.result}</Text>
            {action.impact > 0 && (
              <Text style={styles.actionImpact}>Impact: ${action.impact.toFixed(0)}</Text>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  optimizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#7CFC00',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  optimizeButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#000',
  },
  autonomyLevelSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  levelButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  levelButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#1a1a1a',
    alignItems: 'center',
  },
  levelButtonActive: {
    backgroundColor: 'rgba(124, 252, 0, 0.1)',
    borderColor: '#7CFC00',
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#666',
  },
  levelTextActive: {
    color: '#7CFC00',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#fff',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    textTransform: 'uppercase' as const,
  },
  metricChange: {
    fontSize: 12,
    fontWeight: '600' as const,
    marginTop: 4,
  },
  metricSubtext: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  section: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  opportunityCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  opportunityHeader: {
    marginBottom: 12,
  },
  opportunityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  opportunityType: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#7CFC00',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: '700' as const,
  },
  opportunityTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 6,
  },
  opportunityDescription: {
    fontSize: 13,
    color: '#999',
    lineHeight: 18,
  },
  opportunityMetrics: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  opportunityMetric: {
    flex: 1,
  },
  opportunityMetricLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
  },
  opportunityMetricValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#fff',
  },
  opportunityActions: {
    flexDirection: 'row',
    gap: 8,
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#7CFC00',
    paddingVertical: 10,
    borderRadius: 8,
  },
  approveButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#000',
  },
  rejectButton: {
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
  rejectButtonText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#fff',
  },
  campaignCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  campaignHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  campaignInfo: {
    flex: 1,
  },
  campaignName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 4,
  },
  campaignPlatform: {
    fontSize: 12,
    color: '#00E5FF',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700' as const,
  },
  campaignMetrics: {
    flexDirection: 'row',
    gap: 12,
  },
  campaignMetric: {
    flex: 1,
  },
  campaignMetricLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 4,
  },
  campaignMetricValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#fff',
  },
  actionCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  actionType: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#7CFC00',
    flex: 1,
  },
  actionTime: {
    fontSize: 10,
    color: '#666',
  },
  actionText: {
    fontSize: 13,
    color: '#fff',
    marginBottom: 4,
  },
  actionResult: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  actionImpact: {
    fontSize: 12,
    color: '#7CFC00',
    fontWeight: '600' as const,
  },
});
