import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/contexts/AppContext';
import { BarChart3, TrendingUp, Users, Eye } from 'lucide-react-native';

export default function Analytics() {
  const { state } = useApp();
  const insets = useSafeAreaInsets();

  const metrics = [
    { id: '1', label: 'Total Views', value: '124.5K', change: '+12.5%', icon: Eye },
    { id: '2', label: 'Reach', value: '89.2K', change: '+8.3%', icon: Users },
    { id: '3', label: 'Impressions', value: '245.8K', change: '+15.7%', icon: BarChart3 },
    { id: '4', label: 'Growth Rate', value: '5.3%', change: '+2.1%', icon: TrendingUp },
  ];

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>Analytics Dashboard</Text>
        <Text style={styles.subtitle}>Comprehensive performance analytics</Text>

        <View style={styles.metricsGrid}>
          {metrics.map((metric) => {
            const IconComponent = metric.icon;
            return (
              <View key={metric.id} style={styles.metricCard}>
                <IconComponent color="#00E5FF" size={24} />
                <Text style={styles.metricValue}>{metric.value}</Text>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <Text style={styles.metricChange}>{metric.change}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Engagement Over Time</Text>
          <View style={styles.chartContainer}>
            {state.chartData.map((point, index) => (
              <View key={point.week} style={styles.chartColumn}>
                <View style={styles.bar}>
                  <View style={[styles.barFill, { height: `${(point.engagement / 6) * 100}%` }]} />
                </View>
                <Text style={styles.chartLabel}>{point.week.replace('Week ', 'W')}</Text>
                <Text style={styles.chartValue}>{point.engagement}%</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.topPerformers}>
          <Text style={styles.sectionTitle}>Top Performing Content</Text>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.performerCard}>
              <View style={styles.performerRank}>
                <Text style={styles.rankNumber}>{i}</Text>
              </View>
              <View style={styles.performerInfo}>
                <Text style={styles.performerTitle}>Content Post #{i}</Text>
                <Text style={styles.performerStats}>15.2K views • 890 engagements</Text>
              </View>
              <Text style={styles.performerScore}>{95 - i * 10}%</Text>
            </View>
          ))}
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#fff',
    marginTop: 12,
  },
  metricLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  metricChange: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 4,
    fontWeight: '600' as const,
  },
  chartSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    gap: 16,
    alignItems: 'flex-end',
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  bar: {
    width: '100%',
    height: 100,
    backgroundColor: '#111',
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#00E5FF',
  },
  chartLabel: {
    fontSize: 11,
    color: '#888',
  },
  chartValue: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600' as const,
  },
  topPerformers: {
    marginTop: 8,
  },
  performerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    gap: 16,
  },
  performerRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00E5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#000',
  },
  performerInfo: {
    flex: 1,
  },
  performerTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 4,
  },
  performerStats: {
    fontSize: 12,
    color: '#888',
  },
  performerScore: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#10B981',
  },
});
