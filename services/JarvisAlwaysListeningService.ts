/**
 * JARVIS Always-Listening Service
 * 
 * This service provides production-ready always-listening capability for wake word detection.
 * It uses:
 * - Web Speech API for web platforms (continuous recognition)
 * - expo-speech-recognition for native platforms (Android/iOS)
 * 
 * The service automatically starts on app launch and runs in the background,
 * listening for the wake word "Jarvis" to activate full command recognition.
 */

import { Platform } from 'react-native';
import JarvisVoiceService from './JarvisVoiceService.js';
import JarvisPersonality from './personality/JarvisPersonality.js';
import AIService from './ai/AIService.js';
import FreeAIService from './ai/FreeAIService.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import expo-speech-recognition for native platforms
let ExpoSpeechRecognition: any = null;
if (Platform.OS !== 'web') {
  try {
    ExpoSpeechRecognition = require('expo-speech-recognition');
  } catch (error) {
    console.warn('[AlwaysListening] expo-speech-recognition not available:', error);
  }
}

export interface AlwaysListeningConfig {
  enabled: boolean;
  wakeWord: string;
  autoStart: boolean; // Auto-start on app launch
  sensitivity: 'low' | 'medium' | 'high'; // Detection sensitivity
  language: string;
  commandTimeout: number; // Seconds to wait for command after wake word
}

interface RecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

class JarvisAlwaysListeningService {
  private static instance: JarvisAlwaysListeningService;
  private isActive: boolean = false;
  private isProcessingCommand: boolean = false;
  private recognition: any = null;
  private webRecognition: any = null;
  private commandTimeoutHandle: any = null;

  private config: AlwaysListeningConfig = {
    enabled: true,
    wakeWord: 'jarvis',
    autoStart: true,
    sensitivity: 'medium',
    language: 'en-US',
    commandTimeout: 10, // 10 seconds for command
  };

  private constructor() {
    this.loadConfig();
  }

  static getInstance(): JarvisAlwaysListeningService {
    if (!JarvisAlwaysListeningService.instance) {
      JarvisAlwaysListeningService.instance = new JarvisAlwaysListeningService();
    }
    return JarvisAlwaysListeningService.instance;
  }

  /**
   * Load configuration from storage
   */
  private async loadConfig(): Promise<void> {
    try {
      const storedConfig = await AsyncStorage.getItem('jarvis-always-listening-config');
      if (storedConfig) {
        this.config = { ...this.config, ...JSON.parse(storedConfig) };
      }
      console.log('[AlwaysListening] Configuration loaded:', this.config);
    } catch (error) {
      console.error('[AlwaysListening] Failed to load config:', error);
    }
  }

  /**
   * Save configuration to storage
   */
  private async saveConfig(): Promise<void> {
    try {
      await AsyncStorage.setItem('jarvis-always-listening-config', JSON.stringify(this.config));
      console.log('[AlwaysListening] Configuration saved');
    } catch (error) {
      console.error('[AlwaysListening] Failed to save config:', error);
    }
  }

  /**
   * Update configuration
   */
  async updateConfig(updates: Partial<AlwaysListeningConfig>): Promise<void> {
    this.config = { ...this.config, ...updates };
    await this.saveConfig();
    
    // Restart if already active
    if (this.isActive) {
      await this.stop();
      if (this.config.enabled) {
        await this.start();
      }
    }
  }

  /**
   * Start always-listening mode
   */
  async start(): Promise<boolean> {
    if (!this.config.enabled) {
      console.log('[AlwaysListening] Service is disabled in config');
      return false;
    }

    if (this.isActive) {
      console.log('[AlwaysListening] Already active');
      return true;
    }

    console.log('[AlwaysListening] Starting always-listening service...');

    try {
      if (Platform.OS === 'web') {
        await this.startWebListening();
      } else {
        await this.startNativeListening();
      }

      this.isActive = true;
      console.log('[AlwaysListening] ✅ Always-listening service started successfully');
      return true;
    } catch (error) {
      console.error('[AlwaysListening] Failed to start:', error);
      return false;
    }
  }

