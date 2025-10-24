import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Database, Cloud, FileText, Link, ToggleLeft, ToggleRight } from 'lucide-react-native';

export default function DataSources() {
  const insets = useSafeAreaInsets();

  const sources = [
    { id: '1', name: 'Analytics Database', type: 'Database', connected: true, icon: Database },
    { id: '2', name: 'Cloud Storage', type: 'Cloud', connected: true, icon: Cloud },
    { id: '3', name: 'CSV Import', type: 'File', connected: false, icon: FileText },
    { id: '4', name: 'External API', type: 'API', connected: false, icon: Link },
  ];

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>Data Sources</Text>
        <Text style={styles.subtitle}>Connect and manage your data sources</Text>

        <View style={styles.sourcesList}>
          {sources.map((source) => {
            const IconComponent = source.icon;
            return (
              <View key={source.id} style={styles.sourceCard}>
                <View style={styles.sourceHeader}>
                  <IconComponent color="#00E5FF" size={24} />
                  <View style={styles.sourceInfo}>
                    <Text style={styles.sourceName}>{source.name}</Text>
                    <Text style={styles.sourceType}>{source.type}</Text>
                  </View>
                  <TouchableOpacity>
                    {source.connected ? (
                      <ToggleRight color="#10B981" size={32} />
                    ) : (
                      <ToggleLeft color="#666" size={32} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add Data Source</Text>
        </TouchableOpacity>
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
  sourcesList: {
    gap: 12,
    marginBottom: 24,
  },
  sourceCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  sourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  sourceInfo: {
    flex: 1,
  },
  sourceName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 4,
  },
  sourceType: {
    fontSize: 13,
    color: '#666',
  },
  addButton: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00E5FF',
    borderStyle: 'dashed' as const,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#00E5FF',
  },
});
