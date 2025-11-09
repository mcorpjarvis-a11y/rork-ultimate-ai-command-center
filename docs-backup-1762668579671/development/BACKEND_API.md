# JARVIS Backend API - Complete Documentation

## 🎯 Overview

This is the **complete unified backend** for the JARVIS AI Command Center. It runs locally on Termux and deploys to cloud platforms (Render, Railway, Vercel) without modification.

## 🚀 Quick Start

### Local Development (Termux/Desktop)
```bash
# Install dependencies
npm install

# Start backend only
npm run start:backend

# Or start everything (backend + frontend)
npm run start:all
```

The backend will start on `http://127.0.0.1:3000`

### Cloud Deployment
1. Deploy to Render/Railway/Vercel
2. Set environment variables
3. Update frontend `.env`:
   ```env
   EXPO_PUBLIC_API_URL=https://your-backend.onrender.com
   ```

## 📡 API Endpoints

### Base URL
- **Local:** `http://127.0.0.1:3000/api`
- **Cloud:** `https://your-backend.com/api`

### 1. Voice Service (`/api/voice`)

#### POST `/api/voice/tts` - Text-to-Speech
Convert text to speech audio.

**Request:**
```json
{
  "text": "Hello, I am JARVIS",
  "voice": "en-GB-Wavenet-D",
  "rate": 1.1,
  "pitch": 0.9,
  "language": "en-GB"
}
```

**Response:**
```json
{
  "success": true,
  "useClientTTS": true,
  "text": "Hello, I am JARVIS",
  "voice": "en-GB-Standard-D",
  "rate": 1.1,
  "pitch": 0.9
}
```

#### POST `/api/voice/stt` - Speech-to-Text
Convert speech audio to text.

**Request:**
```json
{
  "audio": "base64_encoded_audio",
  "language": "en-US"
}
```

**Response:**
```json
{
  "success": false,
  "message": "Speech-to-text not configured. Use text input or add STT endpoint.",
  "guidance": {
    "steps": [
      "Get API key from Google Cloud Console",
      "Add GOOGLE_STT_API_KEY to .env file",
      "Restart backend server"
    ]
  }
}
```

#### GET `/api/voice/config` - Get Voice Configuration
```json
{
  "ttsAvailable": true,
  "sttAvailable": false,
  "defaultVoice": "en-GB-Wavenet-D",
  "defaultLanguage": "en-GB",
  "defaultRate": 1.1,
  "defaultPitch": 0.9
}
```

---

### 2. AI Reasoning (`/api/ask`)

#### POST `/api/ask` - Ask Question
Main AI reasoning endpoint. Automatically selects best available model.

**Request:**
```json
{
  "question": "What is the meaning of life?",
  "context": "You are JARVIS, a helpful AI assistant.",
  "model": "groq",
  "temperature": 0.7,
  "maxTokens": 500
}
```

**Response (Success):**
```json
{
  "success": true,
  "answer": "The meaning of life is a philosophical question...",
  "service": "Groq",
  "model": "groq"
}
```

**Response (No API Keys):**
```json
{
  "success": false,
  "message": "No AI service available. Please add API keys.",
  "guidance": {
    "services": [
      {
        "name": "Groq",
        "env": "EXPO_PUBLIC_GROQ_API_KEY",
        "url": "https://console.groq.com",
        "tier": "free"
      }
    ]
  }
}
```

#### GET `/api/ask/models` - Get Available Models
```json
{
  "models": [
    { "name": "groq", "displayName": "Groq (Fast)", "tier": "free", "available": true },
    { "name": "gemini", "displayName": "Google Gemini", "tier": "free", "available": true }
  ],
  "default": "groq"
}
```

---

### 3. Integrations (`/api/integrations`)

#### GET `/api/integrations` - Get All Integrations Status
```json
{
  "integrations": {
    "google": {
      "configured": true,
      "services": ["Drive", "OAuth"],
      "status": "available"
    },
    "youtube": {
      "configured": false,
      "services": ["Data API", "Analytics"],
      "status": "not_configured"
    },
    "discord": {
      "configured": false,
      "services": ["Bot", "Webhooks"],
      "status": "not_configured"
    }
  }
}
```

