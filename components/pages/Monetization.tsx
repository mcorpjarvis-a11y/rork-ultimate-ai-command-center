import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '@/contexts/AppContext';
import { DollarSign, TrendingUp, CreditCard, PieChart } from 'lucide-react-native';

export default function Monetization() {
  const { state } = useApp();
  const insets = useSafeAreaInsets();

  const revenueStreams = [
    { id: '1', name: 'Brand Sponsorships', amount: 1250.00, percentage: 50 },
    { id: '2', name: 'Affiliate Marketing', amount: 625.26, percentage: 25 },
    { id: '3', name: 'Digital Products', amount: 420.16, percentage: 17 },
    { id: '4', name: 'Ad Revenue', amount: 200.10, percentage: 8 },
  ];

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>Monetization</Text>
        <Text style={styles.subtitle}>Track and optimize your revenue streams</Text>

        <View style={styles.revenueCard}>
          <View style={styles.revenueHeader}>
            <DollarSign color="#10B981" size={32} />
            <View style={styles.revenueInfo}>
              <Text style={styles.revenueLabel}>Monthly Revenue</Text>
              <Text style={styles.revenueValue}>
                ${state.metrics.monthlyRevenue.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <TrendingUp color="#00E5FF" size={24} />
            <Text style={styles.statValue}>+23.5%</Text>
            <Text style={styles.statLabel}>Growth</Text>
          </View>
          <View style={styles.statCard}>
            <CreditCard color="#00E5FF" size={24} />
            <Text style={styles.statValue}>42</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </View>
          <View style={styles.statCard}>
            <PieChart color="#00E5FF" size={24} />
            <Text style={styles.statValue}>4</Text>
            <Text style={styles.statLabel}>Sources</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Revenue Streams</Text>
        <View style={styles.streamsList}>
          {revenueStreams.map((stream) => (
            <View key={stream.id} style={styles.streamCard}>
              <View style={styles.streamInfo}>
                <Text style={styles.streamName}>{stream.name}</Text>
                <Text style={styles.streamAmount}>${stream.amount.toFixed(2)}</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${stream.percentage}%` }]} />
              </View>
              <Text style={styles.streamPercentage}>{stream.percentage}% of total</Text>
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
  revenueCard: {
    backgroundColor: '#0a1a0f',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#10B981',
    marginBottom: 24,
  },
  revenueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  revenueInfo: {
    flex: 1,
  },
  revenueLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  revenueValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#10B981',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 16,
  },
  streamsList: {
    gap: 12,
  },
  streamCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  streamInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  streamName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  streamAmount: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#10B981',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#1a1a1a',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00E5FF',
  },
  streamPercentage: {
    fontSize: 12,
    color: '#666',
  },
});
