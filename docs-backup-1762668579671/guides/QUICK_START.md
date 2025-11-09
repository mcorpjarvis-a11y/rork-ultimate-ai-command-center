# JARVIS - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Launch the App
```bash
npm start
# or
bun start
```

The app will open in Expo Go or web browser.

---

### Step 2: First Launch Experience

When you first open JARVIS:

1. **Jarvis Greets You** 🎤
   - Hear his voice: "Welcome, Sir. I am JARVIS..."
   - Watch the animated tutorial
   - Learn about capabilities

2. **Enable Voice** (Optional)
   - Tap "Enable Voice" when prompted
   - Grant microphone permissions
   - Test: "Hello Jarvis"

3. **Complete Tour**
   - Or tap "Skip" to jump straight in
   - Tutorial only shows once

---

### Step 3: Open AI Assistant

1. **Tap the Brain Icon** (bottom-right floating button)
2. **Chat with Jarvis**:
   ```
   You: "Show me what you can do"
   Jarvis: [Lists all capabilities]
   ```

3. **Try Voice Commands**:
   - Tap microphone icon
   - Speak: "Generate an Instagram post about morning motivation"
   - Jarvis creates it instantly

---

### Step 4: Connect Your First Platform

1. **Go to**: Integrations → Social Connect
2. **Click**: "+ Add Platform"
3. **Select**: Instagram (or any platform)
4. **Authenticate**: Log in when prompted
5. **Done!** Platform connected

---

### Step 5: Generate Your First Content

**Option A: Using AI Assistant**
```
You: "Create 5 Instagram posts about fitness"
Jarvis: [Generates all 5 instantly]
```

**Option B: Using Media Generator**
1. Go to: AI Modules → Media Generator
2. Type: "Sunset over mountains with inspirational quote"
3. Select platforms (use multi-select!)
4. Click "Generate"
5. Review and post

---

## 🎯 Quick Actions

### Voice Commands
- "Create content"
- "Analyze trends"
- "Schedule a post"
- "Check my revenue"
- "What's trending?"
- "Generate an image"

### Settings
**Access**: AI Assistant → Settings Tab

**Must Configure**:
- **Autonomy Limits**: Set max daily spend
- **Approval Thresholds**: When to ask permission
- **Voice Settings**: Adjust speed/pitch
- **Storage**: Enable cloud backup

---

## 💰 Set Your Revenue Goal

1. **Open**: Monetization Dashboard
2. **Set Goal**: e.g., $10,000/month
3. **Let Jarvis Work**:
   - He'll analyze opportunities
   - Test revenue streams
   - Scale winners
   - Report progress

---

## 📊 Track Performance

**Dashboard Shows**:
- Today's revenue
- Follower growth
- Engagement rates
- Top performing content
- Upcoming tasks

**Check Daily** for Jarvis's reports.

---

## 🔐 Add API Keys (Important!)

### Required for Full Functionality

**Location**: `config/api.config.ts`

**Critical Keys**:
```typescript
// AI Services
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

// Social Media (per platform)
INSTAGRAM_ACCESS_TOKEN=...
TIKTOK_API_KEY=...
YOUTUBE_API_KEY=...

// E-commerce (if selling)
SHOPIFY_ACCESS_TOKEN=...
STRIPE_SECRET_KEY=...

// Storage
GOOGLE_DRIVE_CLIENT_ID=...
```

**Without keys**: JARVIS runs in demo mode (mock data).
**With keys**: JARVIS is fully autonomous!

---

## 🎤 Using Voice Features

### Talk to Jarvis
1. Open AI Assistant
2. Tap microphone icon 🎤
3. Speak your command
4. Release button
5. Wait for transcription
6. Jarvis responds (voice + text)

### Voice Settings
- **Rate**: How fast Jarvis speaks (0.5 - 2.0)
- **Pitch**: Voice tone (0.5 - 2.0)
- **Volume**: Loudness (0.0 - 1.0)
- **Auto-Speak**: Jarvis reads all responses

**Tip**: Rate 1.1, Pitch 0.9 sounds most like Iron Man's Jarvis!

---

## 📱 Using Multi-Platform Posting

### Post to Multiple Platforms at Once

1. **Generate/Create Content**
2. **Tap Platform Selector**
3. **Check Platforms**:
   - ✅ Instagram
   - ✅ TikTok
   - ✅ Facebook
   - ✅ YouTube