#### POST `/api/integrations/test/:service` - Test Integration
```bash
POST /api/integrations/test/google
```

**Response:**
```json
{
  "success": true,
  "message": "Google integration configured"
}
```

---

### 4. Media Management (`/api/media`)

#### POST `/api/media/upload` - Upload Media File
```json
{
  "filename": "audio.mp3",
  "data": "base64_encoded_data",
  "type": "audio/mp3"
}
```

**Response:**
```json
{
  "success": true,
  "filename": "audio.mp3",
  "path": "/api/media/file/audio.mp3",
  "size": 12345,
  "type": "audio/mp3"
}
```

#### GET `/api/media/file/:filename` - Get Media File
Returns the actual file (binary stream).

#### GET `/api/media/list` - List All Media Files
```json
{
  "files": [
    {
      "filename": "audio.mp3",
      "size": 12345,
      "created": "2024-01-01T00:00:00.000Z",
      "modified": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### DELETE `/api/media/file/:filename` - Delete Media File
```json
{
  "success": true,
  "message": "File deleted"
}
```

---

### 5. Logging (`/api/logs`)

#### POST `/api/logs` - Add Log Entry
```json
{
  "level": "info",
  "message": "User logged in",
  "category": "auth",
  "metadata": {
    "userId": "123",
    "ip": "127.0.0.1"
  }
}
```

**Response:**
```json
{
  "success": true,
  "log": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "level": "info",
    "category": "auth",
    "message": "User logged in",
    "metadata": { "userId": "123", "ip": "127.0.0.1" }
  }
}
```

#### GET `/api/logs` - Get Logs
Query parameters:
- `limit` - Number of logs to return (default: 100)
- `level` - Filter by level (info, warn, error)
- `category` - Filter by category

**Response:**
```json
{
  "logs": [
    {
      "timestamp": "2024-01-01T00:00:00.000Z",
      "level": "info",
      "category": "auth",
      "message": "User logged in",
      "metadata": {}
    }
  ],
  "count": 1
}
```

#### DELETE `/api/logs` - Clear All Logs
```json
{
  "success": true,
  "message": "Logs cleared"
}
```

---

### 6. Settings (`/api/settings`)

#### GET `/api/settings` - Get All Settings
```json
{
  "voice": { "enabled": true, "autoSpeak": true, "rate": 1.1, "pitch": 0.9 },
  "ai": { "defaultModel": "groq", "temperature": 0.7, "maxTokens": 500 },
  "integrations": { "autoConnect": true },
  "ui": { "theme": "dark", "animations": true }
}
```

#### POST `/api/settings` - Update All Settings
```json
{
  "voice": { "enabled": true, "autoSpeak": false },
  "ai": { "defaultModel": "gemini" }
}
```

#### GET `/api/settings/:key` - Get Specific Setting
```bash
GET /api/settings/voice
```

**Response:**
```json
{
  "key": "voice",
  "value": { "enabled": true, "autoSpeak": true, "rate": 1.1, "pitch": 0.9 }
}
```

#### PUT `/api/settings/:key` - Update Specific Setting
```bash
PUT /api/settings/voice
```

**Body:**
```json
{
  "value": { "enabled": false }
}
```

---

### 7. System (`/api/system`)

#### GET `/api/system/status` - System Status
```json
{
  "online": true,
  "uptime": 123456,
  "uptimeFormatted": "1h 2m",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "platform": "linux",
  "nodeVersion": "v20.0.0"
}
```

#### GET `/api/system/health` - Health Check
```json
{
  "status": "healthy",
  "memory": {
    "total": "50 MB",
    "used": "30 MB",
    "external": "2 MB"
  },
  "cpu": {
    "loadAverage": [0.5, 0.6, 0.7],
    "cores": 4
  },
  "uptime": 123456
}
```

#### GET `/api/system/info` - API Information
```json
{
  "name": "JARVIS Backend API",
  "version": "1.0.0",
  "description": "Just A Rather Very Intelligent System - Backend Server",
  "endpoints": {
    "voice": "/api/voice",
    "ask": "/api/ask",
    "integrations": "/api/integrations",
    "media": "/api/media",
    "logs": "/api/logs",
    "settings": "/api/settings",
    "system": "/api/system"
  },
  "documentation": "See BACKEND_API.md for full documentation"
}
```

---

## 🔐 Environment Variables

### Required
```env
EXPO_PUBLIC_API_URL=http://127.0.0.1:3000
PORT=3000
HOST=0.0.0.0
```

### AI Services (At least one recommended)
```env
EXPO_PUBLIC_GROQ_API_KEY=your_key_here
EXPO_PUBLIC_GEMINI_API_KEY=your_key_here
EXPO_PUBLIC_HF_API_TOKEN=your_token_here
EXPO_PUBLIC_OPENAI_API_KEY=your_key_here
```

### Optional Services
```env
GOOGLE_TTS_API_KEY=your_key
GOOGLE_STT_API_KEY=your_key
YOUTUBE_API_KEY=your_key
DISCORD_BOT_TOKEN=your_token
TWITTER_API_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
```

---

## 📂 Data Storage

The backend uses local file storage by default:

```
backend/
  data/
    media/          # Uploaded media files
    logs/           # System logs
      system.log    # Main log file
    settings.json   # App configuration
