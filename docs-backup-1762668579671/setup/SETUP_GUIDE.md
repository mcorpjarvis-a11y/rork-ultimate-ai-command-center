# JARVIS Setup Guide

Complete setup instructions for the JARVIS Ultimate AI Command Center.

## 📱 Prerequisites

- Android device (Android 14+ recommended)
- Google account (optional, for cloud sync)
- Node.js 18+ (for development)

## 🚀 Quick Setup

### Option 1: Guest Mode (No Sign-In Required)
1. Launch the app
2. Click "Skip for Now - Test Without Account"
3. Configure voice preferences
4. Start using JARVIS!

**Limitations**: No cloud sync, local storage only

### Option 2: Full Setup with Google Sign-In
1. Launch the app
2. Sign in with Google
3. (Optional) Add AI API keys
4. Configure voice preferences
5. Complete setup

**Benefits**: Cloud sync, cross-device access, backup

## 🔑 API Keys Setup

JARVIS supports multiple AI providers. All are optional!

### Free Tier Providers

#### 1. Google Gemini (Recommended)
- **Get Key**: https://makersuite.google.com/app/apikey
- **Tier**: Free
- **Features**: Chat, content generation
- **Auto-linked**: If you sign in with Google

#### 2. Groq
- **Get Key**: https://console.groq.com/keys
- **Tier**: Free
- **Features**: Ultra-fast inference

#### 3. HuggingFace
- **Get Key**: https://huggingface.co/settings/tokens
- **Tier**: Free
- **Features**: Access to thousands of models

### Paid Providers (Optional)

#### OpenAI
- **Get Key**: https://platform.openai.com/api-keys
- **Models**: GPT-4, GPT-3.5

#### Anthropic
- **Get Key**: https://console.anthropic.com/settings/keys
- **Models**: Claude

## 🎤 Voice Configuration

### Text-to-Speech (TTS)
- **Voice**: JARVIS (British Male)
- **Auto-start**: Enabled by default
- **Test**: Use "Test Voice" button in setup

### Speech-to-Text (STT)
- **Wake Word**: "jarvis" (customizable)
- **Continuous Listening**: Optional
- **Fallback**: Works even without microphone access

## ☁️ Cloud Sync Setup

### Requirements
- Google account sign-in
- Internet connection
- Google Drive permissions

### What Gets Synced
- User profile
- API keys (encrypted)
- Voice preferences
- App settings

### Manual Sync
Go to Settings → Cloud Sync → Sync Now

## 🔐 Security

- API keys encrypted at rest
- Secure storage with AsyncStorage
- Cloud data encrypted in Google Drive
- No data sharing with third parties

## 🆘 Troubleshooting

### "Invalid API Key" Error
- Verify key is correct and active
- Check key permissions
- Try regenerating the key
- App works without keys (uses fallback)

### Voice Not Working
- Check device volume
- Grant microphone permissions
- Test voice in Settings
- Restart the app

### Sync Issues
- Check internet connection
- Re-authenticate Google account
- Clear app cache
- Check Google Drive permissions

## 📚 Next Steps

- [Features Guide](../guides/FEATURES.md)
- [JARVIS Voice Guide](../guides/JARVIS_VOICE_CONFIG.md)
- [API Integration](../guides/JARVIS_AI_MODELS_GUIDE.md)
- [Development Guide](../development/)

## 💡 Tips

1. **Start with guest mode** to test the app
2. **Add one API key at a time** to test each service
3. **Enable voice gradually** - start with TTS, then add STT
4. **Check Settings regularly** for new features
5. **Keep API keys secure** - never share them
