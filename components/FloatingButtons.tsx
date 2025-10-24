import { TouchableOpacity, StyleSheet, View, Animated } from 'react-native';
import { Brain } from 'lucide-react-native';
import { IronManTheme } from '@/constants/colors';
import { useEffect, useRef } from 'react';

interface FloatingButtonsProps {
  onChatPress: () => void;
  onBrainPress: () => void;
}

export default function FloatingButtons({ onChatPress, onBrainPress }: FloatingButtonsProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim, glowAnim]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.touchable}
        onPress={onBrainPress}
        testID="floating-brain-button"
        activeOpacity={0.7}
      >
        <View style={styles.glowOuter} />
        <Animated.View style={[styles.glowMiddle, { opacity: glowAnim }]} />
        <Animated.View style={[styles.button, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.innerCircle}>
            <Brain color={IronManTheme.jarvisGreen} size={32} strokeWidth={2.5} />
          </View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute' as const,
    right: 20,
    bottom: 80,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  glowOuter: {
    position: 'absolute' as const,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: IronManTheme.glow.greenStrong,
    opacity: 0.2,
  },
  glowMiddle: {
    position: 'absolute' as const,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: IronManTheme.glow.green,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#000',
    borderWidth: 3,
    borderColor: IronManTheme.jarvisGreen,
    shadowColor: IronManTheme.jarvisGreen,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchable: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 40,
    zIndex: 1000,
  },
  innerCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(124, 252, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124, 252, 0, 0.2)',
  },
});
