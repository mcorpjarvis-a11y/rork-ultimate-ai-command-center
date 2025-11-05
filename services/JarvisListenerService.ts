import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import JarvisVoiceService from './JarvisVoiceService';
import JarvisGuidanceService from './JarvisGuidanceService';
import JarvisPersonality from './personality/JarvisPersonality';

export interface ListenerConfig {
  enabled: boolean;
  language: string;
  wakeWord?: string;
  autoRespond: boolean;
  continuous: boolean;
}

export interface TranscriptionResult {
  text: string;
  confidence?: number;
  timestamp: number;
}

class JarvisListenerService {
  private static instance: JarvisListenerService;
  private recording: Audio.Recording | null = null;
  private isListening: boolean = false;
  private config: ListenerConfig = {
    enabled: true,
    language: 'en-US',
    autoRespond: true,
    continuous: false,
  };

  private constructor() {
    this.initialize();
  }

  static getInstance(): JarvisListenerService {
    if (!JarvisListenerService.instance) {
      JarvisListenerService.instance = new JarvisListenerService();
    }
    return JarvisListenerService.instance;
  }

  private async initialize(): Promise<void> {
    try {
      console.log('[JarvisListener] Initializing listener service...');
      
      if (Platform.OS !== 'web') {
        const { status } = await Audio.requestPermissionsAsync();
        if (status !== 'granted') {
          console.warn('[JarvisListener] Microphone permission not granted');
          return;
        }

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
        });
      }

