import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Check, 
  ChevronRight, 
  Sparkles,
  Key,
  Shield,
  Zap,
  CheckCircle,
  AlertCircle,
  Volume2,
  VolumeX,
  Mic
} from 'lucide-react-native';
import GoogleAuthService from '@/services/auth/GoogleAuthService';
import UserProfileService from '@/services/user/UserProfileService';
import GoogleDriveSync from '@/services/sync/GoogleDriveSync';
import { VoiceService } from '@/services';
import UserService from '@/services/user/UserService';
import { VoiceSettings } from '@/types/models.types';

interface StartupWizardProps {
  visible: boolean;
  onComplete: () => void;
  isRerun?: boolean; // Flag to indicate if this is a re-run from settings
}

type WizardStep = 'welcome' | 'google-signin' | 'api-keys' | 'voice-preferences' | 'completion';

export default function StartupWizard({ visible, onComplete, isRerun = false }: StartupWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(isRerun ? 'api-keys' : 'welcome');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // API Keys state
  const [apiKeys, setApiKeys] = useState({
    groq: '',
    gemini: '',
    huggingface: '',
  });

  // Voice preferences state
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [wakeWord, setWakeWord] = useState('jarvis');
  const [testingVoice, setTestingVoice] = useState(false);

  const services = [
    { 
      id: 'groq', 
      name: 'Groq', 
      tier: 'Free', 
      description: 'Lightning-fast inference with LLaMA models',
      required: true 
    },
    { 
      id: 'gemini', 
      name: 'Google Gemini', 
      tier: 'Free Tier', 
      description: 'Multimodal AI by Google',
      required: false 
    },
    { 
      id: 'huggingface', 
      name: 'HuggingFace', 
      tier: 'Free', 
      description: 'Access to thousands of open-source models',
      required: false 
    },
  ];

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);

      const googleUser = await GoogleAuthService.signInWithGoogle();
      
      if (!googleUser) {
        setError('Sign-in was cancelled');
        return;
      }

      // Create user profile (this will auto-detect Gemini key and mark setup complete if found)
      const profile = await UserProfileService.createProfile(googleUser);

      // Initialize text-to-speech immediately
      try {
        await VoiceService.initialize();
        console.log('[StartupWizard] Voice service initialized');
        
        // Test TTS with welcome message
        setTimeout(() => {
          VoiceService.speak('Welcome to JARVIS. I am ready to assist you.');
        }, 1000);
      } catch (voiceError) {
        console.warn('[StartupWizard] Voice initialization warning:', voiceError);
        // Continue even if voice fails
      }

      // Try to sync from cloud (in case user is signing in from new device)
      try {
        const cloudProfile = await GoogleDriveSync.downloadProfile();
        if (cloudProfile) {
          console.log('[StartupWizard] Restored profile from cloud');
          // If profile exists in cloud and has API keys, skip to completion
          if (cloudProfile.apiKeys && Object.keys(cloudProfile.apiKeys).length > 0) {
            setCurrentStep('completion');
            return;
          }
        }
      } catch (syncError) {
        console.log('[StartupWizard] No cloud profile found, continuing with setup');
      }

      // If Gemini was auto-linked and setup is complete, skip to completion
      if (profile.setupCompleted && profile.apiKeys.gemini) {
        console.log('[StartupWizard] Gemini auto-linked, JARVIS is functional! Skipping to completion.');
        setCurrentStep('completion');
        
        // Speak confirmation
        setTimeout(() => {
          VoiceService.speak('Google Gemini has been automatically linked. I am fully operational.');
        }, 2000);
        
        return;
      }

      // Pre-fill Gemini key if it was auto-detected
      if (profile.apiKeys.gemini) {
        setApiKeys(prev => ({ ...prev, gemini: profile.apiKeys.gemini || '' }));
      }

      // Move to API keys step
      setCurrentStep('api-keys');
    } catch (err) {
      console.error('[StartupWizard] Google sign-in error:', err);
      setError(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAPIKeys = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate at least one API key is provided
      const hasAtLeastOneKey = Object.values(apiKeys).some(key => key.trim().length > 0);
      
      if (!hasAtLeastOneKey) {
        setError('Please enter at least one API key to continue');
        return;
      }

      // Save API keys to profile
      const keysToSave: any = {};
      for (const [service, key] of Object.entries(apiKeys)) {
        if (key.trim()) {
          keysToSave[service] = key.trim();
        }
      }

      await UserProfileService.updateAPIKeys(keysToSave);

      // Move to voice preferences step
      setCurrentStep('voice-preferences');
    } catch (err) {
      console.error('[StartupWizard] Save API keys error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipAPIKeys = async () => {
    try {
      // Move to voice preferences instead of completion
      setCurrentStep('voice-preferences');
    } catch (err) {
      console.error('[StartupWizard] Skip error:', err);
    }
  };

  const handleTestVoice = async () => {
    try {
      setTestingVoice(true);
      await VoiceService.speak('Hello, I am JARVIS, your personal AI assistant. How may I assist you today?');
    } catch (err) {
      console.error('[StartupWizard] Voice test error:', err);
      Alert.alert('Voice Test Failed', 'Unable to test voice. Please check your device settings.');
    } finally {
      setTimeout(() => setTestingVoice(false), 3000);
    }
  };

  const handleSaveVoicePreferences = async () => {
    try {
      setLoading(true);
      setError(null);

      // Update voice settings in UserService
      const voiceSettings: Partial<VoiceSettings> = {
        enabled: voiceEnabled,
        wakeWord: wakeWord.toLowerCase(),
        voice: 'jarvis', // Always jarvis
      };

      await UserService.updateVoiceSettings(voiceSettings);

      // Mark setup as complete
      await UserProfileService.markSetupComplete();

      // Sync to cloud
      try {
        await GoogleDriveSync.uploadProfile();
        console.log('[StartupWizard] Profile synced to cloud');
      } catch (syncError) {
        console.warn('[StartupWizard] Cloud sync failed, but setup is complete:', syncError);
      }

      setCurrentStep('completion');
    } catch (err) {
      console.error('[StartupWizard] Save voice preferences error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save voice preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipVoicePreferences = async () => {
    try {
      // Mark setup as complete even if voice is skipped
      await UserProfileService.markSetupComplete();

      // Sync to cloud
      try {
        await GoogleDriveSync.uploadProfile();
        console.log('[StartupWizard] Profile synced to cloud');
      } catch (syncError) {
        console.warn('[StartupWizard] Cloud sync failed, but setup is complete:', syncError);
      }

      setCurrentStep('completion');
    } catch (err) {
      console.error('[StartupWizard] Skip voice preferences error:', err);
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  const renderWelcomeStep = () => (
    <View style={styles.stepContainer}>
      <LinearGradient
        colors={['#1a1a1a', '#0a0a0a']}
        style={styles.welcomeGradient}
      >
        <Sparkles size={64} color="#00f2ff" style={styles.welcomeIcon} />
        
        <Text style={styles.welcomeTitle}>Welcome to JARVIS</Text>
        <Text style={styles.welcomeSubtitle}>
          Your AI Command Center
        </Text>
        
        <Text style={styles.welcomeDescription}>
          {isRerun 
            ? 'Update your JARVIS configuration and API keys'
            : 'Let\'s activate your JARVIS brain. This one-time setup will:'}
        </Text>
        
        {!isRerun && (
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Check size={20} color="#00ff00" />
              <Text style={styles.featureText}>
                Connect your Google account for cloud sync
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Check size={20} color="#00ff00" />
              <Text style={styles.featureText}>
                Auto-link Google Gemini AI instantly
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Check size={20} color="#00ff00" />
              <Text style={styles.featureText}>
                Enable text-to-speech immediately
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Check size={20} color="#00ff00" />
              <Text style={styles.featureText}>
                Securely store your AI API keys
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Check size={20} color="#00ff00" />
              <Text style={styles.featureText}>
                Enable cross-device synchronization
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setCurrentStep(isRerun ? 'api-keys' : 'google-signin')}
        >
          <Text style={styles.primaryButtonText}>
            {isRerun ? 'Update Configuration' : 'Let\'s Begin'}
          </Text>
          <ChevronRight size={20} color="#000" />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  const renderGoogleSignInStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Step 1: Connect Your Account</Text>
      <Text style={styles.stepDescription}>
        Sign in with Google to enable cloud sync and cross-device access
      </Text>

      <View style={styles.benefitsContainer}>
        <View style={styles.benefitCard}>
          <Shield size={32} color="#00f2ff" />
          <Text style={styles.benefitTitle}>Secure</Text>
          <Text style={styles.benefitText}>
            Hardware-encrypted storage for all your keys
          </Text>
        </View>
        
        <View style={styles.benefitCard}>
          <Zap size={32} color="#00f2ff" />
          <Text style={styles.benefitTitle}>Seamless</Text>
          <Text style={styles.benefitText}>
            Auto-sync across all your devices
          </Text>
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <AlertCircle size={16} color="#ff4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.buttonDisabled]}
        onPress={handleGoogleSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <>
            <Text style={styles.primaryButtonText}>Sign in with Google</Text>
            <ChevronRight size={20} color="#000" />
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.privacyNote}>
        Your data is encrypted and stored securely. We never share your information.
      </Text>
    </View>
  );

  const renderAPIKeysStep = () => (
    <ScrollView style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Step 2: Add AI API Keys</Text>
      <Text style={styles.stepDescription}>
        Connect at least one AI service to activate JARVIS
      </Text>

      {services.map((service) => (
        <View key={service.id} style={styles.apiKeyCard}>
          <View style={styles.apiKeyHeader}>
            <View style={styles.apiKeyInfo}>
              <Text style={styles.apiKeyName}>
                {service.name}
                {service.required && <Text style={styles.requiredBadge}> *</Text>}
              </Text>
              <View style={styles.tierBadge}>
                <Text style={styles.tierText}>{service.tier}</Text>
              </View>
            </View>
            <Key size={20} color="#00f2ff" />
          </View>
          
          <Text style={styles.apiKeyDescription}>{service.description}</Text>
          
          <TextInput
            style={styles.apiKeyInput}
            value={apiKeys[service.id as keyof typeof apiKeys]}
            onChangeText={(text) => setApiKeys({ ...apiKeys, [service.id]: text })}
            placeholder={`Enter ${service.name} API key`}
            placeholderTextColor="#666"
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />
        </View>
      ))}

      {error && (
        <View style={styles.errorContainer}>
          <AlertCircle size={16} color="#ff4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleSkipAPIKeys}
        >
          <Text style={styles.secondaryButtonText}>Skip for Now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, styles.flexButton, loading && styles.buttonDisabled]}
          onPress={handleSaveAPIKeys}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <Text style={styles.primaryButtonText}>Save & Continue</Text>
              <ChevronRight size={20} color="#000" />
            </>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.helpText}>
        💡 Tip: You can add or update API keys later in Settings
      </Text>
    </ScrollView>
  );

  const renderVoicePreferencesStep = () => (
    <ScrollView style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Step 3: Voice Preferences</Text>
      <Text style={styles.stepDescription}>
        Configure JARVIS voice assistant to your liking
      </Text>

      <View style={styles.voiceCard}>
        <View style={styles.voiceHeader}>
          <View style={styles.voiceHeaderLeft}>
            {voiceEnabled ? (
              <Volume2 size={24} color="#00f2ff" />
            ) : (
              <VolumeX size={24} color="#666" />
            )}
            <Text style={styles.voiceTitle}>Enable Voice Assistant</Text>
          </View>
          <Switch
            value={voiceEnabled}
            onValueChange={setVoiceEnabled}
            trackColor={{ false: '#333', true: '#00f2ff' }}
            thumbColor={voiceEnabled ? '#fff' : '#666'}
          />
        </View>
        <Text style={styles.voiceDescription}>
          Enable JARVIS to speak responses and interact with you using voice
        </Text>
      </View>

      {voiceEnabled && (
        <>
          <View style={styles.voiceCard}>
            <View style={styles.voiceCardHeader}>
              <Mic size={20} color="#00f2ff" />
              <Text style={styles.voiceCardTitle}>Wake Word</Text>
            </View>
            <Text style={styles.voiceCardDescription}>
              Say this word to activate voice listening (default: "jarvis")
            </Text>
            <TextInput
              style={styles.voiceInput}
              value={wakeWord}
              onChangeText={setWakeWord}
              placeholder="jarvis"
              placeholderTextColor="#666"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.voiceCard}>
            <View style={styles.voiceCardHeader}>
              <Sparkles size={20} color="#00f2ff" />
              <Text style={styles.voiceCardTitle}>Voice Type</Text>
            </View>
            <Text style={styles.voiceCardDescription}>
              JARVIS uses a British male voice optimized for natural, intelligent speech
            </Text>
            <View style={styles.voiceTypeBox}>
              <Text style={styles.voiceTypeText}>🎙️ JARVIS (British Male)</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.testButton, testingVoice && styles.buttonDisabled]}
            onPress={handleTestVoice}
            disabled={testingVoice}
          >
            {testingVoice ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Volume2 size={20} color="#000" />
                <Text style={styles.testButtonText}>Test Voice</Text>
              </>
            )}
          </TouchableOpacity>
        </>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <AlertCircle size={16} color="#ff4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleSkipVoicePreferences}
        >
          <Text style={styles.secondaryButtonText}>Skip</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, styles.flexButton, loading && styles.buttonDisabled]}
          onPress={handleSaveVoicePreferences}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <Text style={styles.primaryButtonText}>Save & Continue</Text>
              <ChevronRight size={20} color="#000" />
            </>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.helpText}>
        💡 Tip: You can change these settings anytime in Settings
      </Text>
    </ScrollView>
  );

  const renderCompletionStep = () => (
    <View style={styles.stepContainer}>
      <LinearGradient
        colors={['#1a1a1a', '#0a0a0a']}
        style={styles.completionGradient}
      >
        <CheckCircle size={64} color="#00ff00" style={styles.completionIcon} />
        
        <Text style={styles.completionTitle}>JARVIS Activated!</Text>
        <Text style={styles.completionSubtitle}>
          {isRerun 
            ? 'Your configuration has been updated'
            : 'Your AI brain is ready to assist you'}
        </Text>
        
        <View style={styles.completionFeatures}>
          <View style={styles.completionFeature}>
            <Check size={16} color="#00ff00" />
            <Text style={styles.completionFeatureText}>
              Secure authentication enabled
            </Text>
          </View>
          <View style={styles.completionFeature}>
            <Check size={16} color="#00ff00" />
            <Text style={styles.completionFeatureText}>
              Google Gemini auto-linked
            </Text>
          </View>
          <View style={styles.completionFeature}>
            <Check size={16} color="#00ff00" />
            <Text style={styles.completionFeatureText}>
              Text-to-speech activated
            </Text>
          </View>
          <View style={styles.completionFeature}>
            <Check size={16} color="#00ff00" />
            <Text style={styles.completionFeatureText}>
              {voiceEnabled ? 'Voice assistant enabled' : 'Voice assistant disabled'}
            </Text>
          </View>
          <View style={styles.completionFeature}>
            <Check size={16} color="#00ff00" />
            <Text style={styles.completionFeatureText}>
              API keys encrypted and stored
            </Text>
          </View>
          <View style={styles.completionFeature}>
            <Check size={16} color="#00ff00" />
            <Text style={styles.completionFeatureText}>
              Cloud sync activated
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleComplete}
        >
          <Text style={styles.primaryButtonText}>
            {isRerun ? 'Back to Settings' : 'Start Using JARVIS'}
          </Text>
          <Sparkles size={20} color="#000" />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  const renderProgressIndicator = () => {
    const steps = ['welcome', 'google-signin', 'api-keys', 'voice-preferences', 'completion'];
    const currentIndex = steps.indexOf(currentStep);

    return (
      <View style={styles.progressContainer}>
        {steps.map((step, index) => (
          <View key={step} style={styles.progressStepContainer}>
            <View
              style={[
                styles.progressDot,
                index <= currentIndex && styles.progressDotActive,
              ]}
            >
              {index < currentIndex ? (
                <Check size={12} color="#000" />
              ) : null}
            </View>
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.progressLine,
                  index < currentIndex && styles.progressLineActive,
                ]}
              />
            )}
          </View>
        ))}
      </View>
    );
  };

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      {currentStep !== 'welcome' && currentStep !== 'completion' && (
        renderProgressIndicator()
      )}
      
      {currentStep === 'welcome' && renderWelcomeStep()}
      {currentStep === 'google-signin' && renderGoogleSignInStep()}
      {currentStep === 'api-keys' && renderAPIKeysStep()}
      {currentStep === 'voice-preferences' && renderVoicePreferencesStep()}
      {currentStep === 'completion' && renderCompletionStep()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  stepContainer: {
    flex: 1,
    padding: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
  },
  progressStepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  progressDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotActive: {
    backgroundColor: '#00f2ff',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#333',
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: '#00f2ff',
  },
  welcomeGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 16,
  },
  welcomeIcon: {
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00f2ff',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: '#ccc',
    marginBottom: 32,
  },
  welcomeDescription: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 24,
  },
  featureList: {
    width: '100%',
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    color: '#ccc',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  stepDescription: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 32,
  },
  benefitsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  benefitCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 12,
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 13,
    color: '#aaa',
    textAlign: 'center',
  },
  apiKeyCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 16,
  },
  apiKeyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  apiKeyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  apiKeyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  requiredBadge: {
    color: '#ff4444',
  },
  tierBadge: {
    backgroundColor: '#00ff0020',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tierText: {
    color: '#00ff00',
    fontSize: 11,
    fontWeight: '600',
  },
  apiKeyDescription: {
    fontSize: 13,
    color: '#aaa',
    marginBottom: 12,
  },
  apiKeyInput: {
    backgroundColor: '#0a0a0a',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  primaryButton: {
    backgroundColor: '#00f2ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  primaryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#1a1a1a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  flexButton: {
    flex: 1,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff444420',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    flex: 1,
  },
  helpText: {
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 16,
  },
  privacyNote: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
  completionGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 16,
  },
  completionIcon: {
    marginBottom: 24,
  },
  completionTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00ff00',
    marginBottom: 8,
  },
  completionSubtitle: {
    fontSize: 18,
    color: '#ccc',
    marginBottom: 32,
  },
  completionFeatures: {
    width: '100%',
    marginBottom: 32,
  },
  completionFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  completionFeatureText: {
    color: '#ccc',
    fontSize: 14,
    marginLeft: 12,
  },
  voiceCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 16,
  },
  voiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  voiceHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  voiceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  voiceDescription: {
    fontSize: 13,
    color: '#aaa',
    marginTop: 8,
  },
  voiceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  voiceCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  voiceCardDescription: {
    fontSize: 13,
    color: '#aaa',
    marginBottom: 12,
  },
  voiceInput: {
    backgroundColor: '#0a0a0a',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#333',
  },
  voiceTypeBox: {
    backgroundColor: '#00f2ff10',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00f2ff30',
    alignItems: 'center',
  },
  voiceTypeText: {
    color: '#00f2ff',
    fontSize: 14,
    fontWeight: '600',
  },
  testButton: {
    backgroundColor: '#00f2ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  testButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
