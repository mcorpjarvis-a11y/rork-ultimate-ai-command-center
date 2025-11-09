# JARVIS Setup Guide - Google Gemini Integration

## Quick Start: Making JARVIS Functional on First Sign-In

When you sign in with Google for the first time, JARVIS automatically tries to link your Google Gemini API key to make the AI functional immediately.

### Automatic Setup (Recommended)

1. **Get Your Google Gemini API Key**
   - Visit: https://makersuite.google.com/app/apikey
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the API key (starts with `AIza...`)

2. **Add to Environment**
   - Open your `.env` file in the project root
   - Add this line:
     ```
     EXPO_PUBLIC_GEMINI_API_KEY=AIzaSy...YOUR_KEY_HERE
     ```
   - Save the file
   - Restart the app

3. **Sign In with Google**
   - When you sign in with Google, JARVIS will:
     - ✅ Automatically detect and link your Gemini API key
     - ✅ Initialize text-to-speech
     - ✅ Speak: "Welcome to JARVIS. I am ready to assist you."
     - ✅ Mark setup as complete
     - ✅ Skip directly to completion screen
   - **JARVIS is now fully functional!**

### What Happens on First Sign-In

```
Google Sign-In
    ↓
Auto-detect Gemini API Key
    ↓
Initialize Text-to-Speech
    ↓
JARVIS speaks: "Welcome to JARVIS. I am ready to assist you."
    ↓
If Gemini found:
    → Mark setup complete
    → Skip to completion screen
    → JARVIS speaks: "Google Gemini has been automatically linked. I am fully operational."
    ↓
Else:
    → Show API key setup screen
    → User can add keys manually
```

### Manual Setup (If Auto-detection Fails)

If the Gemini key is not in your environment:

1. Sign in with Google
2. When the API keys screen appears:
   - Paste your Gemini API key
   - Optionally add other AI service keys (Groq, HuggingFace)
   - Click "Save & Continue"
3. JARVIS will be activated!

### Updating Configuration Later

You can update your API keys at any time:

1. Open the app
2. Navigate to **Settings** (in Tools section)
3. Click **"Run Setup Wizard"**
4. Update your API keys
5. Changes are automatically synced to the cloud

### Features When Gemini is Linked

With Gemini API automatically linked, JARVIS can:
- ✅ Respond to voice commands
- ✅ Generate content and ideas
- ✅ Answer questions intelligently
- ✅ Assist with creative tasks
- ✅ Provide personalized recommendations
- ✅ Work with images and multimodal inputs

### Troubleshooting

**Problem: JARVIS doesn't speak on first sign-in**
- Check device volume
- Ensure text-to-speech is enabled in device settings
- Grant microphone permissions if prompted

**Problem: Gemini key not detected**
- Verify the key starts with `AIza`
- Check `.env` file for typos
- Ensure no spaces around the `=` sign
- Restart the app after adding the key

**Problem: "Setup not complete" after sign-in**
- The Gemini key wasn't found in environment
- Use the wizard to add it manually
- Or add to `.env` and sign out/in again

### Getting More AI Services

While Gemini makes JARVIS functional, you can add more AI services:

- **Groq** (Free): Ultra-fast LLaMA models
  - Get key: https://console.groq.com/
  - Add to `.env`: `EXPO_PUBLIC_GROQ_API_KEY=gsk_...`

- **HuggingFace** (Free): Access to 1000+ models
  - Get key: https://huggingface.co/settings/tokens
  - Add to `.env`: `EXPO_PUBLIC_HUGGINGFACE_API_KEY=hf_...`

### Security Notes

- All API keys are stored using hardware-encrypted storage (iOS Keychain / Android Keystore)
- Keys are synced to Google Drive in encrypted form
- Keys are never exposed in logs or debug output
- You can delete your account and all keys at any time from Settings

## Summary

**For the best experience:**
1. Get Gemini API key from https://makersuite.google.com/app/apikey
2. Add to `.env` file: `EXPO_PUBLIC_GEMINI_API_KEY=AIza...`
3. Sign in with Google
4. JARVIS will be immediately functional with AI and text-to-speech! 🚀

That's it! JARVIS is ready to assist you.
