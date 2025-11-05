import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Brain, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import UserService from '@/services/user/UserService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

interface LocalCredentials {
  password: string;
  createdAt: number;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const stored = await AsyncStorage.getItem('local_credentials');
        if (stored) {
          setMode('login');
        } else {
          setMode('register');
        }

        if (UserService.isLoggedIn()) {
          onLoginSuccess();
        }
      } catch (error) {
        console.error('Failed to check existing login:', error);
      }
    };
    init();
  }, [onLoginSuccess]);



  const handleEmailLogin = async () => {
    if (!password) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }

    if (mode === 'register' && password.length < 4) {
      Alert.alert('Error', 'Password must be at least 4 characters');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const stored = await AsyncStorage.getItem('local_credentials');
        if (!stored) {
          Alert.alert('Error', 'No account found. Please create one first.');
          setMode('register');
          setLoading(false);
          return;
        }

        const credentials: LocalCredentials = JSON.parse(stored);
        if (credentials.password !== password) {
          Alert.alert('Error', 'Incorrect password');
          setLoading(false);
          return;
        }

        await AsyncStorage.setItem('authenticated', 'true');
        console.log('[LoginScreen] Local authentication successful');
        onLoginSuccess();
      } else {
        const credentials: LocalCredentials = {
          password,
          createdAt: Date.now(),
        };

        await AsyncStorage.setItem('local_credentials', JSON.stringify(credentials));
        await AsyncStorage.setItem('authenticated', 'true');
        console.log('[LoginScreen] Account created successfully');
        Alert.alert('Success', 'Your secure access has been set up!', [
          { text: 'OK', onPress: () => onLoginSuccess() }
        ]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);

    try {
      await UserService.loginWithGoogle();
      onLoginSuccess();
    } catch (error: any) {
      if (error.message !== 'Google sign-in cancelled') {
        Alert.alert('Error', error.message || 'Google sign-in failed');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSkipLogin = () => {
    onLoginSuccess();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#0a0a0a', '#1a1a2e', '#16213e']}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Brain size={60} color="#00f2ff" />
            <Text style={styles.title}>JARVIS</Text>
            <Text style={styles.subtitle}>
              Ultimate AI Command Center
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, mode === 'login' && styles.tabActive]}
                onPress={() => setMode('login')}
              >
                <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
                  Login
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, mode === 'register' && styles.tabActive]}
                onPress={() => setMode('register')}
              >
                <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>

            {mode === 'register' && (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>Create a secure password to protect your JARVIS AI system and API keys.</Text>
              </View>
            )}

            {mode === 'login' && (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>Welcome back. Enter your password to access your JARVIS AI system.</Text>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Lock size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={20} color="#666" />
                ) : (
                  <Eye size={20} color="#666" />
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleEmailLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {mode === 'login' ? 'Login' : 'Create Account'}
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={[styles.googleButton, googleLoading && styles.buttonDisabled]}
              onPress={handleGoogleLogin}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <User size={20} color="#fff" style={{ marginRight: 10 }} />
                  <Text style={styles.buttonText}>
                    Continue with Google
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkipLogin}
            >
              <Text style={styles.skipButtonText}>
                Skip for now (Demo Mode)
              </Text>
            </TouchableOpacity>

            <View style={styles.features}>
              <Text style={styles.featuresTitle}>🔒 Secure Features:</Text>
              <Text style={styles.featureItem}>✓ Password-protected access</Text>
              <Text style={styles.featureItem}>✓ Google OAuth integration</Text>
              <Text style={styles.featureItem}>✓ Encrypted API key storage</Text>
              <Text style={styles.featureItem}>✓ Google Drive backup/sync</Text>
              <Text style={styles.featureItem}>✓ Private AI assistant</Text>
            </View>

            <Text style={styles.disclaimer}>
              {mode === 'login' 
                ? "Don't have an account? Switch to Sign Up"
                : 'Already have an account? Switch to Login'}
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#00f2ff',
    marginTop: 20,
    letterSpacing: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  tabActive: {
    backgroundColor: '#00f2ff',
  },
  tabText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  button: {
    backgroundColor: '#00f2ff',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  dividerText: {
    color: '#666',
    marginHorizontal: 16,
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: '#4285F4',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  googleIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#4285f4',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  googleIconText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  googleButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  skipButtonText: {
    color: '#666',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  features: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00f2ff33',
  },
  featuresTitle: {
    color: '#00f2ff',
    fontSize: 14,
    fontWeight: 'bold' as const,
    marginBottom: 12,
  },
  featureItem: {
    color: '#888',
    fontSize: 13,
    marginBottom: 6,
    paddingLeft: 8,
  },
  infoBox: {
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#00f2ff33',
  },
  infoText: {
    color: '#00f2ff',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center' as const,
  },
  disclaimer: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    marginTop: 16,
  },
});
