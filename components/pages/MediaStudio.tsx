import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Video, Image, Film, Upload } from 'lucide-react-native';

export default function MediaStudio() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>Media Studio</Text>
        <Text style={styles.subtitle}>Edit and manage your media assets</Text>

        <View style={styles.toolsGrid}>
          <TouchableOpacity style={styles.toolCard}>
            <Video color="#00E5FF" size={32} />
            <Text style={styles.toolName}>Video Editor</Text>
            <Text style={styles.toolDescription}>Edit and enhance videos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolCard}>
            <Image color="#00E5FF" size={32} />
            <Text style={styles.toolName}>Image Editor</Text>
            <Text style={styles.toolDescription}>Enhance and modify images</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolCard}>
            <Film color="#00E5FF" size={32} />
            <Text style={styles.toolName}>Animation</Text>
            <Text style={styles.toolDescription}>Create animated content</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.toolCard}>
            <Upload color="#00E5FF" size={32} />
            <Text style={styles.toolName}>Upload</Text>
            <Text style={styles.toolDescription}>Import your media</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Media Library</Text>
        <View style={styles.libraryGrid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={styles.libraryCard}>
              <View style={styles.libraryPlaceholder}>
                <Image color="#333" size={30} />
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
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  toolCard: {
    width: '48%',
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    alignItems: 'center',
    minHeight: 140,
  },
  toolName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
    marginTop: 12,
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center' as const,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 16,
  },
  libraryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  libraryCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  libraryPlaceholder: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
