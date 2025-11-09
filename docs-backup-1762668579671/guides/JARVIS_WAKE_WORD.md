# JARVIS Wake Word & Response System

## Overview

JARVIS is configured to **actively listen** for the wake word "JARVIS" and **respond immediately** when called.

## How It Works

### 1. Wake Word Detection

JARVIS listens for the wake word **"jarvis"** (case-insensitive) with flexible matching:

#### Accepted Variations:
- ✅ "jarvis"
- ✅ "JARVIS"
- ✅ "Jarvis"
- ✅ "hey jarvis"
- ✅ "ok jarvis"
- ✅ "jarvis," (with punctuation)
- ✅ "jar vis" (with space)
- ✅ Common mispronunciations: "jarvas", "jarvus", "jarves"

#### Detection Threshold:
- **Confidence**: 60% or higher (lowered from 70% for better detection)
- **Listen Duration**: 3 seconds for wake word detection
- **Command Duration**: 10 seconds for full command after wake word

### 2. JARVIS Response Flow

```
User: "Jarvis"
   ↓
System detects wake word
   ↓
JARVIS responds: "Yes, sir?" (or variation)
   ↓
System listens for command (10 seconds)
   ↓
User: "What's the weather?"
   ↓
JARVIS processes and responds
```

### 3. Acknowledgment Responses

When JARVIS hears his name, he responds with authentic JARVIS phrases:

- "Yes, sir?"
- "At your service, sir."
- "How may I help you, sir?"
- "I'm here, sir."
- "Yes, sir. I'm listening."
- "Ready, sir."

**Random selection** ensures natural conversation flow.

### 4. Auto-Response

JARVIS is configured with **autoRespond: true** by default, meaning:
- ✅ Always responds when wake word is detected
- ✅ Automatically speaks responses (no manual trigger needed)
- ✅ Continuous conversation mode available

## Configuration

### Default Settings

```typescript
{
  enabled: true,
  language: 'en-US',
  wakeWord: 'jarvis',
  autoRespond: true,  // JARVIS always answers
  continuous: false,
  wakeWordConfidenceThreshold: 0.6,  // 60% confidence
  wakeWordListenDuration: 3000,      // 3 seconds
  commandListenDuration: 10000,      // 10 seconds
}
```

### User Cannot Change:
- ❌ Wake word (fixed to "jarvis")
- ❌ Auto-respond (always enabled)

### User Can Adjust:
- ✅ Enable/disable listening entirely
- ✅ Confidence threshold
- ✅ Listen durations
- ✅ Continuous mode

## Usage Examples

### Example 1: Simple Query
```
User: "Jarvis"
JARVIS: "Yes, sir?"
User: "What time is it?"
JARVIS: "It's currently 3:45 PM, sir."
```

### Example 2: Direct Command
```
User: "Jarvis, create a social media post"
JARVIS: "Right away, sir. What would you like the post to say?"
```

### Example 3: Complex Interaction
```
User: "Hey Jarvis"
JARVIS: "At your service, sir."
User: "Show me today's analytics"
JARVIS: "Certainly, sir. Your analytics show 1,250 views and $47 revenue today."
```

### Example 4: Status Check
```
User: "Jarvis, status report"
JARVIS: "All systems operational, sir. I've stored 45 memories, formed 12 opinions, and currently operating at 85% autonomy."
```

## Technical Implementation

### Wake Word Detection Methods

#### Web Platform (Browser)
- Uses Web Speech API
- Real-time recognition
- Automatic confidence scoring
- No setup required

#### iOS/Android (Native)
- Audio recording + transcription
- 3-second buffer for wake word
- Speech-to-Text API integration
- Higher quality recognition

### Detection Algorithm

```typescript
private isWakeWordDetected(transcript: string): boolean {
  const lowerTranscript = transcript.toLowerCase().trim();
  
  // Direct match
  if (lowerTranscript.includes('jarvis')) return true;
  
  // Variations
  const variations = ['jarvas', 'jarvus', 'jarves', 'jar vis'];
  for (const variation of variations) {
    if (lowerTranscript.includes(variation)) return true;
  }
  
  // Prefixed commands
  if (lowerTranscript.startsWith('jarvis ')) return true;
  if (lowerTranscript.startsWith('hey jarvis')) return true;
  
  return false;
}
```

### Response Generation

1. **Wake word detected** → Acknowledge
2. **Listen for command** → Transcribe
3. **Process with AI** → Generate response
4. **Speak response** → Use JARVIS voice
5. **Store in memory** → Learn from interaction

## Enabling Voice Input

### Requirements

1. **Microphone Permission**
   - Grant when prompted
   - Required for voice detection

2. **Speech-to-Text Service** (Optional but recommended)
   - OpenAI Whisper API
   - Google Speech-to-Text
   - Or custom STT endpoint

3. **Internet Connection**
   - Required for AI responses
   - Optional for basic commands

### Setup

Add to `.env`:
```bash
# For better transcription (optional)
EXPO_PUBLIC_STT_URL=https://your-stt-api.com/transcribe

# AI services for responses
EXPO_PUBLIC_GEMINI_API_KEY=AIza...
EXPO_PUBLIC_GROQ_API_KEY=gsk_...
```

## Starting the Listener

### Automatic Start
JARVIS listener can auto-start on app launch if configured.

### Manual Start
```typescript
import JarvisListenerService from '@/services/JarvisListenerService';

// Start listening for wake word
await JarvisListenerService.startListening();

// Start continuous mode (advanced)
await JarvisListenerService.startContinuousListening();

// Stop listening
await JarvisListenerService.stopListening();
```

## Testing Wake Word Detection

### Quick Test
1. Launch app
2. Start listener
3. Say "Jarvis" clearly
4. Wait for acknowledgment
5. Say your command
6. Hear JARVIS response

### Troubleshooting

**JARVIS doesn't respond:**
- Check microphone permissions
- Increase volume
- Speak clearly and directly
- Reduce background noise
- Check listener is enabled: `JarvisListenerService.isCurrentlyListening()`

**Low detection accuracy:**
- Lower confidence threshold to 0.5
- Speak more clearly
- Move closer to device
- Reduce ambient noise

**No voice response:**
- Check JARVIS voice is enabled
- Verify device volume
- Check speaker output
- See `JARVIS_VOICE_CONFIG.md`

## Advanced Features

### Continuous Mode
JARVIS can listen continuously without wake word:
```typescript
JarvisListenerService.updateConfig({ continuous: true });
```

### Custom Wake Word Variations
Add your own variations (for testing):
```typescript
// In isWakeWordDetected method
const variations = [
  'jarvis',
  'jay',  // nickname
  'j', // short form
  // ... add more
];
```

### Wake Word in Commands
JARVIS detects wake word even in middle of sentence:
- "Hey Jarvis, what's up?" ✅
- "Can you help me Jarvis?" ✅
- "Jarvis, are you there?" ✅

## Summary

✅ JARVIS **always listens** for wake word "jarvis"
✅ JARVIS **always responds** when called
✅ **Flexible matching** handles variations and mispronunciations
✅ **Authentic responses** match Iron Man JARVIS personality
✅ **Auto-responds** with AI-generated answers
✅ **Continuous listening** mode available
✅ **Cross-platform** support (iOS/Android/Web)

**JARVIS will answer when you call him by name!** 🎯

For voice configuration, see `JARVIS_VOICE_CONFIG.md`
