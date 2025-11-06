# JARVIS Continuous Listening & AI Integration Guide

## Overview

This guide explains the new **continuous wake word listening** and **AI service integration** features added to JARVIS. Now JARVIS can listen continuously for the wake word "Jarvis" and respond using AI services like Gemini, HuggingFace, and Groq.

## 🎯 Features

### 1. Continuous Wake Word Listening
- **Always-on detection**: JARVIS listens passively for the wake word "Jarvis"
- **Low resource usage**: Lightweight 3-second audio buffers for wake word detection
- **Self-triggering prevention**: Pauses listening while speaking
- **Auto-restart**: Automatically resumes listening after responses
- **Configurable threshold**: Confidence threshold (default: 0.7) to avoid false positives

### 2. AI Service Integration
- **Multiple AI backends**: Integrates with Groq, HuggingFace, Gemini, and more
- **Intelligent fallback**: Tries FreeAIService → AIService → contextual responses
- **No placeholders**: Uses existing API keys and configurations
- **Response formatting**: Automatically formats AI responses to sound like JARVIS

### 3. British Voice (Jarvis-like)
- **Default language**: en-GB (British English)
- **Google Cloud TTS**: Optional en-GB-Wavenet-D voice support
- **Fallback support**: Uses expo-speech if Google Cloud TTS unavailable
- **Configurable**: Can adjust rate, pitch, and voice settings

## 🚀 Quick Start

### Basic Usage

```typescript
import JarvisListenerService from '@/services/JarvisListenerService';

// Start continuous listening mode (always-on wake word detection)
await JarvisListenerService.startContinuousListening();

// JARVIS will now listen for "Jarvis" and respond automatically
// Say: "Jarvis, what's the weather today?"
// JARVIS responds: "Yes, sir?" then processes your command

// Stop continuous listening
await JarvisListenerService.stopContinuousListening();
```

### Direct Command Processing

```typescript
// Process a command without listening (for testing or manual input)
await JarvisListenerService.processCommand("Hello Jarvis");
await JarvisListenerService.processCommand("What can you do?");
await JarvisListenerService.processCommand("Generate a social media post");
```

### Configuration

```typescript
// Update listener settings
JarvisListenerService.updateConfig({
  wakeWord: 'jarvis',              // Wake word to listen for
  language: 'en-US',               // Recognition language
  autoRespond: true,               // Auto-speak responses
  continuous: false,               // Set by startContinuousListening()
  wakeWordConfidenceThreshold: 0.7 // Confidence required (0.0-1.0)
});

// Update voice settings for British voice
JarvisVoiceService.updateSettings({
  language: 'en-GB',               // British English
  googleVoiceName: 'en-GB-Wavenet-D', // Jarvis-like voice
  useGoogleCloudTTS: false,        // Enable if you have Google Cloud TTS
  rate: 1.1,                       // Speech rate
  pitch: 0.9                       // Voice pitch
});
```

## 📋 How It Works

### Continuous Listening Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Start Continuous Listening                               │
│    JarvisListenerService.startContinuousListening()         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Passive Wake Word Detection Loop                        │
│    • Records 3-second audio buffers                         │
│    • Transcribes and checks for "Jarvis"                    │
│    • Pauses while JARVIS is speaking                        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Wake Word Detected (confidence ≥ threshold)             │
│    JARVIS says: "Yes, sir?"                                 │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Full Command Recognition                                │
│    • Records up to 10 seconds                               │
│    • Transcribes full command                               │
│    • Example: "What's the weather today?"                   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. AI Response Generation                                  │
│    Try: FreeAIService (Groq/HuggingFace)                   │
│      ↓ (if fails)                                           │
│    Try: AIService (Gemini/OpenAI)                          │
│      ↓ (if fails)                                           │
│    Fallback: Contextual response from JarvisPersonality    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Speak Response                                           │
│    • Uses British voice (en-GB)                             │
│    • Formats response to sound like JARVIS                  │
│    • Adds "sir" if appropriate                              │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. Resume Listening Loop                                    │
│    Returns to step 2 and waits for next wake word          │
└─────────────────────────────────────────────────────────────┘
```

### AI Service Integration

```typescript
// The listener automatically routes to AI services:

