import * as Speech from 'expo-speech';
import AudioModule from 'expo-audio/build/AudioModule';
import type { AudioRecorder, AudioPlayer } from 'expo-audio';
import { RecordingPresets } from 'expo-audio';
import { Platform } from 'react-native';
import { AI_CONFIG } from '@/config/api.config';

export interface VoiceSettings {
  enabled: boolean;
  voice: string;
  rate: number;
  pitch: number;
  language: string;
  autoSpeak: boolean;
  useGoogleCloudTTS: boolean;
  googleVoiceName: string;
}

class JarvisVoiceService {
  private static instance: JarvisVoiceService;
  private recording: AudioRecorder | null = null;
  // JARVIS voice configuration - optimized for natural, human-like British male voice
  // These settings create a voice as close as possible to the Iron Man JARVIS
  private settings: VoiceSettings = {
    enabled: true,
    voice: 'com.apple.voice.compact.en-GB.Daniel', // British male voice (iOS)
    rate: 1.05, // Slightly faster for intelligent, efficient speech
    pitch: 0.95, // Slightly lower for more authoritative, calm tone
    language: 'en-GB', // British English like JARVIS
    autoSpeak: true,
    useGoogleCloudTTS: false, // Disabled by default, can be enabled for even more natural voice
    googleVoiceName: 'en-GB-Neural2-D', // Google Cloud Neural2 British male voice (most natural)
  };

  private constructor() {
    this.initializeAudio();
  }

  static getInstance(): JarvisVoiceService {
    if (!JarvisVoiceService.instance) {
      JarvisVoiceService.instance = new JarvisVoiceService();
    }
    return JarvisVoiceService.instance;
  }

  private async initializeAudio(): Promise<void> {
    try {
      if (Platform.OS !== 'web') {
        await AudioModule.requestRecordingPermissionsAsync();
        await AudioModule.setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
        });
      }
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  async speak(text: string, options?: Partial<VoiceSettings>): Promise<void> {
    if (!this.settings.enabled && !options?.enabled) {
      return;
    }

    try {
      const isSpeaking = await Speech.isSpeakingAsync();
      if (isSpeaking) {
        await Speech.stop();
      }

      // Try to use Google Cloud TTS if enabled and available for most natural voice
      if ((options?.useGoogleCloudTTS || this.settings.useGoogleCloudTTS)) {
        try {
          await this.speakWithGoogleCloud(text, options);
          return;
        } catch (googleError) {
          console.warn('[JARVIS] Google Cloud TTS failed, falling back to native voice:', googleError);
        }
      }

      // Use native voice with JARVIS-optimized settings
      const voiceOptions: Speech.SpeechOptions = {
        language: this.settings.language, // Always British English
        pitch: options?.pitch || this.settings.pitch,
        rate: options?.rate || this.settings.rate,
        onDone: () => {
          console.log('[JARVIS] Finished speaking');
        },
        onError: (error) => {
          console.error('[JARVIS] Speech error:', error);
        },
      };

      // Platform-specific voice selection for most natural JARVIS-like voice
      if (Platform.OS === 'ios') {
        // iOS: Use high-quality Daniel voice (British male)
        (voiceOptions as any).voice = 'com.apple.voice.compact.en-GB.Daniel';
      } else if (Platform.OS === 'android') {
        // Android: Use Google TTS British male voice
        (voiceOptions as any).voice = 'en-gb-x-rjs#male_2-local';
      }
      // Web will use browser's default British English voice

      Speech.speak(text, voiceOptions);
    } catch (error) {
      console.error('[JARVIS] Failed to speak:', error);
    }
  }

