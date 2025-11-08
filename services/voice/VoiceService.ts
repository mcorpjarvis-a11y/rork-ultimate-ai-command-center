import * as Speech from 'expo-speech';
import AudioModule from 'expo-audio/build/AudioModule';
import type { AudioRecorder } from 'expo-audio';
import { RecordingPresets } from 'expo-audio';
import { Platform } from 'react-native';
import { AI_CONFIG } from '@/config/api.config';

export interface VoiceSettings {
  enabled: boolean;
  voice: string; // Fixed to JARVIS voice, not user-configurable
  pitch: number;
  rate: number;
  volume: number;
  language: string;
}

export interface TranscriptionResult {
  text: string;
  confidence?: number;
  language: string;
}

class VoiceService {
  private recording: AudioRecorder | null = null;
  private isRecording: boolean = false;
  // JARVIS voice configuration - optimized for natural, human-like British male voice
  // These settings create a voice as close as possible to the Iron Man JARVIS
  private settings: VoiceSettings = {
    enabled: true,
    voice: 'com.apple.voice.compact.en-GB.Daniel', // British male voice (iOS)
    pitch: 0.95, // Slightly lower for more authoritative, calm tone
    rate: 1.05, // Slightly faster for intelligent, efficient speech
    volume: 1.0,
    language: 'en-GB', // British English like JARVIS
  };

  async initialize(): Promise<void> {
    if (Platform.OS !== 'web') {
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      if (!granted) {
        throw new Error('Audio permission not granted');
      }
      await AudioModule.setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });
    }
  }

  async speak(text: string, options?: Partial<VoiceSettings>): Promise<void> {
    if (!this.settings.enabled) {
      console.log('[VoiceService] Speech disabled');
      return;
    }

    // JARVIS voice is fixed - using British male voice for authentic JARVIS experience
    const speechOptions = {
      voice: this.settings.voice, // Always use JARVIS voice, ignore options
      pitch: options?.pitch || this.settings.pitch,
      rate: options?.rate || this.settings.rate,
      volume: options?.volume || this.settings.volume,
      language: this.settings.language, // Always British English
    };

    console.log('[VoiceService] JARVIS speaking:', text.substring(0, 50));

    if (Platform.OS === 'web') {
      // For web, use British English with best available voice
      await Speech.speak(text, {
        language: 'en-GB',
        pitch: speechOptions.pitch,
        rate: speechOptions.rate,
        // On web, we can't specify exact voice, but browser will pick best British male voice
      });
    } else {
      // For iOS/Android, use specific voice identifier
      const nativeOptions: any = {
        language: speechOptions.language,
        pitch: speechOptions.pitch,
        rate: speechOptions.rate,
        volume: speechOptions.volume,
      };

      // On Android, try to use a high-quality British male voice
      if (Platform.OS === 'android') {
        nativeOptions.voice = 'en-gb-x-rjs#male_2-local'; // Google TTS British male voice
      } else if (Platform.OS === 'ios') {
        nativeOptions.voice = 'com.apple.voice.compact.en-GB.Daniel'; // iOS British male voice
      }

      await Speech.speak(text, nativeOptions);
    }
  }

  async stop(): Promise<void> {
    await Speech.stop();
  }

  async startRecording(): Promise<void> {
    if (this.isRecording) {
      console.log('[VoiceService] Already recording');
      return;
    }

    console.log('[VoiceService] Starting recording');

    if (Platform.OS === 'web') {
      console.log('[VoiceService] Web recording not yet implemented');
      throw new Error('Web recording not yet implemented');
    }

    try {
      await AudioModule.setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      this.recording = new AudioModule.AudioRecorder(RecordingPresets.HIGH_QUALITY);
      await this.recording.prepareToRecordAsync();
      this.recording.record();

      this.isRecording = true;
      console.log('[VoiceService] Recording started');
    } catch (error) {
      console.error('[VoiceService] Failed to start recording:', error);
      throw error;
    }
  }

  async stopRecording(): Promise<string | null> {
    if (!this.isRecording || !this.recording) {
      console.log('[VoiceService] Not recording');
      return null;
    }

    console.log('[VoiceService] Stopping recording');

    try {
      await this.recording.stop();
      const uri = this.recording.uri;
      this.recording = null;
      this.isRecording = false;

      if (Platform.OS !== 'web') {
        await AudioModule.setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
        });
      }

      console.log('[VoiceService] Recording stopped, URI:', uri);
      return uri;
    } catch (error) {
      console.error('[VoiceService] Failed to stop recording:', error);
      throw error;
    }
  }

  async transcribe(audioUri: string): Promise<TranscriptionResult> {
    console.log('[VoiceService] Transcribing audio:', audioUri);

    try {
      const formData = new FormData();

      if (Platform.OS === 'web') {
        const response = await fetch(audioUri);
        const blob = await response.blob();
        formData.append('audio', blob, 'recording.wav');
      } else {
        const uriParts = audioUri.split('.');
        const fileType = uriParts[uriParts.length - 1];

        formData.append('audio', {
          uri: audioUri,
          name: `recording.${fileType}`,
          type: `audio/${fileType}`,
        } as any);
      }

      formData.append('language', this.settings.language);

      const response = await fetch(AI_CONFIG.toolkit.sttURL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Transcription failed: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('[VoiceService] Transcription result:', result);

      return {
        text: result.text,
        language: result.language || this.settings.language,
      };
    } catch (error) {
      console.error('[VoiceService] Transcription error:', error);
      throw error;
    }
  }

  async getAvailableVoices(): Promise<Speech.Voice[]> {
    if (Platform.OS === 'web') {
      return [];
    }
    const voices = await Speech.getAvailableVoicesAsync();
    return voices;
  }

  updateSettings(settings: Partial<VoiceSettings>): void {
    // Voice and language are fixed for JARVIS - only allow updating volume, pitch, rate, enabled
    const allowedSettings = {
      enabled: settings.enabled,
      pitch: settings.pitch,
      rate: settings.rate,
      volume: settings.volume,
    };
    
    // Filter out undefined values
    const filteredSettings = Object.fromEntries(
      Object.entries(allowedSettings).filter(([_, v]) => v !== undefined)
    );
    
    this.settings = { ...this.settings, ...filteredSettings };
    console.log('[VoiceService] JARVIS voice settings updated (voice/language locked):', this.settings);
  }

  getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  getIsRecording(): boolean {
    return this.isRecording;
  }

  async isSpeaking(): Promise<boolean> {
    return await Speech.isSpeakingAsync();
  }
}

export const voiceService = new VoiceService();
export default voiceService;