// 1. First tries FreeAIService (Groq, HuggingFace, etc.)
const response = await FreeAIService.generateText(userInput, {
  maxTokens: 500,
  temperature: 0.7
});

// 2. Falls back to AIService (Gemini, OpenAI, etc.)
const response = await AIService.generateText(userInput, {
  cache: false,
  maxTokens: 500
});

// 3. Final fallback: Contextual response
const response = await generateContextualResponse(userInput);
```

## 🔧 Configuration Options

### JarvisListenerService Configuration

```typescript
interface ListenerConfig {
  enabled: boolean;                    // Enable/disable listener
  language: string;                    // Recognition language (e.g., 'en-US')
  wakeWord: string;                    // Wake word to detect (default: 'jarvis')
  autoRespond: boolean;                // Auto-speak responses
  continuous: boolean;                 // Continuous listening mode
  wakeWordConfidenceThreshold: number; // Confidence threshold (0.0-1.0)
}
```

### JarvisVoiceService Configuration

```typescript
interface VoiceSettings {
  enabled: boolean;           // Enable/disable voice output
  voice: string;              // iOS voice identifier
  rate: number;               // Speech rate (0.5-2.0)
  pitch: number;              // Voice pitch (0.5-2.0)
  language: string;           // Voice language (default: 'en-GB')
  autoSpeak: boolean;         // Auto-speak enabled
  useGoogleCloudTTS: boolean; // Use Google Cloud TTS if available
  googleVoiceName: string;    // Google voice name (default: 'en-GB-Wavenet-D')
}
```

## 🧪 Testing

### Run the Integration Tests

```bash
# In Termux or your terminal
bun run test-jarvis-voice-loop.ts
```

This will test:
- ✅ Service initialization
- ✅ Command processing
- ✅ AI response generation
- ✅ Voice output
- ✅ Memory storage
- ✅ Intent detection
- ✅ Continuous listening configuration
- ✅ British voice settings
- ✅ Free AI service providers

### Manual Testing

```typescript
// Test wake word detection
await JarvisListenerService.startContinuousListening();
// Say "Jarvis" aloud
// JARVIS will respond: "Yes, sir?"
// Then say your command
// JARVIS will process and respond

// Test direct command
await JarvisListenerService.processCommand("What's the weather?");
// JARVIS will generate AI response and speak it

// Test configuration
const config = JarvisListenerService.getConfig();
console.log('Wake word:', config.wakeWord);
console.log('Confidence threshold:', config.wakeWordConfidenceThreshold);

// Test voice settings
const voiceSettings = JarvisVoiceService.getSettings();
console.log('Language:', voiceSettings.language);
console.log('Google voice:', voiceSettings.googleVoiceName);
```

## 🎮 Usage Examples

### Example 1: Basic Conversation

```typescript
// Start continuous listening
await JarvisListenerService.startContinuousListening();

// User: "Jarvis"
// JARVIS: "Yes, sir?"

// User: "What's the weather today?"
// JARVIS: [Generates AI response about weather]

// User: "Thank you"
// JARVIS: "My pleasure, sir. Always at your service."
```

### Example 2: Setup Assistance

```typescript
// User: "Jarvis, how do I post to Instagram?"
// JARVIS: [Detects setup query, checks configuration]
// JARVIS: "Excellent question, sir. I'm detecting that Social Media 
//          Integration requires some setup. Here's what you'll need:
//          1. Social media accounts
//          Setup Instructions: ..."
```

### Example 3: AI-Powered Response

```typescript
// User: "Jarvis, explain quantum computing"
// JARVIS: [Routes to FreeAIService/AIService]
// JARVIS: [Receives AI-generated explanation]
// JARVIS: [Formats response to sound like JARVIS]
// JARVIS: "Quantum computing leverages quantum mechanics to process 
//          information exponentially faster than classical computers, sir."
```

## 🔍 API Reference

### JarvisListenerService Methods

```typescript
// Continuous listening control
await JarvisListenerService.startContinuousListening();
await JarvisListenerService.stopContinuousListening();
await JarvisListenerService.toggleContinuousListening();

// Single-shot listening
await JarvisListenerService.startListening();
await JarvisListenerService.stopListening();
await JarvisListenerService.toggleListening();

