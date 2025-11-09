import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, Mail, Globe, MapPin, Calendar, Link2 } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import MasterProfile from '@/services/auth/MasterProfile';
import { MasterProfile as MasterProfileType } from '@/services/auth/types';

export default function Profiles() {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<MasterProfileType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const masterProfile = await MasterProfile.getMasterProfile();
      setProfile(masterProfile);
    } catch (error) {
      console.error('[Profiles] Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00E5FF" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.emptyContainer}>
          <User color="#666" size={64} />
          <Text style={styles.emptyText}>No profile found</Text>
          <Text style={styles.emptySubtext}>Please sign in to view your profile</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>My Profile</Text>
        <Text style={styles.subtitle}>Your account information</Text>

        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarPlaceholder}>
              {profile.avatar ? (
                <Text style={styles.avatarText}>{profile.name?.charAt(0).toUpperCase() || 'U'}</Text>
              ) : (
                <User color="#00E5FF" size={40} />
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{profile.name || 'User'}</Text>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>ACTIVE</Text>
              </View>
            </View>
          </View>

          <View style={styles.profileDetails}>
            {profile.email && (
              <View style={styles.detailRow}>
                <Mail color="#888" size={18} />
                <Text style={styles.detailText}>{profile.email}</Text>
              </View>
            )}
            
            {profile.createdAt && (
              <View style={styles.detailRow}>
                <Calendar color="#888" size={18} />
                <Text style={styles.detailText}>
                  Joined {new Date(profile.createdAt).toLocaleDateString()}
                </Text>
              </View>
            )}

            {profile.connectedProviders && profile.connectedProviders.length > 0 && (
              <View style={styles.detailRow}>
                <Link2 color="#888" size={18} />
                <Text style={styles.detailText}>
                  {profile.connectedProviders.length} connected account{profile.connectedProviders.length !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>

          {profile.connectedProviders && profile.connectedProviders.length > 0 && (
            <View style={styles.connectedProviders}>
              <Text style={styles.sectionLabel}>Connected Accounts</Text>
              <View style={styles.providersList}>
                {profile.connectedProviders.map((provider) => (
                  <View key={provider} style={styles.providerBadge}>
                    <Text style={styles.providerBadgeText}>{provider}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Profile ID</Text>
          <Text style={styles.infoValue}>{profile.id}</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
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
  profileCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#00E5FF',
    marginBottom: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00E5FF',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#00E5FF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: '#fff',
    marginBottom: 8,
  },
  activeBadge: {
    alignSelf: 'flex-start' as const,
    backgroundColor: '#00E5FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#000',
    letterSpacing: 0.5,
  },
  profileDetails: {
    gap: 14,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 15,
    color: '#ccc',
  },
  connectedProviders: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  providersList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  providerBadge: {
    backgroundColor: '#111',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#333',
  },
  providerBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00E5FF',
    textTransform: 'capitalize',
  },
  infoCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 13,
    color: '#ccc',
    fontFamily: 'monospace',
  },
});
