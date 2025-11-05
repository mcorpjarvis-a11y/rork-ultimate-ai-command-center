import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import JarvisVoiceService from './JarvisVoiceService.js';
import JarvisGuidanceService from './JarvisGuidanceService.js';
import JarvisPersonality from './personality/JarvisPersonality.js';
import AIService from './ai/AIService.js';
import FreeAIService from './ai/FreeAIService.js';

export interface ListenerConfig {
  enabled: boolean;
  language: string;
  wakeWord: string;
  autoRespond: boolean;
  continuous: boolean;
  wakeWordConfidenceThreshold: number;
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
  private isSpeaking: boolean = false;
  private continuousMode: boolean = false;
  private config: ListenerConfig = {
    enabled: true,
    language: 'en-US',
    wakeWord: 'jarvis',
    autoRespond: true,
    continuous: false,
    wakeWordConfidenceThreshold: 0.7,
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
      if (!this.config.continuous) {
        await JarvisVoiceService.speak('Listening, sir.');
      }
      
    } catch (error) {
      console.error('[JarvisListener] Failed to start listening:', error);
      this.isListening = false;
      throw error;
    }
  }

  async startContinuousListening(): Promise<void> {
    if (this.continuousMode) {
      console.log('[JarvisListener] Continuous mode already active');
      return;
    }

    console.log('[JarvisListener] Starting continuous listening for wake word...');
    this.continuousMode = true;
    this.config.continuous = true;
    
    await JarvisVoiceService.speak('Continuous listening activated, sir. I will respond when you say Jarvis.');
    
    // Start the continuous listening loop
    this.runContinuousLoop();
  }

  private async runContinuousLoop(): Promise<void> {
    while (this.continuousMode && this.config.enabled) {
      try {
        // Don't listen while speaking to avoid self-triggering
        if (this.isSpeaking) {
          await new Promise(resolve => setTimeout(resolve, 500));
          continue;
        }

        console.log('[JarvisListener] Listening for wake word...');
        
        if (Platform.OS === 'web') {
          await this.listenForWakeWordWeb();
        } else {
          await this.listenForWakeWordNative();
        }

        // Small delay before next iteration
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('[JarvisListener] Error in continuous loop:', error);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log('[JarvisListener] Continuous listening stopped');
  }

  async stopContinuousListening(): Promise<void> {
    console.log('[JarvisListener] Stopping continuous listening...');
    this.continuousMode = false;
    this.config.continuous = false;
    
    if (this.recording) {
      await this.stopListening();
    }
    
    await JarvisVoiceService.speak('Continuous listening deactivated, sir.');
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
      
      // Auto-restart if in continuous mode
      if (this.continuousMode) {
        setTimeout(() => this.startWebListening(), 1000);
      }
    };

    recognition.onend = () => {
      console.log('[JarvisListener] Web recognition ended');
      this.isListening = false;
      
      // Auto-restart if in continuous mode
      if (this.continuousMode) {
        setTimeout(() => this.startWebListening(), 500);
      }
    };

    recognition.start();
  }

  private async listenForWakeWordWeb(): Promise<void> {
    if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window)) {
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = this.config.language;

    return new Promise((resolve) => {
      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        const confidence = event.results[0][0].confidence;

        console.log('[JarvisListener] Detected:', transcript);

        if (transcript.includes(this.config.wakeWord) && confidence >= this.config.wakeWordConfidenceThreshold) {
          console.log('[JarvisListener] Wake word detected!');
          await this.handleWakeWordDetected();
        }
        resolve();
      };

      recognition.onerror = () => {
        resolve();
      };

      recognition.onend = () => {
        resolve();
      };

      recognition.start();
    });
  }

  private async listenForWakeWordNative(): Promise<void> {
    try {
      // Set up short recording for wake word detection (3 seconds)
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
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
          audioQuality: Audio.IOSAudioQuality.MEDIUM,
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

      await recording.startAsync();
      
      // Record for 3 seconds
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (uri) {
        const transcription = await this.transcribeAudio(uri);
        if (transcription && transcription.text.toLowerCase().includes(this.config.wakeWord)) {
          if (!transcription.confidence || transcription.confidence >= this.config.wakeWordConfidenceThreshold) {
            console.log('[JarvisListener] Wake word detected!');
            await this.handleWakeWordDetected();
          }
        }
      }
    } catch (error) {
      console.error('[JarvisListener] Wake word detection error:', error);
    }
  }

  private async handleWakeWordDetected(): Promise<void> {
    console.log('[JarvisListener] Processing wake word activation...');
    
    // Acknowledge wake word
    this.isSpeaking = true;
    await JarvisVoiceService.speak('Yes, sir?');
    this.isSpeaking = false;
    
    // Now listen for the actual command with full recognition
    await this.listenForFullCommand();
  }

  private async listenForFullCommand(): Promise<void> {
    console.log('[JarvisListener] Listening for full command...');
    
    try {
      if (Platform.OS === 'web') {
        await this.captureFullCommandWeb();
      } else {
        await this.captureFullCommandNative();
      }
    } catch (error) {
      console.error('[JarvisListener] Failed to capture command:', error);
      this.isSpeaking = true;
      await JarvisVoiceService.speak('My apologies, sir. I did not catch that.');
      this.isSpeaking = false;
    }
  }

  private async captureFullCommandWeb(): Promise<void> {
    if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window)) {
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = this.config.language;

    return new Promise((resolve) => {
      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;

        const result: TranscriptionResult = {
          text: transcript,
          confidence,
          timestamp: Date.now(),
        };

        await this.processTranscription(result);
        resolve();
      };

      recognition.onerror = () => {
        resolve();
      };

      recognition.onend = () => {
        resolve();
      };

      recognition.start();
    });
  }

  private async captureFullCommandNative(): Promise<void> {
    try {
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
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

      await recording.startAsync();
      
      // Record for up to 10 seconds for the full command
      await new Promise(resolve => setTimeout(resolve, 10000));
      
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (uri) {
        const transcription = await this.transcribeAudio(uri);
        if (transcription) {
          await this.processTranscription(transcription);
        }
      }
    } catch (error) {
      console.error('[JarvisListener] Full command capture error:', error);
      throw error;
    }
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
        // Generate AI-powered response using available services
        responseText = await this.generateAIResponse(userInput);
      }

      // Update conversation memory with the response
      const recentMemories = JarvisPersonality.getRecentMemories(1);
      if (recentMemories.length > 0) {
        recentMemories[0].jarvisResponse = responseText;
      }

      // Speak the response if auto-respond is enabled
      if (this.config.autoRespond) {
        this.isSpeaking = true;
        await JarvisVoiceService.speak(responseText);
        this.isSpeaking = false;
      }

      console.log('[JarvisListener] Response generated and spoken');

    } catch (error) {
      console.error('[JarvisListener] Failed to process transcription:', error);
      this.isSpeaking = true;
      await JarvisVoiceService.speak('My apologies, sir. I encountered an error processing your request.');
      this.isSpeaking = false;
    }
  }

  private async generateAIResponse(userInput: string): Promise<string> {
    try {
      console.log('[JarvisListener] Generating AI response for:', userInput);

      // First try to use the free AI services (Groq, HuggingFace, etc.)
      try {
        const aiResponse = await FreeAIService.generateText(userInput, {
          maxTokens: 500,
          temperature: 0.7,
        });
        
        if (aiResponse && aiResponse.trim()) {
          console.log('[JarvisListener] AI response generated via FreeAIService');
          return this.formatJarvisResponse(aiResponse);
        }
      } catch (freeAIError) {
        console.warn('[JarvisListener] FreeAIService failed, trying AIService:', freeAIError);
      }

      // Fallback to the main AIService (which may use Gemini or other paid services)
      try {
        const aiResponse = await AIService.generateText(userInput, {
          cache: false,
          maxTokens: 500,
        });
        
        if (aiResponse && aiResponse.trim()) {
          console.log('[JarvisListener] AI response generated via AIService');
          return this.formatJarvisResponse(aiResponse);
        }
      } catch (aiError) {
        console.warn('[JarvisListener] AIService failed, using fallback:', aiError);
      }

      // Final fallback: Use personality-based contextual response
      return await this.generateContextualResponse(userInput);
      
    } catch (error) {
      console.error('[JarvisListener] All AI services failed:', error);
      return await this.generateContextualResponse(userInput);
    }
  }

  private formatJarvisResponse(aiResponse: string): string {
    // Format the AI response to sound more like Jarvis
    let response = aiResponse.trim();
    
    // Remove any existing "sir" references to avoid duplication
    response = response.replace(/,?\s*sir[,.]?\s*/gi, ' ').trim();
    
    // Add Jarvis-style formality if not already present
    const formalPhrases = ['certainly', 'of course', 'indeed', 'absolutely', 'right away'];
    const hasFormalPhrase = formalPhrases.some(phrase => 
      response.toLowerCase().includes(phrase)
    );
    
    // Add "sir" at the end if the response doesn't already sound formal
    if (!hasFormalPhrase && JarvisPersonality.shouldUseFormalTitle()) {
      response = response + ', sir.';
    } else if (!response.endsWith('.') && !response.endsWith('!') && !response.endsWith('?')) {
      response = response + '.';
    }
    
    return response;
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

  async toggleContinuousListening(): Promise<void> {
    if (this.continuousMode) {
      await this.stopContinuousListening();
    } else {
      await this.startContinuousListening();
    }
  }

  isContinuousMode(): boolean {
    return this.continuousMode;
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
