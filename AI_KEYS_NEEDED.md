# 🔑 JARVIS API Keys Setup Guide

## 📋 Overview

This document lists ALL API keys needed for JARVIS to function at full capacity. Keys are categorized by **FREE** (always use these first) and **PAID** (use only for complex tasks).

---

## ✅ FREE AI MODELS (Pre-configured - Just Get Free Keys)

### 1. **Hugging Face Inference API** 🤗
- **Status**: FREE (Rate limited, but generous)
- **What it provides**: Text generation, Image generation, Audio transcription
- **How to get**:
  1. Go to https://huggingface.co/join
  2. Sign up for free
  3. Go to https://huggingface.co/settings/tokens
  4. Create new token → Copy it
- **Where to add in JARVIS**: API Keys page → Add as "Hugging Face"
- **Models included**:
  - Text: Mistral 7B, Llama 2, Zephyr, Falcon
  - Image: Stable Diffusion XL, SD 2.1
  - Audio: Whisper Large v3, Bark TTS
- **Rate Limits**: 1000 requests/hour
- **Cost**: $0 (FREE)

### 2. **Together AI** 🚀
- **Status**: FREE tier available
- **What it provides**: Fast text/image/code generation
- **How to get**:
  1. Go to https://api.together.xyz/signup
  2. Sign up (free $5 credit)
  3. Dashboard → API Keys → Create new key
- **Where to add**: API Keys page → Add as "Together AI"
- **Models included**:
  - Text: Llama 3.1 70B/8B, Mixtral 8x7B, Qwen 2
  - Image: FLUX Schnell, SDXL Turbo
  - Code: DeepSeek Coder 33B, CodeLlama 70B
- **Rate Limits**: 600 requests/minute
- **Cost**: $5 free credit, then pay-as-you-go (very cheap)

### 3. **Groq** ⚡
- **Status**: FREE (fastest inference)
- **What it provides**: Lightning-fast text generation
- **How to get**:
  1. Go to https://console.groq.com
  2. Sign up with GitHub/Google
  3. API Keys → Create API Key
- **Where to add**: API Keys page → Add as "Groq"
- **Models included**:
  - Llama 3.1 70B (versatile)
  - Llama 3.1 8B (instant)
  - Mixtral 8x7B
  - Gemma 7B
- **Rate Limits**: 30 requests/minute (free), 14,400/day
- **Cost**: $0 (FREE)
- **Note**: FASTEST free AI available

### 4. **DeepSeek** 🧠
- **Status**: FREE tier
- **What it provides**: Code generation and chat
- **How to get**:
  1. Go to https://platform.deepseek.com
  2. Sign up
  3. API Keys → Create
- **Where to add**: API Keys page → Add as "DeepSeek"
- **Models included**:
  - DeepSeek Coder (best for code)
  - DeepSeek Chat
- **Rate Limits**: 1000 requests/minute
- **Cost**: FREE tier with generous limits

### 5. **Google Gemini** 🔮
- **Status**: FREE
- **What it provides**: Multimodal AI (text, images, video)
- **How to get**:
  1. Go to https://makersuite.google.com/app/apikey
  2. Sign in with Google
  3. Create API key
- **Where to add**: API Keys page → Add as "Gemini"
- **Models included**:
  - Gemini Pro (free)
  - Gemini 1.5 Flash (free, fast)
- **Rate Limits**: 60 requests/minute
- **Cost**: $0 (FREE)

### 6. **Replicate** 🔄
- **Status**: FREE tier ($0.01 initial credit)
- **What it provides**: Run any open-source model
- **How to get**:
  1. Go to https://replicate.com/signin
  2. Sign up
  3. Account → API tokens
- **Where to add**: API Keys page → Add as "Replicate"
- **Models**: Access to 1000+ models
- **Cost**: Free tier, then pay per second

---

## 💰 PAID AI MODELS (Use for Premium Tasks Only)

### 7. **OpenAI** (GPT-4, DALL-E 3)
- **Status**: PAID
- **When to use**: Complex reasoning, best text quality, professional images
- **How to get**:
  1. Go to https://platform.openai.com/signup
  2. Add payment method
  3. API keys → Create
- **Where to add**: API Keys page → Add as "OpenAI"
- **Models**:
  - GPT-4 Turbo: $0.01/1K tokens input, $0.03/1K tokens output
  - GPT-3.5 Turbo: $0.0005/1K tokens (cheap fallback)
  - DALL-E 3: $0.04-$0.12 per image
- **JARVIS will use**: Only for critical code generation and complex analysis

### 8. **Anthropic** (Claude)
- **Status**: PAID
- **When to use**: Long context analysis, research, writing
- **How to get**:
  1. Go to https://console.anthropic.com
  2. Sign up
  3. Settings → API Keys
- **Where to add**: API Keys page → Add as "Anthropic"
- **Models**:
  - Claude 3 Opus: $0.015/1K tokens input, $0.075/1K output
  - Claude 3 Sonnet: $0.003/1K input, $0.015/1K output
- **JARVIS will use**: For long document analysis