4. **Apply Selection**
5. **Post Once → Goes Everywhere!**

Jarvis auto-adapts:
- Instagram: Square format
- TikTok: Vertical video
- YouTube: Landscape
- Twitter: Text-focused

---

## 💾 Storage Options

### Local Storage (Default)
- All media saved to phone
- Access: Settings → Storage
- View usage: Shows GB used
- Clear: Delete old files

### Cloud Storage
1. Enable in Settings
2. Choose Provider:
   - Google Drive
   - Dropbox
   - OneDrive
3. Authenticate
4. Auto-backup enabled!

---

## 🤖 Autonomous Mode

### Let Jarvis Run Your Empire

**Enable Autonomy**:
1. AI Assistant → Settings → Autonomy
2. Set limits:
   ```
   Max Daily Spend: $500
   Max Per Campaign: $100
   Require Approval Over: $500
   ```
3. Toggle ON:
   - Auto-post content ✅
   - Auto-respond to customers ✅
   - Auto-fulfill orders ✅
   - Auto-optimize campaigns ✅

**Jarvis will**:
- Monitor 24/7
- Create content
- Post automatically
- Respond to DMs
- Optimize ads
- Fulfill orders
- Report daily

**You just**:
- Review performance (5 min/day)
- Approve major decisions (once/week)
- Collect revenue 💰

---

## 📈 Tips for Success

### Week 1: Setup
- ✅ Connect 3-5 platforms
- ✅ Create 2-3 personas
- ✅ Generate 20 pieces of content
- ✅ Set revenue goal
- ✅ Enable automation

### Week 2-4: Testing
- Jarvis tests content types
- Analyzes what works
- Scales winners
- You review weekly

### Month 2-3: Growth
- Revenue starts flowing
- Followers grow
- Engagement increases
- Jarvis optimizes continuously

### Month 4-6: Scale
- Add more platforms
- Diversify revenue streams
- Increase budgets
- Hit your goals! 🎯

---

## 🆘 Troubleshooting

### Voice Not Working
- ✅ Check microphone permission
- ✅ Enable voice in Settings
- ✅ Restart app

### Can't Save Files
- ✅ Check storage permission
- ✅ Clear cache
- ✅ Free up phone space

### Platforms Won't Connect
- ✅ Add API keys
- ✅ Check credentials
- ✅ Enable platform APIs

### Jarvis Won't Speak
- ✅ Enable auto-speak in Settings
- ✅ Turn up volume
- ✅ Check voice settings

---

## 🎯 Your First Day Checklist

- [ ] Launch app
- [ ] Complete onboarding (or skip)
- [ ] Chat with Jarvis
- [ ] Enable voice features
- [ ] Connect 1 platform
- [ ] Generate 1 piece of content
- [ ] Post it
- [ ] Set revenue goal
- [ ] Configure autonomy limits
- [ ] Let Jarvis work overnight

**Next morning**: Check what Jarvis did while you slept! 🌅

---

## 💡 Pro Tips

1. **Start Small**: Connect 1-2 platforms first
2. **Test Voice**: Find your preferred rate/pitch
3. **Set Realistic Goals**: Start with $1K/month
4. **Review Daily**: 5 minutes checking performance
5. **Trust Jarvis**: Let automation run
6. **Approve Fast**: Don't bottleneck approvals
7. **Scale Gradually**: Increase budgets slowly
8. **Monitor ROI**: Only scale profitable channels

---

## 🎊 You're Ready!

That's it! You now know:
- ✅ How to use voice
- ✅ How to connect platforms
- ✅ How to generate content
- ✅ How to post everywhere
- ✅ How to set goals
- ✅ How to enable autonomy
- ✅ How to track success

**Now**: Go make money! 💰

> "All systems operational, sir. Shall we begin?"
> — J.A.R.V.I.S.

---

## 📚 Further Reading

- `DEPLOYMENT_GUIDE.md` - Detailed setup guide
- `COMPLETE_FEATURES.md` - Full feature list
- `README_BACKEND.md` - Backend architecture
- `JARVIS_ENHANCEMENTS.md` - AI capabilities

---

## 🚀 Launch Command

```bash
npm start
```

**Let's build your empire!** 🏆
