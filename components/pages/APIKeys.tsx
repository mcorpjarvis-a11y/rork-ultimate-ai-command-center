import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import APIKeyManager from '@/components/APIKeyManager';

export default function APIKeys() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>🔑 API Keys</Text>
        <Text style={styles.subtitle}>Plug & Play - Add your API keys and connect instantly</Text>
      </View>
      
      <APIKeyManager
        onKeysUpdated={() => {
          console.log('[APIKeys] Keys updated, services will use new keys automatically');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    padding: 20,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00f2ff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
});