// Direct command processing
await JarvisListenerService.processCommand("your command here");

// Status checks
const isListening = JarvisListenerService.isCurrentlyListening();
const isContinuous = JarvisListenerService.isContinuousMode();

// Configuration
JarvisListenerService.updateConfig({ wakeWord: 'hey jarvis' });
const config = JarvisListenerService.getConfig();
```

### JarvisVoiceService Methods

```typescript
// Speak text
await JarvisVoiceService.speak("Hello, sir.");
await JarvisVoiceService.speak("Processing...", { rate: 1.2 });

// Stop speaking
await JarvisVoiceService.stop();

// Predefined responses
JarvisVoiceService.speakGreeting();
JarvisVoiceService.speakConfirmation();
JarvisVoiceService.speakAlert("Important notification");

// Configuration
JarvisVoiceService.updateSettings({ 
  language: 'en-GB',
  useGoogleCloudTTS: true 
});
const settings = JarvisVoiceService.getSettings();
```

## 🛠️ Troubleshooting

### Continuous Listening Not Starting

**Problem**: `startContinuousListening()` doesn't start

**Solutions**:
1. Check microphone permissions
2. Verify `config.enabled` is `true`
3. Ensure not already in continuous mode: `isContinuousMode()`

### Wake Word Not Detected

**Problem**: JARVIS doesn't respond to "Jarvis"

**Solutions**:
1. Lower confidence threshold: `updateConfig({ wakeWordConfidenceThreshold: 0.5 })`
2. Speak clearly and directly to microphone
3. Check recognition language matches your accent
4. Verify transcription service is working

### No AI Response

**Problem**: Commands processed but no intelligent response

**Solutions**:
1. Check FreeAIService providers: `await FreeAIService.getStats()`
2. Verify API keys in config/api.config.ts
3. Check internet connection
4. Look for fallback to contextual responses in logs

### Voice Not Speaking

**Problem**: Responses generated but not spoken

**Solutions**:
1. Check `config.autoRespond` is `true`
2. Verify `VoiceSettings.enabled` is `true`
3. Test with: `await JarvisVoiceService.speak("test")`
4. Check device volume and audio permissions

### British Voice Not Working

**Problem**: Voice doesn't sound British

**Solutions**:
1. Verify `language: 'en-GB'` in settings
2. Enable Google Cloud TTS if available: `useGoogleCloudTTS: true`
3. On iOS, select British Siri voice in device settings
4. Fallback uses expo-speech with en-GB language code

## 📚 Related Services

### JarvisGuidanceService
- Detects user intent (setup queries, feature requests)
- Checks configuration requirements
- Generates setup guidance responses

### JarvisPersonality
- Stores conversation memories
- Forms opinions based on interactions
- Generates contextual, personalized responses
- Maintains JARVIS personality traits

### FreeAIService
- Manages free AI providers (Groq, HuggingFace, etc.)
- Handles rate limiting
- Selects best available provider
- Generates text responses

### AIService
- Premium AI services (Gemini, OpenAI, etc.)
- Structured object generation
- Content analysis and optimization
- Image and audio processing

## 🚀 Next Steps

1. **Test Basic Flow**: Run `bun run test-jarvis-voice-loop.ts`
2. **Start Continuous Listening**: Use in your app UI
3. **Configure Voice**: Adjust British voice settings
4. **Add Custom Triggers**: Extend wake word detection
5. **Integrate UI**: Add controls for continuous listening

## 💡 Tips

- **Battery optimization**: Use continuous listening sparingly on mobile
- **Noise environments**: Increase confidence threshold in noisy places
- **Privacy**: Audio is only sent to transcription when wake word detected
- **Custom wake words**: Change `wakeWord` config to personalize
- **Multiple languages**: Adjust `language` setting for other locales

## 🎉 Success!

You now have a fully integrated JARVIS voice assistant with:
- ✅ Continuous wake word listening
- ✅ AI-powered responses (Gemini, HuggingFace, Groq)
- ✅ British voice output (Jarvis-like)
- ✅ Memory and personality
- ✅ Setup guidance
- ✅ Automatic fallbacks

**Ready to assist, sir!**