### 9. **ElevenLabs** (Voice Cloning)
- **Status**: PAID (Free tier: 10K characters/month)
- **When to use**: Professional voice overs
- **How to get**:
  1. Go to https://elevenlabs.io
  2. Sign up
  3. Profile → API Key
- **Where to add**: API Keys page → Add as "ElevenLabs"
- **Cost**: Free 10K chars, then $5/month for 30K

### 10. **Midjourney** (Premium Images)
- **Status**: PAID
- **When to use**: Highest quality AI art
- **Note**: No direct API, needs Discord bot
- **Cost**: $10/month minimum

---

## 🌐 SOCIAL MEDIA & PLATFORMS (All Required)

### 11. **Instagram / Facebook (Meta)**
- **How to get**:
  1. Go to https://developers.facebook.com
  2. Create App → Select "Business"
  3. Add Instagram Basic Display
  4. Get Access Token
- **Where to add**: Social Connect page
- **Required for**: Posting, analytics

### 12. **TikTok**
- **How to get**:
  1. Go to https://developers.tiktok.com
  2. Apply for API access
  3. Create app
- **Where to add**: Social Connect page
- **Note**: Requires approval

### 13. **YouTube**
- **How to get**:
  1. Go to https://console.cloud.google.com
  2. Enable YouTube Data API v3
  3. Create OAuth 2.0 credentials
- **Where to add**: Social Connect page

### 14. **Twitter/X**
- **How to get**:
  1. Go to https://developer.twitter.com
  2. Apply for developer account
  3. Create app → Get API keys
- **Where to add**: Social Connect page
- **Cost**: $100/month for API access (Expensive!)

### 15. **LinkedIn**
- **How to get**:
  1. Go to https://www.linkedin.com/developers
  2. Create app
  3. Request API access
- **Where to add**: Social Connect page

---

## 💳 PAYMENT & MONETIZATION

### 16. **Stripe**
- **How to get**:
  1. Go to https://dashboard.stripe.com/register
  2. Complete business verification
  3. Developers → API keys
- **Where to add**: API Keys page
- **Required for**: Payment processing

### 17. **PayPal**
- **How to get**:
  1. Go to https://developer.paypal.com
  2. Create app
  3. Get Client ID and Secret
- **Where to add**: API Keys page

---

## 📊 ANALYTICS & TRACKING

### 18. **Google Analytics**
- **How to get**:
  1. Go to https://analytics.google.com
  2. Create property
  3. Get Measurement ID
- **Where to add**: API Keys page

---

## 🔐 STORAGE & CLOUD

### 19. **Google Drive**
- **How to get**:
  1. Go to https://console.cloud.google.com
  2. Enable Google Drive API
  3. Create OAuth credentials
- **Where to add**: Cloud Storage page

### 20. **AWS S3** (Optional)
- **How to get**:
  1. Go to https://aws.amazon.com
  2. IAM → Create user
  3. Get Access Key ID and Secret
- **Where to add**: API Keys page

---

## 🎯 JARVIS PRIORITY SYSTEM

### For AI Tasks:
1. **Data Analysis/Simple tasks** → Use FREE models (Groq, Gemini Flash)
2. **Code Generation** → Use DeepSeek Coder (free) or GPT-4 (paid, if complex)
3. **Image Generation** → Use FLUX Schnell (free) or DALL-E (paid, if quality matters)
4. **Voice/Audio** → Use Whisper (free) or ElevenLabs (paid)

### Cost Optimization:
- JARVIS will ALWAYS try free models first
- Only escalate to paid models if:
  - Free model fails
  - Task requires premium quality
  - User explicitly requests premium model
- Track costs in real-time
- Show savings vs. using only paid models

---

## 📝 NEXT STEPS

1. **Start with FREE keys** (Groq, Hugging Face, Gemini, Together AI, DeepSeek)
2. **Add these keys in JARVIS** → API Keys page
3. **Test each integration** → Use test button
4. **Add paid keys** only when you need premium features
5. **Monitor costs** → Analytics Dashboard

---

## ⚡ QUICK START (Minimum to Get Running)

**Just get these 5 free keys to start:**
1. ✅ Hugging Face
2. ✅ Groq
3. ✅ Google Gemini  
4. ✅ Together AI
5. ✅ DeepSeek

**JARVIS will be 90% functional with just these!**

---

## 🔗 Direct Links Summary

| Service | Get Key Here | Cost |
|---------|--------------|------|
| Hugging Face | https://huggingface.co/settings/tokens | FREE |
| Groq | https://console.groq.com | FREE |
| Together AI | https://api.together.xyz/signup | FREE ($5 credit) |
| DeepSeek | https://platform.deepseek.com | FREE |
| Google Gemini | https://makersuite.google.com/app/apikey | FREE |
| Replicate | https://replicate.com/signin | FREE (small credit) |
| OpenAI | https://platform.openai.com | PAID |
| Anthropic | https://console.anthropic.com | PAID |
| ElevenLabs | https://elevenlabs.io | PAID |

---

**Last Updated**: 2025-10-23  
**Version**: 1.0
