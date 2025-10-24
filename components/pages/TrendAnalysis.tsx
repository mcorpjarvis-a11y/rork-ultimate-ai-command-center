import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';

export default function TrendAnalysis() {
  const insets = useSafeAreaInsets();

  const trends = [
    { id: '1', topic: 'AI Tools & Automation', change: 15.3, direction: 'up', volume: '12.4M' },
    { id: '2', topic: 'Short-Form Video', change: 8.7, direction: 'up', volume: '8.2M' },
    { id: '3', topic: 'Sustainable Living', change: -2.1, direction: 'down', volume: '5.1M' },
    { id: '4', topic: 'Personal Finance', change: 12.4, direction: 'up', volume: '7.8M' },
    { id: '5', topic: 'Mental Health', change: 0, direction: 'neutral', volume: '6.5M' },
  ];

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return <TrendingUp color="#10B981" size={20} />;
      case 'down':
        return <TrendingDown color="#EF4444" size={20} />;
      default:
        return <Minus color="#888" size={20} />;
    }
  };

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up':
        return '#10B981';
      case 'down':
        return '#EF4444';
      default:
        return '#888';
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>Trend Analysis</Text>
        <Text style={styles.subtitle}>Real-time trend monitoring and insights</Text>

        <View style={styles.trendsContainer}>
          {trends.map((trend) => (
            <View key={trend.id} style={styles.trendCard}>
              <View style={styles.trendHeader}>
                {getTrendIcon(trend.direction)}
                <Text style={styles.trendTopic}>{trend.topic}</Text>
              </View>
              <View style={styles.trendStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Change</Text>
                  <Text style={[styles.statValue, { color: getTrendColor(trend.direction) }]}>
                    {trend.change > 0 ? '+' : ''}{trend.change}%
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Volume</Text>
                  <Text style={styles.statValue}>{trend.volume}</Text>
                </View>
              </View>
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
  trendsContainer: {
    gap: 12,
  },
  trendCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  trendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  trendTopic: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
    flex: 1,
  },
  trendStats: {
    flexDirection: 'row',
    gap: 24,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#fff',
  },
});
