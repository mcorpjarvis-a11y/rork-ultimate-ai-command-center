import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/contexts/AppContext';
import { Bot, TrendingUp, TrendingDown, Activity, Target, Zap, AlertCircle, CheckCircle, Clock, Users, Eye, Heart, MessageCircle, Share2, Star, Trophy, Flame, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react-native';

export default function OverviewDashboard() {
  const { state } = useApp();
  const insets = useSafeAreaInsets();

  const quickStats = [
    { label: 'Active Campaigns', value: '12', change: '+3', trend: 'up', icon: Activity },
    { label: 'Pending Tasks', value: '8', change: '-2', trend: 'down', icon: Clock },
    { label: 'Automation Rules', value: '24', change: '+5', trend: 'up', icon: Zap },
    { label: 'API Calls Today', value: '15.2K', change: '+12%', trend: 'up', icon: Target },
  ];

  const platformMetrics = [
    { platform: 'Instagram', followers: 12500, growth: 8.5, engagement: 6.2, posts: 145 },
    { platform: 'TikTok', followers: 8200, growth: 15.3, engagement: 9.8, posts: 89 },
    { platform: 'YouTube', followers: 4800, growth: 5.2, engagement: 4.1, posts: 32 },
    { platform: 'Twitter', followers: 6300, growth: 3.8, engagement: 2.9, posts: 256 },
  ];

  const contentPerformance = [
    { id: '1', title: 'Summer Collection Launch', views: 24500, likes: 2340, comments: 456, shares: 789, engagement: 15.2 },
    { id: '2', title: 'Behind The Scenes Vlog', views: 18200, likes: 1890, comments: 234, shares: 456, engagement: 14.1 },
    { id: '3', title: 'Product Review: Tech Gadgets', views: 32100, likes: 3120, comments: 678, shares: 1234, engagement: 16.8 },
    { id: '4', title: 'Q&A with Followers', views: 15600, likes: 1560, comments: 890, shares: 234, engagement: 17.2 },
    { id: '5', title: 'Travel Vlog: Tokyo', views: 41200, likes: 4890, comments: 1234, shares: 2345, engagement: 20.5 },
  ];

  const revenueBreakdown = [
    { source: 'Sponsored Posts', amount: 1250, percentage: 50, color: '#00E5FF' },
    { source: 'Affiliate Links', amount: 625, percentage: 25, color: '#7CFC00' },
    { source: 'Digital Products', amount: 420, percentage: 17, color: '#FFD700' },
    { source: 'Ad Revenue', amount: 200, percentage: 8, color: '#FF69B4' },
  ];

  const audienceDemographics = [
    { age: '18-24', percentage: 28, count: 5096 },
    { age: '25-34', percentage: 42, count: 7668 },
    { age: '35-44', percentage: 20, count: 3652 },
    { age: '45+', percentage: 10, count: 1826 },
  ];

  const topLocations = [
    { country: 'United States', percentage: 35, followers: 6390 },
    { country: 'United Kingdom', percentage: 18, followers: 3286 },
    { country: 'Canada', percentage: 12, followers: 2191 },
    { country: 'Australia', percentage: 10, followers: 1826 },
    { country: 'Germany', percentage: 8, followers: 1460 },
    { country: 'Others', percentage: 17, followers: 3105 },
  ];

  const weeklyActivity = [
    { day: 'Mon', posts: 3, engagement: 4.2, reach: 12500 },
    { day: 'Tue', posts: 2, engagement: 3.8, reach: 10200 },
    { day: 'Wed', posts: 4, engagement: 5.1, reach: 15800 },
    { day: 'Thu', posts: 2, engagement: 3.5, reach: 9600 },
    { day: 'Fri', posts: 5, engagement: 6.8, reach: 18900 },
    { day: 'Sat', posts: 3, engagement: 5.5, reach: 16200 },
    { day: 'Sun', posts: 2, engagement: 4.1, reach: 11400 },
  ];

  const bestPostingTimes = [
    { time: '6:00 AM', score: 45 },
    { time: '9:00 AM', score: 62 },
    { time: '12:00 PM', score: 78 },
    { time: '3:00 PM', score: 85 },
    { time: '6:00 PM', score: 95 },
    { time: '9:00 PM', score: 88 },
  ];

  const competitorAnalysis = [
    { name: '@competitor1', followers: 15200, engagement: 5.8, growth: 6.2 },
    { name: '@competitor2', followers: 13800, engagement: 6.4, growth: 4.5 },
    { name: '@competitor3', followers: 18600, engagement: 4.9, growth: 7.8 },
  ];

  const aiRecommendations = [
    { id: '1', priority: 'high', title: 'Optimize posting schedule', description: 'Post 2 hours earlier to capture 15% more engagement based on audience activity patterns.' },
    { id: '2', priority: 'high', title: 'Video content opportunity', description: 'Video posts get 3x more engagement. Increase video content from 20% to 40% of total posts.' },
    { id: '3', priority: 'medium', title: 'Hashtag strategy', description: 'Use 5-7 hashtags instead of 10+ for 22% better reach. Focus on mid-tier hashtags (10K-100K).' },
    { id: '4', priority: 'medium', title: 'Collaboration opportunity', description: '3 similar creators in your niche are gaining traction. Consider collaboration for cross-promotion.' },
    { id: '5', priority: 'low', title: 'Content diversification', description: 'Add carousel posts - they have 1.4x higher save rate which boosts algorithm ranking.' },
  ];

  const upcomingMilestones = [
    { milestone: '20K Followers', current: 18258, target: 20000, daysEstimate: 14 },
    { milestone: '100K Monthly Views', current: 87500, target: 100000, daysEstimate: 8 },
    { milestone: '$3K Monthly Revenue', current: 2495.52, target: 3000, daysEstimate: 21 },
  ];

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Command Center</Text>
        <Text style={styles.subtitle}>Complete overview of your AI influencer empire</Text>

        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, styles.metricPrimary]}>
            <Text style={styles.metricLabel}>Total Followers</Text>
            <Text style={styles.metricValue}>{state.metrics.followers.toLocaleString()}</Text>
            <View style={styles.metricChange}>
              <TrendingUp size={16} color="#10B981" />
              <Text style={styles.metricChangeText}>+8.5% this week</Text>
            </View>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Engagement Rate</Text>
            <Text style={styles.metricValue}>{state.metrics.engagementRate}%</Text>
            <View style={styles.metricChange}>
              <TrendingUp size={16} color="#10B981" />
              <Text style={styles.metricChangeText}>+0.8% vs last month</Text>
            </View>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Monthly Revenue</Text>
            <Text style={styles.metricValue}>${state.metrics.monthlyRevenue.toLocaleString()}</Text>
            <View style={styles.metricChange}>
              <TrendingUp size={16} color="#10B981" />
              <Text style={styles.metricChangeText}>+23.5% growth</Text>
            </View>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Conversion Rate</Text>
            <Text style={styles.metricValue}>{state.metrics.conversionRate}%</Text>
            <View style={styles.metricChange}>
              <TrendingDown size={16} color="#EF4444" />
              <Text style={[styles.metricChangeText, styles.metricChangeNegative]}>-0.3% needs attention</Text>
            </View>
          </View>
        </View>

        <View style={styles.quickStatsRow}>
          {quickStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <View key={index} style={styles.quickStatCard}>
                <IconComponent size={20} color="#00E5FF" />
                <Text style={styles.quickStatValue}>{stat.value}</Text>
                <Text style={styles.quickStatLabel}>{stat.label}</Text>
                <View style={[styles.quickStatBadge, stat.trend === 'up' ? styles.badgeUp : styles.badgeDown]}>
                  {stat.trend === 'up' ? <ArrowUpRight size={12} color="#10B981" /> : <ArrowDownRight size={12} color="#EF4444" />}
                  <Text style={[styles.badgeText, stat.trend === 'up' ? styles.badgeTextUp : styles.badgeTextDown]}>{stat.change}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Platform Performance</Text>
        <View style={styles.platformList}>
          {platformMetrics.map((platform, index) => (
            <View key={index} style={styles.platformCard}>
              <View style={styles.platformHeader}>
                <Text style={styles.platformName}>{platform.platform}</Text>
                <View style={styles.platformBadge}>
                  <Flame size={14} color="#FF6B00" />
                  <Text style={styles.platformGrowth}>+{platform.growth}%</Text>
                </View>
              </View>
              <View style={styles.platformMetrics}>
                <View style={styles.platformMetricItem}>
                  <Users size={16} color="#666" />
                  <Text style={styles.platformMetricValue}>{platform.followers.toLocaleString()}</Text>
                  <Text style={styles.platformMetricLabel}>Followers</Text>
                </View>
                <View style={styles.platformMetricItem}>
                  <Heart size={16} color="#666" />
                  <Text style={styles.platformMetricValue}>{platform.engagement}%</Text>
                  <Text style={styles.platformMetricLabel}>Engagement</Text>
                </View>
                <View style={styles.platformMetricItem}>
                  <Activity size={16} color="#666" />
                  <Text style={styles.platformMetricValue}>{platform.posts}</Text>
                  <Text style={styles.platformMetricLabel}>Posts</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Top Performing Content</Text>
        <View style={styles.contentList}>
          {contentPerformance.map((content, index) => (
            <View key={content.id} style={styles.contentCard}>
              <View style={styles.contentRank}>
                <Trophy size={16} color={index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#666'} />
                <Text style={styles.rankNumber}>#{index + 1}</Text>
              </View>
              <View style={styles.contentInfo}>
                <Text style={styles.contentTitle}>{content.title}</Text>
                <View style={styles.contentStats}>
                  <View style={styles.contentStat}>
                    <Eye size={14} color="#666" />
                    <Text style={styles.contentStatText}>{(content.views / 1000).toFixed(1)}K</Text>
                  </View>
                  <View style={styles.contentStat}>
                    <Heart size={14} color="#666" />
                    <Text style={styles.contentStatText}>{(content.likes / 1000).toFixed(1)}K</Text>
                  </View>
                  <View style={styles.contentStat}>
                    <MessageCircle size={14} color="#666" />
                    <Text style={styles.contentStatText}>{content.comments}</Text>
                  </View>
                  <View style={styles.contentStat}>
                    <Share2 size={14} color="#666" />
                    <Text style={styles.contentStatText}>{content.shares}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.engagementBadge}>
                <Text style={styles.engagementValue}>{content.engagement}%</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.row}>
          <View style={[styles.chartCard, { flex: 1 }]}>
            <Text style={styles.chartTitle}>Audience Growth</Text>
            <View style={styles.chartPlaceholder}>
              {state.chartData.map((point, index) => (
                <View key={point.week} style={styles.chartBar}>
                  <View style={[styles.bar, { height: (point.followers / 200) }]} />
                  <Text style={styles.chartLabel}>{point.week.replace('Week ', 'W')}</Text>
                  <Text style={styles.chartValue}>{(point.followers / 1000).toFixed(1)}K</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.chartCard, { flex: 1 }]}>
            <Text style={styles.chartTitle}>Revenue Sources</Text>
            <View style={styles.revenueChart}>
              {revenueBreakdown.map((item, index) => (
                <View key={index} style={styles.revenueItem}>
                  <View style={[styles.revenueColor, { backgroundColor: item.color }]} />
                  <View style={styles.revenueInfo}>
                    <Text style={styles.revenueName}>{item.source}</Text>
                    <View style={styles.revenueBar}>
                      <View style={[styles.revenueBarFill, { width: `${item.percentage}%`, backgroundColor: item.color }]} />
                    </View>
                  </View>
                  <Text style={styles.revenueAmount}>${item.amount}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.chartCard, { flex: 1 }]}>
            <Text style={styles.chartTitle}>Audience Demographics</Text>
            <View style={styles.demographicsChart}>
              {audienceDemographics.map((demo, index) => (
                <View key={index} style={styles.demoItem}>
                  <Text style={styles.demoAge}>{demo.age}</Text>
                  <View style={styles.demoBar}>
                    <View style={[styles.demoBarFill, { width: `${demo.percentage}%` }]} />
                  </View>
                  <Text style={styles.demoPercentage}>{demo.percentage}%</Text>
                  <Text style={styles.demoCount}>{demo.count.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.chartCard, { flex: 1 }]}>
            <Text style={styles.chartTitle}>Top Locations</Text>
            <View style={styles.locationsList}>
              {topLocations.map((location, index) => (
                <View key={index} style={styles.locationItem}>
                  <View style={styles.locationRank}>
                    <Text style={styles.locationRankText}>{index + 1}</Text>
                  </View>
                  <View style={styles.locationInfo}>
                    <Text style={styles.locationName}>{location.country}</Text>
                    <View style={styles.locationBar}>
                      <View style={[styles.locationBarFill, { width: `${location.percentage}%` }]} />
                    </View>
                  </View>
                  <Text style={styles.locationPercentage}>{location.percentage}%</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Weekly Activity Overview</Text>
        <View style={styles.activityGrid}>
          {weeklyActivity.map((day, index) => (
            <View key={index} style={styles.activityCard}>
              <Text style={styles.activityDay}>{day.day}</Text>
              <View style={styles.activityMetrics}>
                <View style={styles.activityMetric}>
                  <Activity size={14} color="#00E5FF" />
                  <Text style={styles.activityValue}>{day.posts}</Text>
                </View>
                <View style={styles.activityMetric}>
                  <TrendingUp size={14} color="#10B981" />
                  <Text style={styles.activityValue}>{day.engagement}%</Text>
                </View>
                <View style={styles.activityMetric}>
                  <Eye size={14} color="#FFD700" />
                  <Text style={styles.activityValue}>{(day.reach / 1000).toFixed(1)}K</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Optimal Posting Times</Text>
        <View style={styles.timingChart}>
          {bestPostingTimes.map((time, index) => (
            <View key={index} style={styles.timingItem}>
              <View style={styles.timingBar}>
                <View style={[styles.timingBarFill, { height: `${time.score}%` }]} />
              </View>
              <Text style={styles.timingLabel}>{time.time}</Text>
              <View style={[styles.timingBadge, time.score > 80 && styles.timingBadgeHot]}>
                <Text style={styles.timingScore}>{time.score}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Competitor Insights</Text>
        <View style={styles.competitorList}>
          {competitorAnalysis.map((competitor, index) => (
            <View key={index} style={styles.competitorCard}>
              <View style={styles.competitorInfo}>
                <Text style={styles.competitorName}>{competitor.name}</Text>
                <View style={styles.competitorStats}>
                  <View style={styles.competitorStat}>
                    <Users size={14} color="#666" />
                    <Text style={styles.competitorStatValue}>{(competitor.followers / 1000).toFixed(1)}K</Text>
                  </View>
                  <View style={styles.competitorStat}>
                    <Heart size={14} color="#666" />
                    <Text style={styles.competitorStatValue}>{competitor.engagement}%</Text>
                  </View>
                  <View style={styles.competitorStat}>
                    <TrendingUp size={14} color={competitor.growth > state.metrics.engagementRate ? '#EF4444' : '#10B981'} />
                    <Text style={[styles.competitorStatValue, competitor.growth > state.metrics.engagementRate && styles.competitorAhead]}>
                      {competitor.growth}%
                    </Text>
                  </View>
                </View>
              </View>
              {competitor.growth > state.metrics.engagementRate && (
                <View style={styles.competitorWarning}>
                  <AlertCircle size={14} color="#EF4444" />
                </View>
              )}
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>
          <Bot size={20} color="#7CFC00" /> AI-Powered Recommendations
        </Text>
        <View style={styles.recommendationsList}>
          {aiRecommendations.map((rec) => (
            <View key={rec.id} style={[styles.recommendationCard, rec.priority === 'high' ? styles.priorityhigh : rec.priority === 'medium' ? styles.prioritymedium : styles.prioritylow]}>
              <View style={styles.recommendationHeader}>
                <View style={[styles.priorityBadge, rec.priority === 'high' ? styles.priorityBadgehigh : rec.priority === 'medium' ? styles.priorityBadgemedium : styles.priorityBadgelow]}>
                  <Text style={styles.priorityText}>{rec.priority.toUpperCase()}</Text>
                </View>
                <Text style={styles.recommendationTitle}>{rec.title}</Text>
              </View>
              <Text style={styles.recommendationDescription}>{rec.description}</Text>
              <TouchableOpacity style={styles.implementButton}>
                <Text style={styles.implementButtonText}>Implement</Text>
                <ArrowUpRight size={14} color="#00E5FF" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Upcoming Milestones</Text>
        <View style={styles.milestonesList}>
          {upcomingMilestones.map((milestone, index) => {
            const progress = (milestone.current / milestone.target) * 100;
            return (
              <View key={index} style={styles.milestoneCard}>
                <View style={styles.milestoneHeader}>
                  <Star size={20} color="#FFD700" />
                  <Text style={styles.milestoneName}>{milestone.milestone}</Text>
                </View>
                <View style={styles.milestoneProgress}>
                  <View style={styles.milestoneBar}>
                    <View style={[styles.milestoneBarFill, { width: `${progress}%` }]} />
                  </View>
                  <Text style={styles.milestonePercentage}>{progress.toFixed(1)}%</Text>
                </View>
                <View style={styles.milestoneStats}>
                  <Text style={styles.milestoneValue}>
                    {typeof milestone.current === 'number' && milestone.current > 1000
                      ? milestone.current.toLocaleString()
                      : milestone.current}
                  </Text>
                  <Text style={styles.milestoneTarget}> / {milestone.target.toLocaleString()}</Text>
                </View>
                <View style={styles.milestoneEstimate}>
                  <Calendar size={12} color="#666" />
                  <Text style={styles.milestoneEstimateText}>Est. {milestone.daysEstimate} days</Text>
                </View>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Real-Time AI Insights</Text>
        <View style={styles.insightsSection}>
          {state.insights.map((insight) => (
            <View key={insight.id} style={styles.insightCard}>
              <Bot color="#7CFC00" size={20} />
              <View style={styles.insightContent}>
                <Text style={styles.insightText}>{insight.message}</Text>
                <Text style={styles.insightTimestamp}>
                  {new Date(insight.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              <CheckCircle size={16} color="#666" />
            </View>
          ))}
        </View>

        <View style={styles.systemStatus}>
          <Text style={styles.systemStatusTitle}>System Status</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, styles.statusOnline]} />
              <Text style={styles.statusLabel}>AI Engine</Text>
              <Text style={styles.statusValue}>Online</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, styles.statusOnline]} />
              <Text style={styles.statusLabel}>API Services</Text>
              <Text style={styles.statusValue}>Healthy</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, styles.statusOnline]} />
              <Text style={styles.statusLabel}>Automation</Text>
              <Text style={styles.statusValue}>Active</Text>
            </View>
            <View style={styles.statusItem}>
              <View style={[styles.statusIndicator, styles.statusWarning]} />
              <Text style={styles.statusLabel}>Storage</Text>
              <Text style={styles.statusValue}>78% Used</Text>
            </View>
          </View>
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
    padding: 24,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#00E5FF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 24,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginBottom: 32,
  },
  metricCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: '#0a0a0a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  metricPrimary: {
    borderColor: '#00E5FF',
    backgroundColor: '#0a1a1f',
  },
  metricLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#fff',
    marginBottom: 8,
  },
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricChangeText: {
    fontSize: 12,
    color: '#10B981',
  },
  metricChangeNegative: {
    color: '#EF4444',
  },
  quickStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  quickStatCard: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#0a0a0a',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
    marginTop: 8,
  },
  quickStatLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    textAlign: 'center' as const,
  },
  quickStatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeUp: {
    backgroundColor: '#10B98110',
  },
  badgeDown: {
    backgroundColor: '#EF444410',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600' as const,
  },
  badgeTextUp: {
    color: '#10B981',
  },
  badgeTextDown: {
    color: '#EF4444',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#00E5FF',
    marginBottom: 20,
    marginTop: 24,
  },
  platformList: {
    gap: 12,
    marginBottom: 32,
  },
  platformCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  platformHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  platformName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#fff',
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF6B0020',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  platformGrowth: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#FF6B00',
  },
  platformMetrics: {
    flexDirection: 'row',
    gap: 16,
  },
  platformMetricItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  platformMetricValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#fff',
  },
  platformMetricLabel: {
    fontSize: 10,
    color: '#666',
  },
  contentList: {
    gap: 12,
    marginBottom: 32,
  },
  contentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    gap: 12,
  },
  contentRank: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#666',
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 8,
  },
  contentStats: {
    flexDirection: 'row',
    gap: 12,
  },
  contentStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contentStatText: {
    fontSize: 12,
    color: '#888',
  },
  engagementBadge: {
    backgroundColor: '#10B98120',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  engagementValue: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#10B981',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  chartCard: {
    minWidth: 320,
    backgroundColor: '#0a0a0a',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 16,
  },
  chartPlaceholder: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingTop: 20,
    minHeight: 180,
  },
  chartBar: {
    alignItems: 'center',
    gap: 8,
  },
  bar: {
    width: 40,
    backgroundColor: '#00E5FF',
    borderRadius: 4,
    minHeight: 20,
  },
  chartLabel: {
    fontSize: 11,
    color: '#888',
  },
  chartValue: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#fff',
  },
  revenueChart: {
    gap: 12,
  },
  revenueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  revenueColor: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  revenueInfo: {
    flex: 1,
  },
  revenueName: {
    fontSize: 13,
    color: '#ccc',
    marginBottom: 6,
  },
  revenueBar: {
    height: 6,
    backgroundColor: '#1a1a1a',
    borderRadius: 3,
    overflow: 'hidden',
  },
  revenueBarFill: {
    height: '100%',
  },
  revenueAmount: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
  demographicsChart: {
    gap: 12,
  },
  demoItem: {
    gap: 6,
  },
  demoAge: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#fff',
  },
  demoBar: {
    height: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  demoBarFill: {
    height: '100%',
    backgroundColor: '#00E5FF',
  },
  demoPercentage: {
    fontSize: 12,
    color: '#888',
  },
  demoCount: {
    fontSize: 11,
    color: '#666',
  },
  locationsList: {
    gap: 10,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationRankText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#fff',
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 13,
    color: '#fff',
    marginBottom: 4,
  },
  locationBar: {
    height: 4,
    backgroundColor: '#1a1a1a',
    borderRadius: 2,
    overflow: 'hidden',
  },
  locationBarFill: {
    height: '100%',
    backgroundColor: '#7CFC00',
  },
  locationPercentage: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#888',
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 32,
  },
  activityCard: {
    flex: 1,
    minWidth: 90,
    backgroundColor: '#0a0a0a',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  activityDay: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center' as const,
  },
  activityMetrics: {
    gap: 8,
  },
  activityMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activityValue: {
    fontSize: 12,
    color: '#ccc',
  },
  timingChart: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
    padding: 16,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  timingItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  timingBar: {
    width: '100%',
    height: 80,
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  timingBarFill: {
    width: '100%',
    backgroundColor: '#00E5FF',
  },
  timingLabel: {
    fontSize: 10,
    color: '#888',
  },
  timingBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#1a1a1a',
  },
  timingBadgeHot: {
    backgroundColor: '#FFD70030',
  },
  timingScore: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#fff',
  },
  competitorList: {
    gap: 12,
    marginBottom: 32,
  },
  competitorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    gap: 12,
  },
  competitorInfo: {
    flex: 1,
  },
  competitorName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 8,
  },
  competitorStats: {
    flexDirection: 'row',
    gap: 16,
  },
  competitorStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  competitorStatValue: {
    fontSize: 13,
    color: '#888',
  },
  competitorAhead: {
    color: '#EF4444',
  },
  competitorWarning: {
    padding: 8,
  },
  recommendationsList: {
    gap: 12,
    marginBottom: 32,
  },
  recommendationCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  priorityhigh: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  prioritymedium: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  prioritylow: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityBadgehigh: {
    backgroundColor: '#EF444420',
  },
  priorityBadgemedium: {
    backgroundColor: '#F59E0B20',
  },
  priorityBadgelow: {
    backgroundColor: '#10B98120',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#fff',
  },
  recommendationTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
  },
  recommendationDescription: {
    fontSize: 13,
    color: '#888',
    lineHeight: 20,
    marginBottom: 12,
  },
  implementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#00E5FF10',
    padding: 10,
    borderRadius: 8,
  },
  implementButtonText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#00E5FF',
  },
  milestonesList: {
    gap: 12,
    marginBottom: 32,
  },
  milestoneCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  milestoneName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  milestoneProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  milestoneBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  milestoneBarFill: {
    height: '100%',
    backgroundColor: '#FFD700',
  },
  milestonePercentage: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFD700',
  },
  milestoneStats: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  milestoneValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
  },
  milestoneTarget: {
    fontSize: 14,
    color: '#666',
  },
  milestoneEstimate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  milestoneEstimateText: {
    fontSize: 12,
    color: '#666',
  },
  insightsSection: {
    gap: 12,
    marginBottom: 32,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  insightContent: {
    flex: 1,
  },
  insightText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
    marginBottom: 6,
  },
  insightTimestamp: {
    fontSize: 11,
    color: '#666',
  },
  systemStatus: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    marginTop: 16,
  },
  systemStatusTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 16,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusItem: {
    flex: 1,
    minWidth: 140,
    alignItems: 'center',
    gap: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusOnline: {
    backgroundColor: '#10B981',
  },
  statusWarning: {
    backgroundColor: '#F59E0B',
  },
  statusLabel: {
    fontSize: 12,
    color: '#888',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
  },
});
