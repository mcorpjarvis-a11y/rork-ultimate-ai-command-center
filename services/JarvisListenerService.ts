import AudioModule from 'expo-audio/build/AudioModule';
import type { AudioRecorder } from 'expo-audio';
import { RecordingPresets } from 'expo-audio';
import { Platform } from 'react-native';
import JarvisVoiceService from './JarvisVoiceService';
import JarvisGuidanceService from './JarvisGuidanceService';
import JarvisPersonality from './personality/JarvisPersonality';
import AIService from './ai/AIService';
import FreeAIService from './ai/FreeAIService';
import { AI_CONFIG } from '@/config/api.config';

export interface ListenerConfig {
  enabled: boolean;
  language: string;
  wakeWord: string;
  autoRespond: boolean;
  continuous: boolean;
  wakeWordConfidenceThreshold: number;
  wakeWordListenDuration: number; // milliseconds for wake word detection buffer
  commandListenDuration: number; // milliseconds for full command capture
}

export interface TranscriptionResult {
  text: string;
  confidence?: number;
  timestamp: number;
}

class JarvisListenerService {
  private static instance: JarvisListenerService;
  private recording: AudioRecorder | null = null;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;
  private continuousMode: boolean = false;
  // JARVIS wake word configuration
  private config: ListenerConfig = {
    enabled: true,
    language: 'en-US', // Changed to US for better wake word detection
    wakeWord: 'jarvis',
    autoRespond: true, // Always respond when JARVIS is called
    continuous: false,
    wakeWordConfidenceThreshold: 0.6, // Lowered for better detection (was 0.7)
    wakeWordListenDuration: 3000, // 3 seconds for wake word detection
    commandListenDuration: 10000, // 10 seconds for full command
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
        const { granted } = await AudioModule.requestRecordingPermissionsAsync();
        if (!granted) {
          console.warn('[JarvisListener] Microphone permission not granted');
          return;
        }

        await AudioModule.setAudioModeAsync({
          allowsRecording: true,
          playsInSilentMode: true,
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

  private isSTTConfigured(): boolean {
    const sttURL = AI_CONFIG.toolkit.sttURL;
    
    // Check if it's the default placeholder URL
    if (sttURL.includes('toolkit.jarvis.ai')) {
      return false;
    }
    
    // Check if it's empty or undefined
    if (!sttURL || sttURL.trim() === '') {
      return false;
    }
    
    // Validate it's a proper URL
    try {
      new URL(sttURL);
      return true;
    } catch {
      return false;
    }
  }

  async startContinuousListening(): Promise<void> {
    if (this.continuousMode) {
      console.log('[JarvisListener] Continuous mode already active');
      return;
    }

    // Check if on Web platform where we can use Web Speech API
    if (Platform.OS === 'web') {
      console.log('[JarvisListener] Starting continuous listening for wake word...');
      this.continuousMode = true;
      this.config.continuous = true;
      
      await JarvisVoiceService.speak('Continuous listening activated, sir. I will respond when you say Jarvis.');
      
      // Start the continuous listening loop
      this.runContinuousLoop();
      return;
    }

    // For native platforms, check if STT is configured
    if (!this.isSTTConfigured()) {
      console.warn('[JarvisListener] Continuous listening requires STT endpoint configuration');
      await JarvisVoiceService.speak('My apologies, sir. Continuous listening requires Speech-to-Text configuration. Please configure EXPO_PUBLIC_STT_URL in your environment.');
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
    // Check if we should actually run continuous mode
    const canUseContinuous = Platform.OS === 'web' || this.isSTTConfigured();

    if (!canUseContinuous) {
      console.warn('[JarvisListener] Cannot run continuous mode without STT configuration');
      this.continuousMode = false;
      return;
    }

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

        console.log('[JarvisListener] Detected:', transcript, 'Confidence:', confidence);

        // Check for wake word with variations and flexible matching
        if (this.isWakeWordDetected(transcript) && confidence >= this.config.wakeWordConfidenceThreshold) {
          console.log('[JarvisListener] ✅ JARVIS wake word confirmed!');
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
      this.recording = new AudioModule.AudioRecorder(RecordingPresets.HIGH_QUALITY);
      await this.recording.prepareToRecordAsync();
      this.recording.record();
      
      // Record for configured wake word duration
      await new Promise(resolve => setTimeout(resolve, this.config.wakeWordListenDuration));
      
      await this.recording.stop();
      const uri = this.recording.uri;
      this.recording = null;

      if (uri) {
        const transcription = await this.transcribeAudio(uri);
        if (transcription) {
          const transcript = transcription.text.toLowerCase();
          
          // Check for wake word with variations
          if (this.isWakeWordDetected(transcript)) {
            if (!transcription.confidence || transcription.confidence >= this.config.wakeWordConfidenceThreshold) {
              console.log('[JarvisListener] ✅ JARVIS wake word confirmed!');
              await this.handleWakeWordDetected();
            }
          }
        }
      }
    } catch (error) {
      console.error('[JarvisListener] Wake word detection error:', error);
    }
  }

  private async handleWakeWordDetected(): Promise<void> {
    console.log('[JarvisListener] JARVIS wake word detected! Activating...');
    
    // Acknowledge wake word - JARVIS always responds when called
    this.isSpeaking = true;
    
    // Randomly choose from authentic JARVIS acknowledgments
    const acknowledgments = [
      'Yes, sir?',
      'At your service, sir.',
      'How may I help you, sir?',
      'I\'m here, sir.',
      'Yes, sir. I\'m listening.',
      'Ready, sir.',
    ];
    
    const acknowledgment = acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
    await JarvisVoiceService.speak(acknowledgment);
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
      this.recording = new AudioModule.AudioRecorder(RecordingPresets.HIGH_QUALITY);
      await this.recording.prepareToRecordAsync();
      this.recording.record();
      
      // Record for configured command duration
      await new Promise(resolve => setTimeout(resolve, this.config.commandListenDuration));
      
      await this.recording.stop();
      const uri = this.recording.uri;
      this.recording = null;

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
      await AudioModule.setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      this.recording = new AudioModule.AudioRecorder(RecordingPresets.HIGH_QUALITY);
      await this.recording.prepareToRecordAsync();
      this.recording.record();
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

      await this.recording.stop();
      const uri = this.recording.uri;
      this.recording = null;
      this.isListening = false;

      await AudioModule.setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
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

      // Check if STT endpoint is configured and reachable
      if (!this.isSTTConfigured()) {
        console.warn('[JarvisListener] STT endpoint not configured. Please set up EXPO_PUBLIC_STT_URL in your .env file.');
        console.info('[JarvisListener] You can use OpenAI Whisper API, Google Speech-to-Text, or other STT services.');
        console.info('[JarvisListener] For now, using Web Speech API fallback when available.');
        
        // Provide helpful user guidance
        const sttGuidance = await JarvisGuidanceService.getSTTSetupGuidance();
        if (sttGuidance) {
          console.info('[JarvisListener] Setup guidance:', sttGuidance);
        }
        
        return null;
      }

      const sttURL = AI_CONFIG.toolkit.sttURL;

      // For Termux environment, use configured Speech-to-Text API
      // This could be Google Cloud Speech API, OpenAI Whisper, or custom endpoint
      const formData = new FormData();

      const uriParts = audioUri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      formData.append('audio', {
        uri: audioUri,
        name: `recording.${fileType}`,
        type: `audio/${fileType}`,
      } as any);

      formData.append('language', this.config.language);

      const response = await fetch(sttURL, {
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
      console.info('[JarvisListener] To enable voice transcription, configure a Speech-to-Text service in your .env file.');
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
    // Use word boundaries to only match complete 'sir' words
    response = response.replace(/\b,?\s*sir[,.]?\s*\b/gi, ' ').trim();
    
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

  /**
   * Check if wake word is detected with flexible matching
   * Handles common variations and pronunciation issues
   */
  private isWakeWordDetected(transcript: string): boolean {
    const lowerTranscript = transcript.toLowerCase().trim();
    
    // Direct match
    if (lowerTranscript.includes(this.config.wakeWord)) {
      return true;
    }
    
    // Common variations and mispronunciations of "jarvis"
    const variations = [
      'jarvis',
      'jarvas',
      'jarvus',
      'jarves',
      'jar vis',
      'jar-vis',
      'hey jarvis',
      'ok jarvis',
      'jarvis,',
      'jarvis.',
    ];
    
    for (const variation of variations) {
      if (lowerTranscript.includes(variation)) {
        console.log(`[JarvisListener] Matched wake word variation: "${variation}"`);
        return true;
      }
    }
    
    // Check if transcript starts with jarvis (even if followed by command)
    if (lowerTranscript.startsWith('jarvis ') || 
        lowerTranscript.startsWith('jarvis,') ||
        lowerTranscript.startsWith('hey jarvis') ||
        lowerTranscript.startsWith('ok jarvis')) {
      return true;
    }
    
    return false;
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