      console.log('[JarvisListener] Listener service initialized successfully');
    } catch (error) {
      console.error('[JarvisListener] Failed to initialize:', error);
    }
  }

  async startListening(): Promise<void> {
    if (this.isListening) {
      console.log('[JarvisListener] Already listening');
      return;
    }

    if (!this.config.enabled) {
      console.log('[JarvisListener] Listener is disabled');
      return;
    }

    try {
      console.log('[JarvisListener] Starting to listen...');

      if (Platform.OS === 'web') {
        await this.startWebListening();
      } else {
        await this.startNativeListening();
      }

      this.isListening = true;
      
      // Provide audio feedback that we're listening
      await JarvisVoiceService.speak('Listening, sir.');
      
    } catch (error) {
      console.error('[JarvisListener] Failed to start listening:', error);
      this.isListening = false;
      throw error;
    }
  }

  private async startWebListening(): Promise<void> {
    if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window)) {
      throw new Error('Speech recognition not available in this browser');
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = this.config.continuous;
    recognition.interimResults = false;
    recognition.lang = this.config.language;

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;

      console.log('[JarvisListener] Heard:', transcript, `(${(confidence * 100).toFixed(1)}%)`);

      const result: TranscriptionResult = {
        text: transcript,
        confidence,
        timestamp: Date.now(),
      };

      await this.processTranscription(result);
    };

    recognition.onerror = (event: any) => {
      console.error('[JarvisListener] Web recognition error:', event.error);
      this.isListening = false;
    };

    recognition.onend = () => {
      console.log('[JarvisListener] Web recognition ended');
      this.isListening = false;
    };

    recognition.start();
  }

  private async startNativeListening(): Promise<void> {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
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

      await this.recording.startAsync();
      console.log('[JarvisListener] Native recording started');
    } catch (error) {
      console.error('[JarvisListener] Failed to start native recording:', error);
      throw error;
    }
  }

  async stopListening(): Promise<TranscriptionResult | null> {
    if (!this.isListening) {
      console.log('[JarvisListener] Not currently listening');
      return null;
    }

    try {
      console.log('[JarvisListener] Stopping listener...');

      if (Platform.OS === 'web') {
        this.isListening = false;
        return null;
      }

      if (!this.recording) {
        this.isListening = false;
        return null;
      }

      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;
      this.isListening = false;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      console.log('[JarvisListener] Recording stopped, URI:', uri);

      if (uri) {
        const transcription = await this.transcribeAudio(uri);
        if (transcription) {
          await this.processTranscription(transcription);
          return transcription;
        }
      }

      return null;
    } catch (error) {
      console.error('[JarvisListener] Failed to stop listening:', error);
      this.isListening = false;
      return null;
    }
  }

  private async transcribeAudio(audioUri: string): Promise<TranscriptionResult | null> {
    try {
      console.log('[JarvisListener] Transcribing audio...');

      // For Termux environment, use Google Cloud Speech-to-Text API
      // You can also integrate with other STT services here
      const formData = new FormData();

      const uriParts = audioUri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      formData.append('audio', {
        uri: audioUri,
        name: `recording.${fileType}`,
        type: `audio/${fileType}`,
      } as any);

      formData.append('language', this.config.language);

      // TODO: Replace with your actual transcription endpoint
      // This could be Google Speech API, OpenAI Whisper, or custom endpoint
      const response = await fetch('https://toolkit.rork.com/stt/transcribe/', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('[JarvisListener] Transcription request failed:', response.statusText);
        return null;
      }

      const result = await response.json();
      console.log('[JarvisListener] Transcription successful:', result.text);

      return {
        text: result.text,
        confidence: result.confidence,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('[JarvisListener] Transcription error:', error);
      return null;
    }
  }

  private async processTranscription(result: TranscriptionResult): Promise<void> {
    try {
      console.log('[JarvisListener] Processing transcription:', result.text);

      const userInput = result.text.trim();
      
      if (!userInput) {
        console.log('[JarvisListener] Empty transcription, ignoring');
        return;
      }

      // Store conversation in personality memory
      await JarvisPersonality.storeConversation(
        userInput,
        '', // Will be filled after we generate response
        'voice-input',
        this.extractTopics(userInput)
      );

      // Check if user is asking about setup/configuration
      const intent = await JarvisGuidanceService.detectIntent(userInput);
      
      let responseText: string;

      if (intent && intent.isSetupQuery) {
        // User needs setup guidance
        const requirement = await JarvisGuidanceService.checkConfiguration(intent.feature);
        
        if (requirement) {
          responseText = JarvisGuidanceService.generateGuidanceResponse(requirement);
        } else {
          responseText = JarvisPersonality.generateResponse({
            type: 'confirmation',
            subject: `${intent.feature} is fully configured and ready, sir.`,
          });
        }
      } else {
        // Generate personalized response based on personality
        responseText = JarvisPersonality.generatePersonalizedResponse('voice-input', userInput);
        
        // If no custom response, provide a contextual reply
        if (!responseText || responseText === 'Acknowledged, sir.') {
          responseText = await this.generateContextualResponse(userInput);
        }
      }

      // Update conversation memory with the response
      const recentMemories = JarvisPersonality.getRecentMemories(1);
      if (recentMemories.length > 0) {
        recentMemories[0].jarvisResponse = responseText;
      }

      // Speak the response if auto-respond is enabled
      if (this.config.autoRespond) {
        await JarvisVoiceService.speak(responseText);
      }

      console.log('[JarvisListener] Response generated and spoken');

    } catch (error) {
      console.error('[JarvisListener] Failed to process transcription:', error);
      await JarvisVoiceService.speak('My apologies, sir. I encountered an error processing your request.');
    }
  }

  private extractTopics(text: string): string[] {
    const topics: string[] = [];
    const lowerText = text.toLowerCase();

    const topicKeywords: Record<string, string[]> = {
      'social': ['post', 'social', 'instagram', 'tiktok', 'youtube', 'twitter'],
      'content': ['generate', 'create', 'write', 'content', 'image'],
      'monetization': ['revenue', 'money', 'monetize', 'earn', 'profit'],
      'iot': ['device', 'printer', '3d', 'smart home', 'iot'],
      'analytics': ['analytics', 'stats', 'metrics', 'performance'],
      'code': ['code', 'debug', 'optimize', 'fix', 'improve'],
    };

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        topics.push(topic);
      }
    }

    return topics.length > 0 ? topics : ['general'];
  }

  private async generateContextualResponse(userInput: string): Promise<string> {
    const lowerInput = userInput.toLowerCase();

    // Greetings
    if (lowerInput.match(/\b(hello|hi|hey|greetings)\b/)) {
      return JarvisPersonality.generateResponse({ type: 'greeting' });
    }

    // Status check
    if (lowerInput.match(/\b(status|how are you|what's up)\b/)) {
      const stats = JarvisPersonality.getPersonalityStats();
      return `All systems operational, sir. I've stored ${stats.memoriesStored} memories, formed ${stats.opinionsFormed} opinions, and currently operating at ${stats.autonomyLevel}% autonomy.`;
    }

    // Capabilities inquiry
    if (lowerInput.match(/\b(what can you do|capabilities|help)\b/)) {
      return JarvisGuidanceService.generateCapabilityList();
    }

    // Thank you
    if (lowerInput.match(/\b(thank you|thanks|appreciate)\b/)) {
      return "My pleasure, sir. Always at your service.";
    }

    // Default acknowledgment with personality
    if (JarvisPersonality.shouldUseFormalTitle()) {
      return JarvisPersonality.generateResponse({
        type: 'confirmation',
        subject: 'I\'m processing that request now.',
      });
    }

    return 'Understood. How may I assist you further?';
  }

  updateConfig(updates: Partial<ListenerConfig>): void {
    this.config = { ...this.config, ...updates };
    console.log('[JarvisListener] Configuration updated:', this.config);
  }

  getConfig(): ListenerConfig {
    return { ...this.config };
  }

  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  async toggleListening(): Promise<void> {
    if (this.isListening) {
      await this.stopListening();
    } else {
      await this.startListening();
    }
  }

  async processCommand(command: string): Promise<string> {
    console.log('[JarvisListener] Processing direct command:', command);
    
    const result: TranscriptionResult = {
      text: command,
      timestamp: Date.now(),
    };

    await this.processTranscription(result);
    
    return 'Command processed successfully';
  }
}

export default JarvisListenerService.getInstance();
