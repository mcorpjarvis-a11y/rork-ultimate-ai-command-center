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
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import AuthManager from '@/services/auth/AuthManager';
import MasterProfile from '@/services/auth/MasterProfile';
import EmailAuthService from '@/services/auth/EmailAuthService';
import { MasterProfile as MasterProfileType } from '@/services/auth/types';

export default function SignInScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [authMode, setAuthMode] = useState<'email' | 'google'>('email');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    checkExistingProfile();
  }, []);

  const checkExistingProfile = async () => {
    try {
      const profile = await MasterProfile.getMasterProfile();
      
      if (profile) {
        // Profile exists - let _layout.tsx handle routing based on onboarding status
        console.log('[SignInScreen] Existing profile found, redirecting to app');
        router.replace('/');
      }
    } catch (error) {
      console.error('[SignInScreen] Error checking profile:', error);
    } finally {
      setCheckingProfile(false);
    }
  };

  const handleEmailAuth = async () => {
    try {
      setLoading(true);

      // Validate inputs
      if (!email.trim() || !password.trim()) {
        Alert.alert('Error', 'Please enter email and password');
        return;
      }

      if (isSignUp && !name.trim()) {
        Alert.alert('Error', 'Please enter your name');
        return;
      }

      if (isSignUp) {
        // Sign up
        console.log('[SignInScreen] Starting email sign-up');
        await EmailAuthService.signUp({
          email: email.trim(),
          password,
          name: name.trim(),
        });

        // Create master profile
        const masterProfile: MasterProfileType = {
          id: `user_${Date.now()}`,
          email: email.trim(),
          name: name.trim(),
          createdAt: new Date().toISOString(),
          connectedProviders: [],
        };

        await MasterProfile.saveMasterProfile(masterProfile);

        console.log('[SignInScreen] Master profile created successfully');
        router.replace('/onboarding/permissions');
        
        Alert.alert(
          'Welcome!',
          `Account created for ${email}. Let's set up your permissions.`,
          [{ text: 'OK' }]
        );
      } else {
        // Sign in
        console.log('[SignInScreen] Starting email sign-in');
        await EmailAuthService.signIn({
          email: email.trim(),
          password,
        });

        // Get or create master profile
        let masterProfile = await MasterProfile.getMasterProfile();
        
        if (!masterProfile) {
          // Create profile if it doesn't exist
          masterProfile = {
            id: `user_${Date.now()}`,
            email: email.trim(),
            name: name.trim() || 'User',
            createdAt: new Date().toISOString(),
            connectedProviders: [],
          };
          await MasterProfile.saveMasterProfile(masterProfile);
        }

        console.log('[SignInScreen] Sign-in successful, redirecting to app');
        // Let _layout.tsx handle routing based on onboarding status
        router.replace('/');
        
        Alert.alert(
          'Welcome Back!',
          `Signed in as ${email}.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('[SignInScreen] Email auth error:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Authentication failed. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      console.log('[SignInScreen] Starting Google Sign-In');

      // Start Google OAuth flow
      const success = await AuthManager.startAuthFlow('google');

      if (!success) {
        Alert.alert(
          'Sign In Failed', 
          'Could not sign in with Google. This may happen if:\n\n' +
          '• You cancelled the sign-in\n' +
          '• There was a network issue\n' +
          '• You denied permissions\n\n' +
          'Please try again or use email sign-in instead.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Get the Google token to extract profile info
      const googleToken = await AuthManager.getAccessToken('google');
      
      if (!googleToken) {
        Alert.alert(
          'Error', 
          'Could not retrieve authentication token. Please try again or use email sign-in instead.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Fetch user profile from Google
      const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${googleToken}`,
        },
      });

      if (!profileResponse.ok) {
        const errorText = await profileResponse.text();
        console.error('[SignInScreen] Profile fetch error:', errorText);
        throw new Error('Failed to fetch user profile from Google');
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

      // Navigate to permission manager
      router.replace('/onboarding/permissions');
      
      Alert.alert(
        'Welcome!',
        `Signed in as ${googleProfile.name || googleProfile.email}. Let's set up your permissions.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('[SignInScreen] Sign-in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      Alert.alert(
        'Google Sign-In Error',
        `${errorMessage}\n\nYou can use email sign-in instead if Google sign-in continues to have issues.`,
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
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to</Text>
          <Text style={styles.appName}>RORK AI Command Center</Text>
          <Text style={styles.subtitle}>
            Your unified hub for AI services and smart home control
          </Text>
        </View>

        {authMode === 'email' ? (
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>{isSignUp ? 'Create Account' : 'Sign In'}</Text>
            
            {isSignUp && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor="#6b7280"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#6b7280"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#6b7280"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleEmailAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchModeButton}
              onPress={() => setIsSignUp(!isSignUp)}
              disabled={loading}
            >
              <Text style={styles.switchModeText}>
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[styles.button, styles.googleButton]}
              onPress={() => setAuthMode('google')}
              disabled={loading}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.buttonText}>Continue with Google</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.googleAuthContainer}>
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
              style={styles.backButton}
              onPress={() => setAuthMode('email')}
              disabled={loading}
            >
              <Text style={styles.backButtonText}>← Back to Email Sign In</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, styles.skipButton]}
          onPress={handleSkip}
          disabled={loading}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
          All data is stored securely on your device.
        </Text>
      </View>
    </KeyboardAvoidingView>
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
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    color: '#6b7280',
    marginBottom: 4,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  formContainer: {
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    marginTop: 8,
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
  switchModeButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  switchModeText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#d1d5db',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  googleAuthContainer: {
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 12,
  },
});
