/**
 * JarvisPermissionsService
 * 
 * Unified permission request service for JARVIS
 * Handles all Expo permissions in one place
 */

import * as Notifications from 'expo-notifications';
import * as Audio from 'expo-audio';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import JarvisLogger from './JarvisLoggerService.js';

export interface PermissionResults {
  notifications: { granted: boolean; status: string };
  audio: { granted: boolean; status: string };
  microphone: { granted: boolean; status: string };
  files: { granted: boolean; available: boolean };
  mediaLibrary: { granted: boolean; status: string };
  location: { granted: boolean; status: string };
  camera: { granted: boolean; status: string };
}

/**
 * Request all permissions needed by JARVIS
 * Non-blocking - continues even if some permissions are denied
 */
export async function requestAllPermissions(): Promise<PermissionResults> {
  JarvisLogger.stage('Permissions', 'Requesting all permissions...');

  const results: PermissionResults = {
    notifications: { granted: false, status: 'unknown' },
    audio: { granted: false, status: 'unknown' },
    microphone: { granted: false, status: 'unknown' },
    files: { granted: false, available: false },
    mediaLibrary: { granted: false, status: 'unknown' },
    location: { granted: false, status: 'unknown' },
    camera: { granted: false, status: 'unknown' },
  };

  try {
    // 1. Notifications permission
    try {
      const notificationResult = await Notifications.requestPermissionsAsync();
      results.notifications.granted = notificationResult.granted;
      results.notifications.status = notificationResult.status;
      
      if (notificationResult.granted) {
        JarvisLogger.success('Notifications permission granted');
      } else {
        JarvisLogger.warn('Notifications permission denied');
      }
    } catch (error) {
      JarvisLogger.warn('Notifications permission request failed:', error);
    }

    // 2. Audio recording permission
    try {
      const audioResult = await Audio.requestRecordingPermissionsAsync();
      results.audio.granted = audioResult.granted;
      results.audio.status = audioResult.status;
      
      if (audioResult.granted) {
        JarvisLogger.success('Audio permission granted');
        
        // Also set audio mode for recording
        await Audio.setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
        });
      } else {
        JarvisLogger.warn('Audio permission denied');
      }
    } catch (error) {
      JarvisLogger.warn('Audio permission request failed:', error);
    }

    // 3. Microphone permission (via Audio Recording)
    // Note: expo-audio already covers microphone access
    results.microphone = results.audio;
    
    // 4. File system access
    try {
      const dirPath = FileSystem.Paths.document?.uri || FileSystem.Paths.cache.uri;
      const fileInfo = await FileSystem.getInfoAsync(dirPath);
      results.files.available = fileInfo.exists;
      results.files.granted = true; // File system is always available on modern Android
      
      if (results.files.available) {
        JarvisLogger.success('File system access available');
      }
    } catch (error) {
      JarvisLogger.warn('File system check failed:', error);
    }

    // 5. Media library permission
    try {
      const mediaResult = await MediaLibrary.requestPermissionsAsync();
      results.mediaLibrary.granted = mediaResult.granted;
      results.mediaLibrary.status = mediaResult.status;
      
      if (mediaResult.granted) {
        JarvisLogger.success('Media library permission granted');
      } else {
        JarvisLogger.warn('Media library permission denied');
      }
    } catch (error) {
      JarvisLogger.warn('Media library permission request failed:', error);
    }

    // 6. Location permission
    try {
      const locationResult = await Location.requestForegroundPermissionsAsync();
      results.location.granted = locationResult.granted;
      results.location.status = locationResult.status;
      
      if (locationResult.granted) {
        JarvisLogger.success('Location permission granted');
      } else {
        JarvisLogger.warn('Location permission denied');
      }
    } catch (error) {
      JarvisLogger.warn('Location permission request failed:', error);
    }

    // 7. Camera permission
    try {
      const cameraResult = await ImagePicker.requestCameraPermissionsAsync();
      results.camera.granted = cameraResult.granted;
      results.camera.status = cameraResult.status;
      
      if (cameraResult.granted) {
        JarvisLogger.success('Camera permission granted');
      } else {
        JarvisLogger.warn('Camera permission denied');
      }
    } catch (error) {
      JarvisLogger.warn('Camera permission request failed:', error);
    }

    // Log summary
    const grantedCount = Object.values(results).filter(r => r.granted).length;
    const totalCount = Object.keys(results).length;
    
    if (grantedCount === totalCount) {
      JarvisLogger.success(`All permissions granted (${grantedCount}/${totalCount})`);
    } else {
      JarvisLogger.warn(`Permissions granted: ${grantedCount}/${totalCount}`);
      JarvisLogger.info('App will continue with limited functionality');
    }

  } catch (error) {
    JarvisLogger.error('Permission request process failed:', error);
  }

  return results;
}

/**
 * Check if critical permissions are granted
 */
export function hasCriticalPermissions(results: PermissionResults): boolean {
  // Critical: Audio (for voice), Notifications, File system
  return results.audio.granted && results.notifications.granted && results.files.granted;
}

/**
 * Get permission status summary
 */
export function getPermissionSummary(results: PermissionResults): string {
  const granted = Object.entries(results).filter(([_, r]) => r.granted).map(([name]) => name);
  const denied = Object.entries(results).filter(([_, r]) => !r.granted).map(([name]) => name);
  
  return `Granted: ${granted.join(', ')}\nDenied: ${denied.join(', ')}`;
}

export default {
  requestAllPermissions,
  hasCriticalPermissions,
  getPermissionSummary,
};
