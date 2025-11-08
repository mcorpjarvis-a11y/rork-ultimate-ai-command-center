/**
 * SignInScreen - First-launch onboarding screen
 * Google Sign-In creates the Master Profile
 * Android/Expo/Termux only - NO iOS support
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AuthManager from '@/services/auth/AuthManager';
import MasterProfile from '@/services/auth/MasterProfile';
import { MasterProfile as MasterProfileType } from '@/services/auth/types';

export default function SignInScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    checkExistingProfile();
  }, []);

  const checkExistingProfile = async () => {
    try {
      const profile = await MasterProfile.getMasterProfile();
      
      if (profile) {
        // Profile already exists, navigate to dashboard
        console.log('[SignInScreen] Existing profile found, navigating to dashboard');
        router.replace('/');
      }
    } catch (error) {
      console.error('[SignInScreen] Error checking profile:', error);
    } finally {
      setCheckingProfile(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      console.log('[SignInScreen] Starting Google Sign-In');

      // Start Google OAuth flow
      const success = await AuthManager.startAuthFlow('google');

      if (!success) {
        Alert.alert('Sign In Failed', 'Could not sign in with Google. Please try again.');
        return;
      }

      // Get the Google token to extract profile info
      const googleToken = await AuthManager.getAccessToken('google');
      
      if (!googleToken) {
        Alert.alert('Error', 'Could not retrieve authentication token.');
        return;
      }

      // Fetch user profile from Google
      const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${googleToken}`,
        },
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const googleProfile = await profileResponse.json();

      // Create master profile
      const masterProfile: MasterProfileType = {
        id: googleProfile.id,
        email: googleProfile.email,
        name: googleProfile.name,
        avatar: googleProfile.picture,
        createdAt: new Date().toISOString(),
        connectedProviders: ['google'],
      };

      await MasterProfile.saveMasterProfile(masterProfile);

      console.log('[SignInScreen] Master profile created successfully');

      // Navigate to dashboard
      router.replace('/');
      
      Alert.alert(
        'Welcome!',
        `Signed in as ${googleProfile.name || googleProfile.email}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('[SignInScreen] Sign-in error:', error);
      Alert.alert(
        'Error',
        'An error occurred during sign-in. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Sign In?',
      'You can sign in later from the settings, but some features may be limited.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          onPress: async () => {
            // Create a minimal anonymous profile
            const anonymousProfile: MasterProfileType = {
              id: `anon_${Date.now()}`,
              createdAt: new Date().toISOString(),
              connectedProviders: [],
            };
            
            await MasterProfile.saveMasterProfile(anonymousProfile);
            router.replace('/');
          },
        },
      ]
    );
  };

  if (checkingProfile) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to</Text>
          <Text style={styles.appName}>RORK AI Command Center</Text>
          <Text style={styles.subtitle}>
            Your unified hub for AI services and smart home control
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🤖</Text>
            <Text style={styles.featureText}>Connect AI services</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🏠</Text>
            <Text style={styles.featureText}>Control smart home devices</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🔐</Text>
            <Text style={styles.featureText}>Secure on-device storage</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📱</Text>
            <Text style={styles.featureText}>Android & Termux support</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.googleButton]}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.buttonText}>Sign in with Google</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.skipButton]}
            onPress={handleSkip}
            disabled={loading}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.disclaimer}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
          All data is stored securely on your device.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    color: '#6b7280',
    marginBottom: 4,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  features: {
    marginBottom: 40,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
  },
  actions: {
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
  },
  googleButton: {
    backgroundColor: '#3b82f6',
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginRight: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  disclaimer: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
  },
});