  /**
   * Stop always-listening mode
   */
  async stop(): Promise<void> {
    if (!this.isActive) {
      return;
    }

    console.log('[AlwaysListening] Stopping always-listening service...');

    if (this.commandTimeoutHandle) {
      clearTimeout(this.commandTimeoutHandle);
      this.commandTimeoutHandle = null;
    }

    if (Platform.OS === 'web' && this.webRecognition) {
      try {
        this.webRecognition.stop();
      } catch (error) {
        console.warn('[AlwaysListening] Error stopping web recognition:', error);
      }
      this.webRecognition = null;
    } else if (this.recognition && ExpoSpeechRecognition) {
      try {
        await ExpoSpeechRecognition.stop();
      } catch (error) {
        console.warn('[AlwaysListening] Error stopping native recognition:', error);
      }
      this.recognition = null;
    }

    this.isActive = false;
    this.isProcessingCommand = false;
    console.log('[AlwaysListening] Always-listening service stopped');
  }

  /**
   * Start web-based always-listening (using Web Speech API)
   */
  private async startWebListening(): Promise<void> {
    if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      throw new Error('Web Speech API not available in this browser');
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    this.webRecognition = new SpeechRecognition();

    // Configure for continuous listening
    this.webRecognition.continuous = true;
    this.webRecognition.interimResults = true; // Get partial results for faster wake word detection
    this.webRecognition.lang = this.config.language;
    this.webRecognition.maxAlternatives = 1;

    this.webRecognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript.toLowerCase().trim();
        const confidence = result[0].confidence;

        console.log('[AlwaysListening] Web heard:', transcript, `(confidence: ${(confidence * 100).toFixed(0)}%)`);

        // Check for wake word
        if (!this.isProcessingCommand && this.containsWakeWord(transcript)) {
          this.handleWakeWordDetected(transcript, confidence, result.isFinal);
        } else if (this.isProcessingCommand && result.isFinal) {
          this.handleCommand(transcript, confidence);
        }
      }
    };

    this.webRecognition.onerror = (event: any) => {
      console.error('[AlwaysListening] Web recognition error:', event.error);
      
      // Auto-restart on certain errors
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        setTimeout(() => {
          if (this.isActive) {
            console.log('[AlwaysListening] Auto-restarting web recognition...');
            try {
              this.webRecognition.start();
            } catch (error) {
              console.error('[AlwaysListening] Failed to restart:', error);
            }
          }
        }, 1000);
      }
    };

    this.webRecognition.onend = () => {
      console.log('[AlwaysListening] Web recognition ended');
      
      // Auto-restart if still active
      if (this.isActive && !this.isProcessingCommand) {
        setTimeout(() => {
          if (this.isActive) {
            console.log('[AlwaysListening] Auto-restarting web recognition...');
            try {
              this.webRecognition.start();
            } catch (error) {
              console.error('[AlwaysListening] Failed to restart:', error);
            }
          }
        }, 100);
      }
    };

    this.webRecognition.start();
    console.log('[AlwaysListening] Web Speech API started');
  }

  /**
   * Start native always-listening (using expo-speech-recognition)
   */
  private async startNativeListening(): Promise<void> {
    if (!ExpoSpeechRecognition) {
      throw new Error('expo-speech-recognition not available');
    }

    // Request permissions
    const { status, granted } = await ExpoSpeechRecognition.requestPermissionsAsync();
    
    if (!granted) {
      throw new Error('Speech recognition permission not granted');
    }

    console.log('[AlwaysListening] Speech recognition permission granted');

    // Check if recognition is available
    const available = await ExpoSpeechRecognition.isRecognitionAvailable();
    if (!available) {
      throw new Error('Speech recognition not available on this device');
    }

    // Get supported locales
    const locales = await ExpoSpeechRecognition.getSupportedLocales();
    console.log('[AlwaysListening] Supported locales:', locales);

    // Start continuous recognition
    await ExpoSpeechRecognition.start({
      lang: this.config.language,
      interimResults: true,
      maxAlternatives: 1,
      continuous: true,
      requiresOnDeviceRecognition: false,
      addsPunctuation: false,
      contextualStrings: [this.config.wakeWord], // Hint for better recognition
    });

    // Set up event listeners
    this.setupNativeListeners();

    console.log('[AlwaysListening] Native speech recognition started');
  }

  /**
   * Set up listeners for native speech recognition
   */
  private setupNativeListeners(): void {
    if (!ExpoSpeechRecognition) return;

    ExpoSpeechRecognition.addResultListener((event: any) => {
      if (!event.results || event.results.length === 0) return;

      const result = event.results[0];
      const transcript = result.transcript?.toLowerCase().trim() || '';
      const confidence = result.confidence || 0;
      const isFinal = result.isFinal || false;

      console.log('[AlwaysListening] Native heard:', transcript, `(confidence: ${(confidence * 100).toFixed(0)}%)`);

      // Check for wake word
      if (!this.isProcessingCommand && this.containsWakeWord(transcript)) {
        this.handleWakeWordDetected(transcript, confidence, isFinal);
      } else if (this.isProcessingCommand && isFinal) {
        this.handleCommand(transcript, confidence);
      }
    });

    ExpoSpeechRecognition.addErrorListener((event: any) => {
      console.error('[AlwaysListening] Native recognition error:', event.error);
    });

    ExpoSpeechRecognition.addEndListener(() => {
      console.log('[AlwaysListening] Native recognition ended');
      
      // Auto-restart if still active
      if (this.isActive && !this.isProcessingCommand) {
        setTimeout(async () => {
          if (this.isActive) {
            console.log('[AlwaysListening] Auto-restarting native recognition...');
            try {
              await this.startNativeListening();
            } catch (error) {
              console.error('[AlwaysListening] Failed to restart:', error);
            }
          }
        }, 100);
      }
    });
  }

  /**
   * Check if transcript contains the wake word
   */
  private containsWakeWord(transcript: string): boolean {
    const normalized = transcript.toLowerCase().trim();
    const wakeWord = this.config.wakeWord.toLowerCase();

    // Check for exact match or variations
    // Support multiple wake word patterns:
    // - "jarvis" (base)
    // - "hey jarvis"
    // - "ok jarvis"
    // - "yo jarvis"
    // - "jarvis," / "jarvis."
    // - At start of sentence
    const variations = [
      wakeWord,
      `hey ${wakeWord}`,
      `ok ${wakeWord}`,
      `yo ${wakeWord}`,
      `${wakeWord},`,
      `${wakeWord}.`,
      `${wakeWord}!`,
      `${wakeWord}?`,
    ];

    // Check if any variation is present or if it starts with wake word
    return variations.some(v => normalized.includes(v)) || normalized.startsWith(wakeWord);
  }

  /**
   * Handle wake word detection
   */
  private async handleWakeWordDetected(transcript: string, confidence: number, isFinal: boolean): Promise<void> {
    // Only process if confidence is high enough
    const minConfidence = this.config.sensitivity === 'high' ? 0.5 : this.config.sensitivity === 'medium' ? 0.6 : 0.7;
    
    if (confidence < minConfidence) {
      console.log('[AlwaysListening] Wake word confidence too low, ignoring');
      return;
    }

    console.log('[AlwaysListening] ✅ Wake word detected!');
    this.isProcessingCommand = true;

    // Acknowledge wake word
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

    // Set timeout for command
    this.commandTimeoutHandle = setTimeout(() => {
      console.log('[AlwaysListening] Command timeout reached');
      this.isProcessingCommand = false;
      this.commandTimeoutHandle = null;
    }, this.config.commandTimeout * 1000) as unknown as NodeJS.Timeout;

    // Remove wake word from transcript and check if there's a command already
    const commandText = transcript.replace(new RegExp(this.config.wakeWord, 'gi'), '').trim();
    if (commandText && isFinal) {
      await this.handleCommand(commandText, confidence);
    }
  }

  /**
   * Handle command after wake word
   */
  private async handleCommand(command: string, confidence: number): Promise<void> {
    if (!this.isProcessingCommand || !command) {
      return;
    }

    // Clear timeout
    if (this.commandTimeoutHandle) {
      clearTimeout(this.commandTimeoutHandle);
      this.commandTimeoutHandle = null;
    }

    console.log('[AlwaysListening] Processing command:', command);

    try {
      // Store conversation in personality memory
      await JarvisPersonality.storeConversation(
        command,
        '',
        'voice-command',
        this.extractTopics(command)
      );

      // Generate AI response
      const response = await this.generateAIResponse(command);

      // Speak response
      await JarvisVoiceService.speak(response);

      // Update conversation memory
      const recentMemories = JarvisPersonality.getRecentMemories(1);
      if (recentMemories.length > 0) {
        recentMemories[0].jarvisResponse = response;
      }

    } catch (error) {
      console.error('[AlwaysListening] Error processing command:', error);
      await JarvisVoiceService.speak('My apologies, sir. I encountered an error processing your request.');
    } finally {
      this.isProcessingCommand = false;
    }
  }

  /**
   * Generate AI response for command
   */
  private async generateAIResponse(command: string): Promise<string> {
    try {
      console.log('[AlwaysListening] Generating AI response...');

      // Try free AI services first
      try {
        const response = await FreeAIService.generateText(command, {
          maxTokens: 500,
          temperature: 0.7,
        });
        
        if (response && response.trim()) {
          console.log('[AlwaysListening] Response from FreeAIService');
          return this.formatJarvisResponse(response);
        }
      } catch (error) {
        console.warn('[AlwaysListening] FreeAIService failed, trying AIService');
      }

      // Fallback to main AI service
      try {
        const response = await AIService.generateText(command, {
          cache: false,
          maxTokens: 500,
        });
        
        if (response && response.trim()) {
          console.log('[AlwaysListening] Response from AIService');
          return this.formatJarvisResponse(response);
        }
      } catch (error) {
        console.warn('[AlwaysListening] AIService failed');
      }

      // Final fallback
      return this.generateContextualResponse(command);
      
    } catch (error) {
      console.error('[AlwaysListening] All AI services failed:', error);
      return this.generateContextualResponse(command);
    }
  }

  /**
   * Format response in JARVIS style
   */
  private formatJarvisResponse(response: string): string {
    let formatted = response.trim();
    
    // Remove existing "sir" references
    formatted = formatted.replace(/\b,?\s*sir[,.]?\s*\b/gi, ' ').trim();
    
    // Add formal ending if appropriate
    if (!formatted.endsWith('.') && !formatted.endsWith('!') && !formatted.endsWith('?')) {
      formatted = formatted + ', sir.';
    } else if (JarvisPersonality.shouldUseFormalTitle() && !formatted.toLowerCase().includes('sir')) {
      formatted = formatted.slice(0, -1) + ', sir.';
    }
    
    return formatted;
  }

  /**
   * Generate contextual response
   */
  private generateContextualResponse(command: string): string {
    const lower = command.toLowerCase();

    if (lower.match(/\b(hello|hi|hey|greetings)\b/)) {
      return JarvisPersonality.generateResponse({ type: 'greeting' });
    }

    if (lower.match(/\b(status|how are you)\b/)) {
      return 'All systems operational, sir.';
    }

    if (lower.match(/\b(thank you|thanks)\b/)) {
      return 'My pleasure, sir.';
    }

    return JarvisPersonality.generateResponse({
      type: 'confirmation',
      subject: 'I\'m processing that request now.',
    });
  }

  /**
   * Extract topics from command
   */
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

  /**
   * Get service status
   */
  getStatus(): { isActive: boolean; isProcessingCommand: boolean; config: AlwaysListeningConfig } {
    return {
      isActive: this.isActive,
      isProcessingCommand: this.isProcessingCommand,
      config: { ...this.config },
    };
  }

  /**
   * Check if service is active
   */
  isServiceActive(): boolean {
    return this.isActive;
  }
}

export default JarvisAlwaysListeningService.getInstance();