```

**Note:** Files are stored locally. For production, consider using:
- Supabase for database
- S3/Cloudinary for media
- LogDNA/Datadog for logs

---

## 🏗️ Architecture

```
Express Server (Port 3000)
├── /api/voice       → Voice Routes
├── /api/ask         → AI Reasoning Routes
├── /api/integrations → Integration Routes
├── /api/media       → Media Routes
├── /api/logs        → Logging Routes
├── /api/settings    → Settings Routes
└── /api/system      → System Routes
```

Each route module is independent and can be extended separately.

---

## 🔧 Development

### Adding a New Route Module

1. Create file in `backend/routes/your-module.js`
2. Define routes using Express Router
3. Add to `backend/server.js`:
   ```javascript
   const yourRoutes = require('./routes/your-module');
   app.use('/api/your-module', yourRoutes);
   ```

### Example Module
```javascript
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Your module' });
});

router.post('/action', (req, res) => {
  // Handle action
  res.json({ success: true });
});

module.exports = router;
```

---

## 🚀 Deployment

### Render
1. Connect GitHub repo
2. Set environment variables
3. Build command: `npm install`
4. Start command: `npm run start:backend`

### Railway
1. Connect GitHub repo
2. Add environment variables
3. Deploy automatically on push

### Vercel (Serverless)
Requires adaptation for serverless functions. Current implementation is for traditional server deployment.

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows
```

### Module Not Found
```bash
npm install
```

### CORS Errors
Backend has CORS enabled for all origins by default. For production, set:
```env
FRONTEND_URL=https://your-frontend.com
```

---

## 📊 Monitoring

### Check System Status
```bash
curl http://localhost:3000/api/system/status
```

### View Logs
```bash
curl http://localhost:3000/api/logs?limit=10
```

### Health Check
```bash
curl http://localhost:3000/api/system/health
```

---

## ✅ Testing

### Test Endpoints

```bash
# Health check
curl http://localhost:3000/

# Ask AI
curl -X POST http://localhost:3000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "Hello JARVIS"}'

# Get voice config
curl http://localhost:3000/api/voice/config

# Get available models
curl http://localhost:3000/api/ask/models

# System status
curl http://localhost:3000/api/system/status
```

---

## 🎯 Summary

This backend provides:
- ✅ Complete REST API
- ✅ AI reasoning (Groq, Gemini, HuggingFace)
- ✅ Voice processing
- ✅ Media management
- ✅ Logging system
- ✅ Settings storage
- ✅ Integration management
- ✅ Local file storage
- ✅ Ready for cloud deployment
- ✅ Works in Termux

**One backend for all JARVIS needs!** 🚀
