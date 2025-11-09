/**
 * PermissionManager - Request all Android permissions after login
 * Iron Man themed UI with progress tracking
 * Android only - NO iOS support
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Camera,
  Mic,
  MapPin,
  Bluetooth,
  Wifi,
  HardDrive,
  Bell,
  Users,
  Calendar,
  Phone,
  Activity,
  Radio,
  Smartphone,
} from 'lucide-react-native';

interface Permission {
  id: string;
  name: string;
  description: string;
  icon: any;
  androidPermission: string;
  isCritical: boolean;
  status: 'pending' | 'granted' | 'denied';
}

export default function PermissionManager() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: 'camera',
      name: 'Camera',
      description: 'Take photos and videos for AI analysis, QR scanning, and visual tasks',
      icon: Camera,
      androidPermission: PermissionsAndroid.PERMISSIONS.CAMERA,
      isCritical: true,
      status: 'pending',
    },
    {
      id: 'microphone',
      name: 'Microphone',
      description: 'Voice commands, speech recognition, and audio recording for JARVIS',
      icon: Mic,
      androidPermission: PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      isCritical: true,
      status: 'pending',
    },
    {
      id: 'location_fine',
      name: 'Precise Location',
      description: 'Location-based automation, weather, and smart home control',
      icon: MapPin,
      androidPermission: PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      isCritical: true,
      status: 'pending',
    },
    {
      id: 'location_coarse',
      name: 'Approximate Location',
      description: 'General location for region-specific features',
      icon: MapPin,
      androidPermission: PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      isCritical: false,
      status: 'pending',
    },
    {
      id: 'bluetooth',
      name: 'Bluetooth',
      description: 'Connect to Bluetooth devices, speakers, and IoT gadgets',
      icon: Bluetooth,
      androidPermission: PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      isCritical: false,
      status: 'pending',
    },
    {
      id: 'bluetooth_scan',
      name: 'Bluetooth Scanning',
      description: 'Discover nearby Bluetooth devices',
      icon: Bluetooth,
      androidPermission: PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      isCritical: false,
      status: 'pending',
    },
    {
      id: 'wifi',
      name: 'Wi-Fi State',
      description: 'Monitor Wi-Fi connections for network-based automation',
      icon: Wifi,
      androidPermission: PermissionsAndroid.PERMISSIONS.ACCESS_WIFI_STATE,
      isCritical: false,
      status: 'pending',
    },
    {
      id: 'storage',
      name: 'Storage',
      description: 'Read and write files, save media, and backup data',
      icon: HardDrive,
      androidPermission: PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      isCritical: true,
      status: 'pending',
    },
    {
      id: 'storage_write',
      name: 'Write Storage',
      description: 'Save files and media to device storage',
      icon: HardDrive,
      androidPermission: PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      isCritical: true,
      status: 'pending',
    },
    {
      id: 'notifications',
      name: 'Notifications',
      description: 'Receive alerts, reminders, and important updates from JARVIS',
      icon: Bell,
      androidPermission: PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      isCritical: true,
      status: 'pending',
    },
    {
      id: 'contacts',
      name: 'Contacts',
      description: 'Access contacts for smart dialing and messaging',
      icon: Users,
      androidPermission: PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      isCritical: false,
      status: 'pending',
    },
    {
      id: 'calendar',
      name: 'Calendar',
      description: 'Manage events, set reminders, and schedule automation',
      icon: Calendar,
      androidPermission: PermissionsAndroid.PERMISSIONS.READ_CALENDAR,
      isCritical: false,
      status: 'pending',
    },
    {
      id: 'phone',
      name: 'Phone State',
      description: 'Monitor calls for call-related automation',
      icon: Phone,
      androidPermission: PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
      isCritical: false,
      status: 'pending',
    },
    {
      id: 'body_sensors',
      name: 'Body Sensors',
      description: 'Access health data from wearables and fitness trackers',
      icon: Activity,
      androidPermission: PermissionsAndroid.PERMISSIONS.BODY_SENSORS,
      isCritical: false,
      status: 'pending',
    },
    {
      id: 'activity',
      name: 'Physical Activity',
      description: 'Track steps, activity, and fitness metrics',
      icon: Activity,
      androidPermission: PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
      isCritical: false,
      status: 'pending',
    },
    {
      id: 'nearby',
      name: 'Nearby Devices',
      description: 'Discover and connect to nearby devices',
      icon: Radio,
      androidPermission: PermissionsAndroid.PERMISSIONS.NEARBY_WIFI_DEVICES,
      isCritical: false,
      status: 'pending',
    },
  ]);

  useEffect(() => {
    checkAndRequestPermissions();
  }, []);

  const checkAndRequestPermissions = async () => {
    if (Platform.OS !== 'android') {
      console.log('[PermissionManager] Not Android platform, skipping');
      return;
    }

    // First check existing permissions
    const updatedPermissions = await Promise.all(
      permissions.map(async (perm) => {
        try {
          const granted = await PermissionsAndroid.check(perm.androidPermission);
          return {
            ...perm,
            status: granted ? 'granted' : 'pending',
          } as Permission;
        } catch (error) {
          console.error(`Error checking permission ${perm.id}:`, error);
          return perm;
        }
      })
    );

    setPermissions(updatedPermissions);

    // Then automatically request all pending permissions
    const hasPending = updatedPermissions.some(p => p.status === 'pending');
    if (hasPending) {
      console.log('[PermissionManager] Auto-requesting permissions...');
      setTimeout(() => {
        requestAllPermissions();
      }, 800); // Small delay for UI to render
    }
  };

  const requestPermission = async (permission: Permission) => {
    if (Platform.OS !== 'android') {
      Alert.alert('Not Supported', 'Permissions are only available on Android');
      return;
    }

    try {
      const result = await PermissionsAndroid.request(permission.androidPermission, {
        title: `${permission.name} Permission`,
        message: permission.description,
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      });

      const newStatus = result === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied';

      setPermissions((prev) =>
        prev.map((p) =>
          p.id === permission.id ? { ...p, status: newStatus } : p
        )
      );

      if (newStatus === 'denied') {
        Alert.alert(
          'Permission Denied',
          `${permission.name} permission was denied. Some features may not work properly.`
        );
      }
    } catch (error) {
      console.error(`Error requesting permission ${permission.id}:`, error);
      Alert.alert('Error', 'Failed to request permission. Please try again.');
    }
  };

  const requestAllPermissions = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert('Not Supported', 'Permissions are only available on Android');
      return;
    }

    setLoading(true);

    try {
      // Request all permissions in batch
      const permissionsToRequest = permissions
        .filter((p) => p.status === 'pending')
        .map((p) => p.androidPermission);

      const results = await PermissionsAndroid.requestMultiple(permissionsToRequest);

      setPermissions((prev) =>
        prev.map((p) => {
          const result = results[p.androidPermission];
          if (result) {
            return {
              ...p,
              status: result === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied',
            };
          }
          return p;
        })
      );

      Alert.alert(
        'Permissions Updated',
        'Permission requests completed. You can continue to the next step.'
      );
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request permissions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    const criticalPermissions = permissions.filter((p) => p.isCritical);
    const grantedCritical = criticalPermissions.filter((p) => p.status === 'granted');

    if (grantedCritical.length < criticalPermissions.length) {
      Alert.alert(
        'Critical Permissions Required',
        `Please grant all critical permissions to continue. Granted: ${grantedCritical.length}/${criticalPermissions.length}`,
        [
          { text: 'Request Again', onPress: requestAllPermissions },
          { text: 'Skip', onPress: () => router.replace('/onboarding/oauth-setup'), style: 'cancel' },
        ]
      );
      return;
    }

    router.replace('/onboarding/oauth-setup');
  };

  const getProgress = () => {
    const granted = permissions.filter((p) => p.status === 'granted').length;
    const total = permissions.length;
    return { granted, total, percentage: Math.round((granted / total) * 100) };
  };

  const progress = getProgress();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>System Permissions</Text>
          <Text style={styles.subtitle}>
            Grant JARVIS access to device features for optimal functionality
          </Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress.percentage}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {progress.granted} of {progress.total} permissions granted ({progress.percentage}%)
            </Text>
          </View>
        </View>

        <View style={styles.permissionsList}>
          {permissions.map((permission) => {
            const IconComponent = permission.icon;
            const isGranted = permission.status === 'granted';
            const isDenied = permission.status === 'denied';

            return (
              <TouchableOpacity
                key={permission.id}
                style={[
                  styles.permissionCard,
                  isGranted && styles.permissionGranted,
                  isDenied && styles.permissionDenied,
                ]}
                onPress={() => requestPermission(permission)}
                disabled={isGranted}
              >
                <View style={styles.permissionHeader}>
                  <View style={styles.permissionIcon}>
                    <IconComponent
                      size={24}
                      color={isGranted ? '#00f2ff' : isDenied ? '#ff4444' : '#666'}
                    />
                  </View>
                  <View style={styles.permissionInfo}>
                    <View style={styles.permissionTitleRow}>
                      <Text style={styles.permissionName}>{permission.name}</Text>
                      {permission.isCritical && (
                        <View style={styles.criticalBadge}>
                          <Text style={styles.criticalText}>CRITICAL</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.permissionDescription}>
                      {permission.description}
                    </Text>
                  </View>
                </View>

                <View style={styles.permissionStatus}>
                  {isGranted ? (
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusGranted}>✅ Granted</Text>
                    </View>
                  ) : isDenied ? (
                    <View style={[styles.statusBadge, styles.statusBadgeDenied]}>
                      <Text style={styles.statusDenied}>❌ Denied</Text>
                    </View>
                  ) : (
                    <View style={[styles.statusBadge, styles.statusBadgePending]}>
                      <Text style={styles.statusPending}>⚪ Tap to Grant</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.requestAllButton]}
            onPress={requestAllPermissions}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.requestAllButtonText}>Request All Permissions</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.continueButton]}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>Continue to OAuth Setup →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.skipButton]}
            onPress={() => router.replace('/onboarding/oauth-setup')}
          >
            <Text style={styles.skipButtonText}>Skip for Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#00f2ff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    lineHeight: 24,
    marginBottom: 24,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00f2ff',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#00f2ff',
    marginTop: 8,
    textAlign: 'center',
  },
  permissionsList: {
    padding: 16,
  },
  permissionCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  permissionGranted: {
    borderColor: '#00f2ff',
    backgroundColor: '#001a1f',
  },
  permissionDenied: {
    borderColor: '#ff4444',
    backgroundColor: '#1f0000',
  },
  permissionHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  permissionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  permissionInfo: {
    flex: 1,
  },
  permissionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  permissionName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginRight: 8,
  },
  criticalBadge: {
    backgroundColor: '#ff440020',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  criticalText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ff4444',
  },
  permissionDescription: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  permissionStatus: {
    marginTop: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#00f2ff20',
  },
  statusBadgeDenied: {
    backgroundColor: '#ff444420',
  },
  statusBadgePending: {
    backgroundColor: '#33333320',
  },
  statusGranted: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00f2ff',
  },
  statusDenied: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ff4444',
  },
  statusPending: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
  },
  footer: {
    padding: 24,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  requestAllButton: {
    backgroundColor: '#00f2ff',
  },
  requestAllButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  continueButton: {
    backgroundColor: '#00f2ff',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888',
  },
});
