# Connect Real Data - Complete Guide

## Current State

The app is **already designed to use real APIs** but falls back to mock data when:
1. Backend API is not available
2. API keys are missing
3. Social media accounts are not connected
4. Services return errors

## What You Need to Make Data Real

### 1. Backend API Server (CRITICAL - Most Important)

**Status:** ❌ Not Running  
**Impact:** All services currently use mock data fallback

**Location:** `/backend` directory in this repository

#### Setup Instructions:

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file for backend
cp .env.example .env

# 4. Add your API keys to backend/.env:
GROQ_API_KEY=your_groq_key_here
OPENAI_API_KEY=your_openai_key_here (optional)
GEMINI_API_KEY=your_gemini_key_here (optional)

# Database (choose one):
# Option A: Use SQLite (easiest for local development)
DATABASE_URL=file:./dev.db

# Option B: Use PostgreSQL (recommended for production)
DATABASE_URL=postgresql://user:password@localhost:5432/jarvis

# 5. Set up database
npx prisma migrate dev
npx prisma generate

# 6. Start the backend server
npm run dev

# Backend will run on: http://localhost:3000
```

#### Update Frontend to Connect to Backend:

In your root `.env` file, update:
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
# Or for production:
EXPO_PUBLIC_API_URL=https://your-backend-domain.com
```

**Once backend is running, ALL services will automatically switch from mock to real data!**

---

### 2. Social Media Real Data

**Status:** ❌ Using sample data  
**Why:** No accounts connected

#### What You Need:

##### Instagram
```env
EXPO_PUBLIC_INSTAGRAM_ACCESS_TOKEN=your_token
EXPO_PUBLIC_INSTAGRAM_CLIENT_ID=your_client_id
```

**Get tokens:**
1. Go to https://developers.facebook.com
2. Create an app
3. Add Instagram Basic Display
4. Generate User Token
5. Add to `.env`

##### TikTok
```env
EXPO_PUBLIC_TIKTOK_CLIENT_KEY=your_key
EXPO_PUBLIC_TIKTOK_ACCESS_TOKEN=your_token
```

**Get tokens:**
1. Go to https://developers.tiktok.com
2. Create an app
3. Get Client Key
4. Complete OAuth flow for access token
5. Add to `.env`

##### YouTube
```env
EXPO_PUBLIC_YOUTUBE_API_KEY=your_api_key
EXPO_PUBLIC_YOUTUBE_CLIENT_ID=your_client_id
```

**Get API key:**
1. Go to https://console.cloud.google.com/apis/credentials
2. Create credentials → API key
3. Enable YouTube Data API v3
4. Add to `.env`

##### Twitter/X
```env
EXPO_PUBLIC_TWITTER_API_KEY=your_key
EXPO_PUBLIC_TWITTER_API_SECRET=your_secret
EXPO_PUBLIC_TWITTER_BEARER_TOKEN=your_bearer_token
```

**Get credentials:**
1. Go to https://developer.twitter.com/en/portal/dashboard
2. Create a project and app
3. Get API keys and Bearer token
4. Add to `.env`

**After adding tokens, restart the app. Services will automatically connect!**

---

### 3. Analytics Real Data

**Status:** ❌ Using calculated/estimated data  
**Why:** Backend API not running + No social accounts connected

#### To Get Real Analytics:

1. **Start backend server** (see step 1 above)
2. **Connect social media accounts** (see step 2 above)
3. Backend will automatically:
   - Fetch real follower counts
   - Track real engagement rates
   - Calculate actual reach
   - Monitor real impressions

**No additional configuration needed once backend + social accounts are set up!**

---

### 4. Trend Data (Real-Time Trends)

**Status:** ❌ Using generated sample trends  
**Why:** Backend not running + No trend API configured

#### Option A: Use Backend with Social APIs (Recommended)

Backend automatically discovers trends from connected platforms.

**Setup:**
1. Start backend server
2. Connect social media accounts
3. Backend analyzes your feed and discovers trends

#### Option B: Add External Trend API (Advanced)

For professional trend tracking, add to backend `.env`:

```env
# Google Trends API
GOOGLE_TRENDS_API_KEY=your_key

# Or Twitter Trending API
TWITTER_TRENDING_ENDPOINT=https://api.twitter.com/2/trends/available

# Or custom trend service
TREND_SERVICE_URL=https://your-trend-api.com
```

---

### 5. Monetization Real Data

**Status:** ❌ Using manual tracking  
**Why:** No payment/ad platform APIs connected

#### To Track Real Revenue:

##### YouTube AdSense
```env
EXPO_PUBLIC_YOUTUBE_ADSENSE_CLIENT_ID=your_client_id
```

##### Stripe
```env
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_key
EXPO_PUBLIC_STRIPE_SECRET_KEY=your_secret
```

##### PayPal
```env
EXPO_PUBLIC_PAYPAL_CLIENT_ID=your_client_id
EXPO_PUBLIC_PAYPAL_SECRET=your_secret
```

**Add to `.env` and restart. Backend will fetch real revenue data.**

---

### 6. AI Services (Already Working!)

