import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

export interface VoiceSettings {
  enabled: boolean;
  voice: string;
  rate: number;
  pitch: number;
  language: string;
  autoSpeak: boolean;
}

class JarvisVoiceService {
  private static instance: JarvisVoiceService;
  private recording: Audio.Recording | null = null;
  private settings: VoiceSettings = {
    enabled: true,
    voice: 'com.apple.speech.synthesis.voice.daniel',
    rate: 1.0,
    pitch: 1.0,
    language: 'en-US',
    autoSpeak: true,
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
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      }
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  async speak(text: string, options?: Partial<VoiceSettings>): Promise<void> {
    if (!this.settings.enabled && !options?.enabled) {
      console.log('[JARVIS] Voice disabled, not speaking');
      return;
    }

    try {
      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      }

      const isSpeaking = await Speech.isSpeakingAsync();
      if (isSpeaking) {
        console.log('[JARVIS] Stopping current speech');
        await Speech.stop();
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      console.log('[JARVIS] Starting to speak:', text.substring(0, 100));

      const voiceOptions: Speech.SpeechOptions = {
        language: options?.language || this.settings.language,
        pitch: options?.pitch || this.settings.pitch,
        rate: options?.rate || this.settings.rate,
        volume: 1.0,
        voice: Platform.OS === 'ios' ? (options?.voice || this.settings.voice) : undefined,
        onDone: () => {
          console.log('[JARVIS] ===== Speech completed =====');
        },
        onStopped: () => {
          console.log('[JARVIS] Speech stopped');
        },
        onError: (error) => {
          console.error('[JARVIS] ===== Speech error =====', error);
        },
      };

      await Speech.speak(text, voiceOptions);
      console.log('[JARVIS] Speech.speak() executed');
    } catch (error) {
      console.error('[JARVIS] Failed to speak:', error);
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
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Microphone permission not granted');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });

      await recording.startAsync();
      this.recording = recording;
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

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      console.log('[JARVIS] Recording stopped:', uri);
      return uri;
    } catch (error) {
      console.error('Failed to stop listening:', error);
      return null;
    }
  }

  updateSettings(settings: Partial<VoiceSettings>): void {
    this.settings = { ...this.settings, ...settings };
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
    ];
    
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    this.speak(greeting);
  }

  speakConfirmation(): void {
    const confirmations = [
      'Right away, sir.',
      'Consider it done.',
      'On it, sir.',
      'Immediately, sir.',
      'Processing now.',
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
