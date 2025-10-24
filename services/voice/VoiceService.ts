import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

export interface VoiceSettings {
  enabled: boolean;
  voice: string;
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
  private recording: Audio.Recording | null = null;
  private isRecording: boolean = false;
  private settings: VoiceSettings = {
    enabled: true,
    voice: 'en-gb-x-rjs',
    pitch: 0.9,
    rate: 1.1,
    volume: 1.0,
    language: 'en-US',
  };

  async initialize(): Promise<void> {
    if (Platform.OS !== 'web') {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Audio permission not granted');
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
    }
  }

  async speak(text: string, options?: Partial<VoiceSettings>): Promise<void> {
    if (!this.settings.enabled) {
      console.log('[VoiceService] Speech disabled');
      return;
    }

    const speechOptions = {
      voice: options?.voice || this.settings.voice,
      pitch: options?.pitch || this.settings.pitch,
      rate: options?.rate || this.settings.rate,
      volume: options?.volume || this.settings.volume,
      language: options?.language || this.settings.language,
    };

    console.log('[VoiceService] Speaking:', text.substring(0, 50));

    if (Platform.OS === 'web') {
      await Speech.speak(text, {
        language: speechOptions.language,
        pitch: speechOptions.pitch,
        rate: speechOptions.rate,
      });
    } else {
      await Speech.speak(text, speechOptions);
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
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync({
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
          numberOfChannels: 2,
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

      this.recording = recording;
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
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;
      this.isRecording = false;

      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
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

      const response = await fetch('https://toolkit.rork.com/stt/transcribe/', {
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
    this.settings = { ...this.settings, ...settings };
    console.log('[VoiceService] Settings updated:', this.settings);
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
