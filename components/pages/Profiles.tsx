import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, Mail, Globe, MapPin } from 'lucide-react-native';

export default function Profiles() {
  const insets = useSafeAreaInsets();

  const profiles = [
    {
      id: '1',
      name: 'Main Profile',
      email: 'influencer@example.com',
      location: 'Los Angeles, CA',
      website: 'myinfluencer.com',
      active: true,
    },
    {
      id: '2',
      name: 'Business Profile',
      email: 'business@example.com',
      location: 'New York, NY',
      website: 'business.com',
      active: false,
    },
  ];

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>Profiles</Text>
        <Text style={styles.subtitle}>Manage your influencer profiles</Text>

        <View style={styles.profilesList}>
          {profiles.map((profile) => (
            <View key={profile.id} style={[styles.profileCard, profile.active && styles.activeProfile]}>
              <View style={styles.profileHeader}>
                <View style={styles.avatarPlaceholder}>
                  <User color="#00E5FF" size={32} />
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{profile.name}</Text>
                  {profile.active && (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>ACTIVE</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.profileDetails}>
                <View style={styles.detailRow}>
                  <Mail color="#888" size={16} />
                  <Text style={styles.detailText}>{profile.email}</Text>
                </View>
                <View style={styles.detailRow}>
                  <MapPin color="#888" size={16} />
                  <Text style={styles.detailText}>{profile.location}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Globe color="#888" size={16} />
                  <Text style={styles.detailText}>{profile.website}</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add New Profile</Text>
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
  profilesList: {
    gap: 16,
    marginBottom: 24,
  },
  profileCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  activeProfile: {
    borderColor: '#00E5FF',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 4,
  },
  activeBadge: {
    alignSelf: 'flex-start' as const,
    backgroundColor: '#00E5FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#000',
  },
  profileDetails: {
    gap: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#ccc',
  },
  editButton: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#00E5FF',
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
