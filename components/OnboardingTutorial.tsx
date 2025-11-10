import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useState, useEffect } from 'react';
import { Bot, Zap, Target, TrendingUp, DollarSign, Settings, CheckCircle, ArrowRight, X } from 'lucide-react-native';
import { IronManTheme } from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface OnboardingTutorialProps {
  visible: boolean;
  onComplete: () => void;
}

const steps = [
  {
    id: '1',
    title: 'Welcome to J.A.R.V.I.S.',
    subtitle: 'Just A Rather Very Intelligent System',
    description: 'Good day, sir. I am JARVIS, your autonomous AI assistant designed to maximize your revenue streams while you focus on what matters most. Think of me as your digital business partner - I handle the operations, you make the strategic decisions.',
    icon: Bot,
    color: IronManTheme.jarvisGreen,
  },
  {
    id: '2',
    title: 'My Core Mission',
    subtitle: 'Revenue Generation & Automation',
    description: 'I\'m here to help you reach $10,000/month in automated revenue. I analyze trends in real-time, generate and optimize content across all platforms, manage your e-commerce operations, and continuously learn what works best for YOUR specific audience.',
    icon: DollarSign,
    color: IronManTheme.secondary,
  },
  {
    id: '3',
    title: 'How We Work Together',
    subtitle: 'You Approve, I Execute',
    description: 'I operate autonomously within the limits you set. I\'ll find opportunities, create content, optimize campaigns, and handle customer interactions. When something requires your approval - like spending over your threshold or launching a new product - I\'ll alert you immediately. You approve in seconds, I execute in minutes.',
    icon: Zap,
    color: IronManTheme.primary,
  },
  {
    id: '4',
    title: 'Multi-Platform Intelligence',
    subtitle: 'Everywhere You Need To Be',
    description: 'I\'m integrated with 300+ platforms - social media, e-commerce, advertising, analytics, and more. I post content, run ads, manage inventory, respond to customers, track performance, and move money between channels to maximize ROI. All coordinated, all optimized, all automated.',
    icon: Target,
    color: IronManTheme.accent,
  },
  {
    id: '5',
    title: 'Real-Time Learning',
    subtitle: 'I Get Smarter Every Day',
    description: 'Every post, every ad, every sale teaches me more about what works for you. I use advanced AI to predict trends before they peak, identify profitable opportunities, and eliminate what doesn\'t work. Within weeks, I\'ll know your audience better than any human analyst could.',
    icon: TrendingUp,
    color: IronManTheme.warning,
  },
  {
    id: '6',
    title: 'Configure Your Preferences',
    subtitle: 'Let\'s Set Your Autonomy Levels',
    description: 'Before we begin, set your preferences in my settings panel. Define spending limits, approval thresholds, and enable the features you need. You can always adjust these later. Ready to start your journey to automated profitability, sir?',
    icon: Settings,
    color: IronManTheme.success,
  },
];

export default function OnboardingTutorial({ visible, onComplete }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    await AsyncStorage.setItem('jarvis_onboarding_completed', 'true');
    onComplete();
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleComplete}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
            <X size={16} color={IronManTheme.textSecondary} />
          </TouchableOpacity>

          <ScrollView 
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.iconContainer}>
              <View style={[styles.iconCircle, { borderColor: step.color, shadowColor: step.color }]}>
                <Icon size={48} color={step.color} />
              </View>
            </View>

            <Text style={styles.title}>{step.title}</Text>
            <Text style={[styles.subtitle, { color: step.color }]}>{step.subtitle}</Text>
            <Text style={styles.description}>{step.description}</Text>

            <View style={styles.progressContainer}>
              {steps.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    index === currentStep && styles.progressDotActive,
                    index < currentStep && styles.progressDotCompleted,
                  ]}
                />
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: step.color }]}
            onPress={handleNext}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            </Text>
            {currentStep === steps.length - 1 ? (
              <CheckCircle size={20} color="#000" />
            ) : (
              <ArrowRight size={20} color="#000" />
            )}
          </TouchableOpacity>

          <Text style={styles.stepCounter}>
            Step {currentStep + 1} of {steps.length}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: IronManTheme.surface,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: IronManTheme.surfaceLight,
    padding: 24,
    maxHeight: '90%',
  },
  skipButton: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
    marginBottom: 8,
  },
  skipText: {
    color: IronManTheme.textSecondary,
    fontSize: 14,
  },
  content: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: IronManTheme.background,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: IronManTheme.text,
    textAlign: 'center' as const,
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 15,
    color: IronManTheme.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 32,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: IronManTheme.surfaceLight,
  },
  progressDotActive: {
    width: 24,
    backgroundColor: IronManTheme.secondary,
  },
  progressDotCompleted: {
    backgroundColor: IronManTheme.success,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#000',
    letterSpacing: 1,
  },
  stepCounter: {
    textAlign: 'center' as const,
    fontSize: 12,
    color: IronManTheme.textMuted,
    marginTop: 12,
  },
});
