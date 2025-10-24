import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Dimensions } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Brain, Check, ChevronRight, Sparkles, Shield, Zap, Globe, Mic, Cloud } from 'lucide-react-native';
import { IronManTheme } from '@/constants/colors';
import voiceService from '@/services/voice/VoiceService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface JarvisOnboardingProps {
  visible: boolean;
  onComplete: () => void;
}

const { width } = Dimensions.get('window');

export function JarvisOnboarding({ visible, onComplete }: JarvisOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isInitializing, setIsInitializing] = useState(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const steps = [
    {
      title: 'Welcome, Sir',
      description: 'I am J.A.R.V.I.S. - Just A Rather Very Intelligent System. I am here to help you build your digital empire and maximize your profitability across all platforms.',
      icon: Brain,
      color: IronManTheme.primary,
      speak: 'Welcome Sir. I am JARVIS. Just A Rather Very Intelligent System. I am here to help you build your digital empire.',
    },
    {
      title: 'Voice Activation',
      description: 'I can speak to you and listen to your commands. Would you like to enable voice features for a truly interactive experience?',
      icon: Mic,
      color: IronManTheme.accent,
      speak: 'I can speak to you and listen to your commands. Would you like to enable voice features?',
      action: 'voice',
    },
    {
      title: 'Multi-Platform Power',
      description: 'I can manage content across 100+ platforms including social media, gaming, e-commerce, and more. All from one unified interface.',
      icon: Globe,
      color: IronManTheme.secondary,
      speak: 'I can manage content across over 100 platforms including social media, gaming, and e-commerce.',
    },
    {
      title: 'Autonomous Operations',
      description: 'I will monitor trends, generate content, optimize campaigns, and handle operations 24/7. You approve the strategy, I execute everything.',
      icon: Zap,
      color: IronManTheme.jarvisGreen,
      speak: 'I will monitor trends, generate content, and handle operations 24/7. You approve the strategy, I execute everything.',
    },
    {
      title: 'Cloud & Local Storage',
      description: 'Your media and data can be stored locally on your device or in the cloud. I will manage backups and ensure everything is secure.',
      icon: Cloud,
      color: IronManTheme.accent,
      speak: 'Your media can be stored locally or in the cloud. I will manage backups and ensure security.',
    },
    {
      title: 'Security First',
      description: 'All your API keys and sensitive data are encrypted and stored securely. I will never expose your credentials or compromise your accounts.',
      icon: Shield,
      color: IronManTheme.primary,
      speak: 'All your data is encrypted and stored securely. I will never compromise your accounts.',
    },
    {
      title: 'Ready for Launch',
      description: 'Everything is configured and ready. You can now connect your platforms, add API keys, and let me start working for you.',
      icon: Sparkles,
      color: IronManTheme.secondary,
      speak: 'Everything is configured and ready. Let us begin building your empire.',
      final: true,
    },
  ];

  useEffect(() => {
    if (visible) {
      startPulseAnimation();
      fadeIn();
      initializeJarvis();
    }
  }, [visible]);

  useEffect(() => {
    if (visible && currentStep < steps.length) {
      speakStep(currentStep);
    }
  }, [currentStep, visible]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const initializeJarvis = async () => {
    setIsInitializing(true);
    try {
      await voiceService.initialize();
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch (error) {
      console.error('[JarvisOnboarding] Initialization error:', error);
    }
    setIsInitializing(false);
  };

  const speakStep = async (step: number) => {
    if (step >= steps.length) return;
    
    const stepData = steps[step];
    try {
      await voiceService.speak(stepData.speak, {
        pitch: 0.9,
        rate: 1.1,
      });
    } catch (error) {
      console.log('[JarvisOnboarding] Speech error:', error);
    }
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await completeOnboarding();
    }
  };

  const handleSkip = async () => {
    await voiceService.stop();
    await completeOnboarding();
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('jarvis-onboarding-completed', 'true');
    await voiceService.speak('Systems online. Standing by for your command, Sir.', {
      pitch: 0.9,
      rate: 1.1,
    });
    onComplete();
  };

  const step = steps[currentStep];
  const IconComponent = step?.icon || Brain;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <LinearGradient
        colors={['#000000', '#1a0000', '#000000']}
        style={styles.container}
      >
        {isInitializing ? (
          <View style={styles.initializingContainer}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Brain size={80} color={IronManTheme.primary} />
            </Animated.View>
            <Text style={styles.initializingText}>Initializing J.A.R.V.I.S.</Text>
            <View style={styles.loadingDots}>
              <Text style={styles.loadingDot}>●</Text>
              <Text style={styles.loadingDot}>●</Text>
              <Text style={styles.loadingDot}>●</Text>
            </View>
          </View>
        ) : (
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            <View style={styles.progressBar}>
              {steps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    index <= currentStep && { backgroundColor: IronManTheme.secondary },
                  ]}
                />
              ))}
            </View>

            <View style={styles.iconContainer}>
              <Animated.View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: step.color,
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <IconComponent size={48} color={IronManTheme.background} />
              </Animated.View>
            </View>

            <Text style={styles.title}>{step.title}</Text>
            <Text style={styles.description}>{step.description}</Text>

            {step.action === 'voice' && (
              <View style={styles.actionContainer}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={async () => {
                    try {
                      await voiceService.initialize();
                      await voiceService.speak('Voice systems activated. You can now speak to me.');
                      handleNext();
                    } catch (error) {
                      console.error('[JarvisOnboarding] Voice activation error:', error);
                    }
                  }}
                >
                  <Mic size={20} color={IronManTheme.background} />
                  <Text style={styles.actionButtonText}>Enable Voice</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.buttonContainer}>
              {currentStep < steps.length - 1 ? (
                <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                  <Text style={styles.nextButtonText}>Next</Text>
                  <ChevronRight size={20} color={IronManTheme.background} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.finishButton} onPress={completeOnboarding}>
                  <Check size={20} color={IronManTheme.background} />
                  <Text style={styles.finishButtonText}>Let&apos;s Begin</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Step {currentStep + 1} of {steps.length}
              </Text>
            </View>
          </Animated.View>
        )}
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  initializingContainer: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  initializingText: {
    color: IronManTheme.text,
    fontSize: 24,
    fontWeight: 'bold' as const,
    marginTop: 30,
  },
  loadingDots: {
    flexDirection: 'row' as const,
    gap: 10,
    marginTop: 20,
  },
  loadingDot: {
    color: IronManTheme.secondary,
    fontSize: 24,
    opacity: 0.5,
  },
  content: {
    width: width * 0.9,
    maxWidth: 500,
    alignItems: 'center' as const,
    padding: 30,
  },
  skipButton: {
    position: 'absolute' as const,
    top: 10,
    right: 10,
    padding: 10,
  },
  skipText: {
    color: IronManTheme.textSecondary,
    fontSize: 16,
  },
  progressBar: {
    flexDirection: 'row' as const,
    gap: 8,
    marginBottom: 40,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: IronManTheme.border,
  },
  iconContainer: {
    marginBottom: 30,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: IronManTheme.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    color: IronManTheme.text,
    fontSize: 28,
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
    marginBottom: 15,
  },
  description: {
    color: IronManTheme.textSecondary,
    fontSize: 16,
    textAlign: 'center' as const,
    lineHeight: 24,
    marginBottom: 30,
  },
  actionContainer: {
    width: '100%' as const,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 10,
    backgroundColor: IronManTheme.accent,
    padding: 16,
    borderRadius: 12,
  },
  actionButtonText: {
    color: IronManTheme.background,
    fontSize: 16,
    fontWeight: 'bold' as const,
  },
  buttonContainer: {
    width: '100%' as const,
    marginTop: 20,
  },
  nextButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 10,
    backgroundColor: IronManTheme.secondary,
    padding: 18,
    borderRadius: 12,
  },
  nextButtonText: {
    color: IronManTheme.background,
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  finishButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 10,
    backgroundColor: IronManTheme.primary,
    padding: 18,
    borderRadius: 12,
  },
  finishButtonText: {
    color: IronManTheme.background,
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  footer: {
    marginTop: 20,
  },
  footerText: {
    color: IronManTheme.textMuted,
    fontSize: 14,
  },
});
