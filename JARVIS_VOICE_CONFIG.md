# JARVIS Voice Configuration

## Overview

JARVIS's voice has been configured to be as close as possible to the actual JARVIS from Iron Man movies. The voice is fixed and cannot be changed by users - ensuring a consistent, authentic JARVIS experience.

## Voice Characteristics

### Primary Voice: British Male (English)
- **Language**: British English (en-GB)
- **Style**: Professional, calm, authoritative
- **Tone**: Slightly lower pitch for gravitas
- **Speed**: Slightly faster for intelligent, efficient speech
- **Quality**: High-quality, human-like pronunciation

### Platform-Specific Voices

#### iOS
- **Voice**: `com.apple.voice.compact.en-GB.Daniel`
- **Description**: High-quality British male voice
- **Quality**: Native iOS voice synthesis
- **Human-like**: Very natural pronunciation

#### Android
- **Voice**: `en-gb-x-rjs#male_2-local`
- **Description**: Google TTS British male voice
- **Quality**: Google's high-quality TTS
- **Human-like**: Natural British accent

#### Web
- **Voice**: Browser's default British English voice
- **Description**: Best available British male voice in browser
- **Quality**: Varies by browser
- **Fallback**: Uses `en-GB` language code

#### Google Cloud TTS (Optional - Most Natural)
- **Voice**: `en-GB-Neural2-D`
- **Description**: Google Cloud Neural2 British male voice
- **Quality**: State-of-the-art neural TTS
- **Human-like**: **Most natural and JARVIS-like**
- **Enable**: Set `useGoogleCloudTTS: true` in settings

## Voice Parameters

### Optimized for JARVIS
```typescript
{
  pitch: 0.95,    // Slightly lower for authoritative tone
  rate: 1.05,     // Slightly faster for intelligent speech
  volume: 1.0,    // Full volume for clarity
  language: 'en-GB' // British English (locked)
}
```

### Parameter Ranges
- **Pitch**: 0.5 - 2.0 (default: 0.95)
  - Lower = more authoritative
  - Higher = more energetic
  
- **Rate**: 0.5 - 2.0 (default: 1.05)
  - Slower = more deliberate
  - Faster = more efficient
  
- **Volume**: 0.0 - 1.0 (default: 1.0)
  - Adjusts output volume

## User Customization

Users **cannot** change:
- ❌ Voice selection (locked to JARVIS)
- ❌ Language (locked to British English)
- ❌ Voice gender or accent

Users **can** adjust:
- ✅ Pitch (for personal preference)
- ✅ Speaking rate/speed
- ✅ Volume
- ✅ Enable/disable voice entirely

## Technical Implementation

### Service Files
1. **VoiceService.ts**: Base voice service with JARVIS configuration
2. **JarvisVoiceService.ts**: Enhanced JARVIS-specific voice with personality

### Key Features
- Automatic platform detection
- Fallback voice selection
- Google Cloud TTS integration (optional)
- Consistent JARVIS personality across platforms

### Voice Selection Logic
```typescript
if (useGoogleCloudTTS) {
  // Use Neural2-D for most natural voice
  voice = 'en-GB-Neural2-D'
} else if (Platform.OS === 'ios') {
  // Use high-quality Daniel voice
  voice = 'com.apple.voice.compact.en-GB.Daniel'
} else if (Platform.OS === 'android') {
  // Use Google TTS British voice
  voice = 'en-gb-x-rjs#male_2-local'
} else {
  // Web: Use browser's British English voice
  language = 'en-GB'
}
```

## Achieving the Most Natural Voice

### Option 1: Native Voices (Default)
- Good quality
- Works offline
- No additional setup
- ✅ Already configured

### Option 2: Google Cloud TTS (Best Quality)
- **Most natural and human-like**
- Closest to Iron Man JARVIS
- Requires internet connection
- Requires Google Cloud TTS API setup

To enable Google Cloud TTS:
```typescript
// In JarvisVoiceService
voiceService.updateSettings({
  useGoogleCloudTTS: true
});
```

## JARVIS Personality Phrases

The voice service includes authentic JARVIS phrases:

### Greetings
- "Good day, sir. JARVIS at your service."
- "Hello, sir. All systems operational."
- "At your service, sir. How may I be of assistance?"

### Confirmations
- "Right away, sir."
- "Consider it done, sir."
- "As you wish, sir."

### Alerts
- "Alert: [message]"
- Spoken with appropriate urgency

## Why This Voice?

1. **Authenticity**: British male voice matches Iron Man's JARVIS
2. **Authority**: Lower pitch conveys competence and reliability
3. **Efficiency**: Slightly faster rate shows intelligence
4. **Consistency**: Same voice across all platforms for brand identity
5. **Quality**: Uses best available voice on each platform

## Testing the Voice

To test JARVIS's voice:
```typescript
import VoiceService from '@/services/voice/VoiceService';

// Test basic speech
await VoiceService.speak('Good day, sir. JARVIS at your service.');

// Test with custom pitch/rate
await VoiceService.speak('All systems operational.', {
  pitch: 0.90,
  rate: 1.1
});
```

## Troubleshooting

### Voice sounds different than expected
- Ensure device volume is adequate
- Check that British English voice is installed on device
- Try enabling Google Cloud TTS for best quality

### Voice not speaking
- Check that `enabled: true` in settings
- Verify device text-to-speech is functional
- Grant audio permissions if prompted

### Voice sounds robotic
- Enable Google Cloud TTS for most natural voice
- Fine-tune pitch (try 0.90-1.00 range)
- Adjust rate (try 1.00-1.10 range)

## Summary

JARVIS uses a **British male voice** configured to sound as **close as possible to the Iron Man JARVIS**. The voice is:
- ✅ Natural and human-like
- ✅ Professional and authoritative
- ✅ Consistent across all platforms
- ✅ **The only voice option** (no user selection)
- ✅ Optimized for JARVIS personality

This creates an authentic, immersive JARVIS experience that matches the character from the Iron Man films.
