import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';

export default function Validator() {
  const insets = useSafeAreaInsets();

  const validations = [
    { id: '1', name: 'API Connections', status: 'pass', message: 'All APIs responding normally' },
    { id: '2', name: 'Data Integrity', status: 'pass', message: 'Database consistency verified' },
    { id: '3', name: 'AI Models', status: 'warning', message: 'Model performance 5% below baseline' },
    { id: '4', name: 'Social Accounts', status: 'pass', message: '2 of 3 accounts connected' },
    { id: '5', name: 'Scheduled Tasks', status: 'pass', message: 'All tasks executing on schedule' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle color="#10B981" size={20} />;
      case 'fail':
        return <XCircle color="#EF4444" size={20} />;
      case 'warning':
        return <AlertCircle color="#F59E0B" size={20} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>System Validator</Text>
        <Text style={styles.subtitle}>Validate system health and configuration</Text>

        <TouchableOpacity style={styles.runButton}>
          <Text style={styles.runButtonText}>Run Full Validation</Text>
        </TouchableOpacity>

        <View style={styles.validationsContainer}>
          {validations.map((validation) => (
            <View key={validation.id} style={styles.validationCard}>
              <View style={styles.validationHeader}>
                {getStatusIcon(validation.status)}
                <Text style={styles.validationName}>{validation.name}</Text>
              </View>
              <Text style={styles.validationMessage}>{validation.message}</Text>
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
  runButton: {
    backgroundColor: '#00E5FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  runButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#000',
  },
  validationsContainer: {
    gap: 12,
  },
  validationCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  validationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  validationName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
    flex: 1,
  },
  validationMessage: {
    fontSize: 14,
    color: '#888',
    marginLeft: 32,
  },
});