**Status:** ✅ Using real AI APIs  
**Current Keys Configured:**
- ✅ Groq (Free)
- ✅ HuggingFace (Free)
- ✅ Gemini (Free)

These are **burner demo keys**. To use your own:

```env
# Replace in .env:
EXPO_PUBLIC_GROQ_API_KEY=gsk_YOUR_KEY_HERE
EXPO_PUBLIC_HF_API_TOKEN=hf_YOUR_TOKEN_HERE
EXPO_PUBLIC_GEMINI_API_KEY=AIza_YOUR_KEY_HERE
```

**Get your free keys:**
- Groq: https://console.groq.com
- HuggingFace: https://huggingface.co/settings/tokens
- Gemini: https://makersuite.google.com/app/apikey

---

### 7. IoT Devices (Real Device Control)

**Status:** ❌ No devices connected  
**Why:** No physical devices configured

#### To Control Real Devices:

The app supports:
- 3D Printers (OctoPrint, Prusa Link, Klipper)
- Smart Lights (Philips Hue, LIFX)
- Smart Plugs (TP-Link, Wemo)
- Thermostats
- Custom devices

**Example - Add OctoPrint 3D Printer:**

In the app:
1. Open JARVIS assistant
2. Say: "Add a 3D printer"
3. Provide:
   - Name: "My Prusa i3"
   - IP: "192.168.1.100"
   - API Key: (from OctoPrint settings)

Or add directly in code/config.

---

## Priority Order to Connect Real Data

### Must Do First (Critical):
1. ✅ **AI API Keys** - Already working with demo keys, but get your own
2. 🔴 **Start Backend Server** - This is THE most important step

### High Priority (Gets you 80% real data):
3. 🟡 Connect at least 1 social media account (Instagram or YouTube recommended)
4. 🟡 Configure Google OAuth for Drive backup

### Medium Priority (Nice to have):
5. 🟢 Add monetization platform APIs
6. 🟢 Connect IoT devices

### Optional (Advanced):
7. ⚪ External trend APIs
8. ⚪ Payment processor integrations

---

## Quick Start (5 Minutes to Real Data)

```bash
# 1. Get a free Groq API key (if you want your own)
# Visit: https://console.groq.com
# Copy to .env: EXPO_PUBLIC_GROQ_API_KEY=gsk_...

# 2. Start the backend
cd backend
npm install
DATABASE_URL=file:./dev.db npm run dev

# 3. Update frontend .env
echo "EXPO_PUBLIC_API_URL=http://localhost:3000" >> .env

# 4. Restart the app
npm start

# That's it! Analytics, trends, and content services now use real data!
```

---

## How to Tell if You're Using Real Data

### Check Logs:
Real data:
```
[SocialMediaService] Fetched real account data
[AnalyticsService] Retrieved analytics from backend
[TrendService] Discovered 15 trending topics from API
```

Mock data:
```
[AnalyticsService] Error fetching analytics, using mock data
[TrendService] Generating mock trends
[SocialMediaService] No accounts connected, showing sample data
```

### Check UI:
- Real data: No "Sample Data" badges
- Mock data: Yellow "Sample Data" indicators appear

---

## Services and Their Data Sources

| Service | Real Data Source | Fallback (Mock) |
|---------|-----------------|-----------------|
| Analytics | Backend API + Social APIs | ✅ Generated samples |
| Social Media | Platform OAuth tokens | ✅ Sample accounts |
| Trends | Backend + Platform APIs | ✅ Generated trends |
| Content | Backend API | ✅ Local storage |
| Monetization | Payment APIs | ✅ Manual tracking |
| AI Chat | Groq/OpenAI/Gemini | ❌ No fallback (required) |
| Voice | Expo Speech API | ❌ No fallback (built-in) |
| IoT | Direct device APIs | ✅ No devices |

---

## Backend Endpoints (For Reference)

Once backend is running:

```
GET  /api/analytics/query     - Get analytics data
GET  /api/trends/discover     - Discover trends
POST /api/social/post         - Post to social media
GET  /api/content/list        - List content
POST /api/ai/generate         - Generate content with AI
GET  /api/revenue/summary     - Get revenue summary
```

Check backend README for complete API documentation.

---

## Troubleshooting

### "Still seeing mock data after starting backend"
- Check `.env` has `EXPO_PUBLIC_API_URL=http://localhost:3000`
- Restart the app completely
- Check backend logs for errors
- Verify backend is actually running on port 3000

### "Social media not connecting"
- Verify tokens are valid (they expire!)
- Check token permissions/scopes
- Some platforms require app review before live data

### "AI not working"
- Check API key is valid
- Check you have credits (for paid APIs)
- Try different AI service (Groq is most reliable free option)

---

## Summary

**The app is NOT using mock data by design - it's using mock data because:**
1. ❌ Backend server is not running
2. ❌ Social media accounts are not connected
3. ❌ Some API tokens are missing

**To fix:**
1. Start the backend server (most important!)
2. Connect at least one social media account
3. Replace demo AI keys with your own (optional but recommended)

**Everything is already wired up and ready to use real data - you just need to start the backend and add your credentials!**