  private async speakWithGoogleCloud(text: string, options?: Partial<VoiceSettings>): Promise<void> {
    // This uses the JARVIS toolkit endpoint which provides Google Cloud TTS integration
    // Google Cloud Neural2 voices provide the most natural, human-like speech
    // en-GB-Neural2-D is a British male voice that sounds very close to JARVIS
    const voiceName = options?.googleVoiceName || this.settings.googleVoiceName;
    
    try {
      const response = await fetch(AI_CONFIG.toolkit.ttsURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          languageCode: 'en-GB',
          voiceName: voiceName, // Neural2-D for most natural voice
          audioEncoding: 'MP3',
          pitch: this.settings.pitch,
          speakingRate: this.settings.rate,
        }),
      });

      if (!response.ok) {
        throw new Error('Google Cloud TTS request failed');
      }

      const audioData = await response.json();
      
      // Play the audio using expo-audio
      const player = new AudioModule.AudioPlayer({ uri: audioData.audioContent }, 0, false);
      player.play();
      
      console.log('[JARVIS] Spoke using Google Cloud Neural2 TTS (most natural voice)');
    } catch (error) {
      console.error('[JARVIS] Google Cloud TTS error:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      await Speech.stop();
    } catch (error) {
      console.error('Failed to stop speech:', error);
    }
  }

  async startListening(): Promise<void> {
    if (Platform.OS === 'web') {
      await this.startWebListening();
    } else {
      await this.startNativeListening();
    }
  }

  private async startWebListening(): Promise<void> {
    if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window)) {
      console.warn('Speech recognition not available on this platform');
      return;
    }

    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = this.settings.language;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('[JARVIS] Heard:', transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('[JARVIS] Recognition error:', event.error);
      };

      recognition.start();
    } catch (error) {
      console.error('Failed to start web listening:', error);
    }
  }

  private async startNativeListening(): Promise<void> {
    try {
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      if (!granted) {
        console.warn('Microphone permission not granted');
        return;
      }

      await AudioModule.setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      this.recording = new AudioModule.AudioRecorder(RecordingPresets.HIGH_QUALITY);
      await this.recording.prepareToRecordAsync();
      this.recording.record();
      console.log('[JARVIS] Recording started');
    } catch (error) {
      console.error('Failed to start native listening:', error);
    }
  }

  async stopListening(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return null;
    }

    try {
      if (!this.recording) {
        return null;
      }

      await this.recording.stop();
      const uri = this.recording.uri;
      this.recording = null;

      await AudioModule.setAudioModeAsync({
        allowsRecording: false,
      });

      console.log('[JARVIS] Recording stopped:', uri);
      return uri;
    } catch (error) {
      console.error('Failed to stop listening:', error);
      return null;
    }
  }

  updateSettings(settings: Partial<VoiceSettings>): void {
    // Voice and language are locked to JARVIS - only allow fine-tuning of delivery
    const allowedSettings = {
      enabled: settings.enabled,
      rate: settings.rate,
      pitch: settings.pitch,
      autoSpeak: settings.autoSpeak,
      useGoogleCloudTTS: settings.useGoogleCloudTTS,
    };
    
    // Filter out undefined values
    const filteredSettings = Object.fromEntries(
      Object.entries(allowedSettings).filter(([_, v]) => v !== undefined)
    );
    
    this.settings = { ...this.settings, ...filteredSettings };
    console.log('[JARVIS] Voice settings updated (voice/language locked to British male)');
  }

  getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  async getAvailableVoices(): Promise<Speech.Voice[]> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      return voices;
    } catch (error) {
      console.error('Failed to get available voices:', error);
      return [];
    }
  }

  speakGreeting(): void {
    const greetings = [
      'Good day, sir. JARVIS at your service.',
      'Hello, sir. All systems operational.',
      'Greetings, sir. Ready to assist.',
      'Good to see you, sir. How may I help?',
      'Welcome back, sir. Standing by.',
      'At your service, sir. How may I be of assistance?',
    ];
    
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    this.speak(greeting);
  }

  speakConfirmation(): void {
    const confirmations = [
      'Right away, sir.',
      'Consider it done, sir.',
      'On it, sir.',
      'Immediately, sir.',
      'Processing now, sir.',
      'As you wish, sir.',
      'Very good, sir.',
    ];
    
    const confirmation = confirmations[Math.floor(Math.random() * confirmations.length)];
    this.speak(confirmation);
  }

  speakMetrics(metrics: { revenue: number; profit: number; roi: number }): void {
    const text = `Current performance metrics: Revenue is $${metrics.revenue.toFixed(0)}, profit is $${metrics.profit.toFixed(0)}, with an ROI of ${metrics.roi.toFixed(1)} times.`;
    this.speak(text);
  }

  speakOpportunity(title: string, revenue: number): void {
    const text = `Sir, I've identified a new opportunity: ${title}. Projected revenue is $${revenue.toFixed(0)}. Awaiting your approval.`;
    this.speak(text);
  }

  speakAlert(message: string): void {
    const text = `Alert: ${message}`;
    this.speak(text, { rate: 1.1 });
  }
}

export default JarvisVoiceService.getInstance();
