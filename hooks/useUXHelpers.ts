import { useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// NetInfo is optional - comment out if not installed
// import NetInfo from '@react-native-community/netinfo';

export function useHapticFeedback() {
  const trigger = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
    if (Platform.OS === 'web') return;
    
    try {
      switch (type) {
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    } catch (error) {
      console.log('[Haptics] Not available on this device');
    }
  }, []);

  return { trigger };
}

export function useConfirmation() {
  const confirm = useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
  ) => {
    Alert.alert(
      title,
      message,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: onCancel,
        },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: onConfirm,
        },
      ],
      { cancelable: true }
    );
  }, []);

  return { confirm };
}

export function useOfflineDetection() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const checkConnection = useCallback(async () => {
    setIsChecking(true);
    try {
      // NetInfo check disabled - install @react-native-community/netinfo to enable
      // const state = await NetInfo.fetch();
      // setIsOnline(state.isConnected ?? false);
      // return state.isConnected ?? false;
      
      // Default to online if NetInfo is not available
      setIsOnline(true);
      return true;
    } catch (error) {
      console.error('[Network] Failed to check connection:', error);
      setIsOnline(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  return { isOnline, isChecking, checkConnection };
}

export function useErrorHandler() {
  const handleError = useCallback((error: any, context?: string): string => {
    console.error(`[Error ${context || 'Unknown'}]:`, error);

    if (error?.response?.status === 401) {
      return '🔐 Authentication failed. Please check your API keys and try again.';
    }

    if (error?.response?.status === 403) {
      return '⛔ Access denied. You don\'t have permission to perform this action.';
    }

    if (error?.response?.status === 404) {
      return '🔍 Resource not found. The requested data may have been removed.';
    }

    if (error?.response?.status === 429) {
      return '⏱️ Rate limit exceeded. Please wait a moment and try again.';
    }

    if (error?.response?.status >= 500) {
      return '🔧 Server error occurred. Our team has been notified. Please try again later.';
    }

    if (error?.message?.includes('Network')) {
      return '📡 Network error. Please check your internet connection and try again.';
    }

    if (error?.message?.includes('timeout')) {
      return '⏰ Request timed out. The server is taking too long to respond.';
    }

    if (error?.message) {
      return `❌ ${error.message}`;
    }

    return '⚠️ Something went wrong. Please try again or contact support if the issue persists.';
  }, []);

  return { handleError };
}
