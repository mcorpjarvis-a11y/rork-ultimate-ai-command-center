
// --- Runtime permission requests for Jarvis ---
import { useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';

useEffect(() => {
  async function requestPermissions() {
    if (Platform.OS === 'android') {
      const perms = [
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        PermissionsAndroid.PERMISSIONS.BODY_SENSORS
      ];
      for (const perm of perms) {
        try {
          const result = await PermissionsAndroid.request(perm);
          console.log(`Permission ${perm}:`, result);
        } catch (err) {
          console.warn('Permission error:', err);
        }
      }
    }
  }

  requestPermissions();
}, []);
