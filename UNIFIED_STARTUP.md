# 🚀 JARVIS UNIFIED STARTUP GUIDE

## One Command to Rule Them All

```bash
npm run start:all
```

This single command starts **BOTH** frontend and backend together!

---

## 🎯 Quick Start (Complete System)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Everything
```bash
npm run start:all
```

That's it! Both systems will launch automatically.

---

## 📋 What Happens When You Run `npm run start:all`

### Step 1: Backend Starts (Port 3000)
```
🤖 ════════════════════════════════════════════════════════════
🤖   J.A.R.V.I.S. Backend Server
🤖   Just A Rather Very Intelligent System
🤖 ════════════════════════════════════════════════════════════

📡 Starting server on 0.0.0.0:3000

✅ ════════════════════════════════════════════════════════════
✅   JARVIS Backend Server is ONLINE
✅ ════════════════════════════════════════════════════════════

🌐 Server URL: http://0.0.0.0:3000
🔌 tRPC API:   http://0.0.0.0:3000/trpc
🩺 Health:     http://0.0.0.0:3000/
```

### Step 2: Frontend Starts (Expo)
```
📱 Starting Frontend (Expo)...

Metro waiting on exp://...
› Press w │ open web

› Press a │ open Android
› Press i │ open iOS simulator
```

### Step 3: Ready!
```
✅ ════════════════════════════════════════════════════════════
✅   ALL SYSTEMS ONLINE
✅   JARVIS AI Command Center Ready
✅ ════════════════════════════════════════════════════════════

🎯 Access Points:
   📡 Backend:  http://localhost:3000
   📱 Frontend: Check Expo output above for QR code

💡 Tips:
   • Scan QR code with Expo Go app
   • Or press "w" to open in web browser
   • Press Ctrl+C to stop all services

📊 Status:
   Backend:  ✅ Running
   Frontend: ✅ Running
```

---

## 🛠️ Available Commands

### Production (Recommended)
```bash
# Start everything (frontend + backend)
npm run start:all
```

### Development (Separate Processes)
```bash
# Start only backend
npm run start:backend

# Start only frontend  
npm run start:frontend
# or
npm start
```

### Web Development
```bash
# Start frontend for web
npm run start-web
```

### Mobile
```bash
# Run on Android
npm run android

# Run on iOS
npm run ios
```

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    npm run start:all                     │
│                  (Unified Launcher)                      │
└────────────┬────────────────────────────┬────────────────┘
             │                            │
             ▼                            ▼
    ┌────────────────┐          ┌────────────────┐
    │    BACKEND     │          │   FRONTEND     │
    │                │          │                │
    │  Hono Server   │◄────────►│  Expo Metro    │
    │  tRPC API      │  HTTP    │  React Native  │
    │  Port 3000     │          │  Mobile/Web    │
    └────────────────┘          └────────────────┘
             │                            │
             ▼                            ▼
    ┌────────────────┐          ┌────────────────┐
    │   Services     │          │   Components   │
    │ • AI Tools     │          │ • UI Pages     │
    │ • Code Gen     │          │ • JARVIS Chat  │
    │ • Git Ops      │          │ • API Manager  │
    │ • Dependencies │          │ • Settings     │
    └────────────────┘          └────────────────┘
```

---

## 🔧 Backend Services (Real Logic)

The backend at `http://localhost:3000` provides:

### tRPC API Endpoints
```typescript
/trpc/example.hi              - Health check
/trpc/ai.writeFile            - Write code to files
/trpc/ai.executeCode          - Execute code
/trpc/ai.createProject        - Create new projects
/trpc/ai.gitOperation         - Git commands
/trpc/ai.manageDependencies   - NPM operations
```

### Features
- ✅ Real file operations
- ✅ Real code execution
- ✅ Real Git operations
- ✅ Real dependency management
- ✅ Real project creation
- ✅ Full TypeScript support
- ✅ Type-safe tRPC calls

**NO MOCKS. NO PLACEHOLDERS. REAL PRODUCTION LOGIC.**

---

## 📡 Frontend Connection

The frontend automatically connects to the backend via:

**File:** `lib/trpc-client.ts`
```typescript
const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
const url = `${baseURL}/trpc`;
```

**Configured in:** `.env`
```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

---

## 🧪 Testing the Connection

### 1. Check Backend Health
```bash
curl http://localhost:3000
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "API is running"
}
```

### 2. Test tRPC Endpoint
Open frontend and use the JARVIS assistant to:
- Write a file
- Execute code
- Create a project
- Run Git commands

All will use the REAL backend!

---

## 🌐 Deployment

### For Termux/Local Development
```bash
# Already configured!
npm run start:all
```

### For Production Server
1. Deploy backend to a server (VPS, Cloud, etc.)
2. Update `.env`:
   ```env
   EXPO_PUBLIC_API_URL=https://your-backend-domain.com
   ```
3. Start systems:
   ```bash
   # On server:
   npm run start:backend

   # On development machine:
   npm run start:frontend
   ```

---

## 🔐 Environment Variables

### Required (Already Set)
```env
EXPO_PUBLIC_API_URL=http://localhost:3000  # Backend URL
PORT=3000                                   # Backend port
```

### Optional (AI Services)
```env
EXPO_PUBLIC_GROQ_API_KEY=your_key
EXPO_PUBLIC_GEMINI_API_KEY=your_key
EXPO_PUBLIC_HF_API_TOKEN=your_token
```

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check if port 3000 is in use
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Kill process using port 3000
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Frontend Can't Connect to Backend
1. Check `.env` has correct `EXPO_PUBLIC_API_URL`
2. Check backend is actually running on port 3000
3. Check firewall isn't blocking port 3000
4. Try `http://127.0.0.1:3000` instead of `localhost`

### "tsx" Not Found
```bash
# Install globally
npm install -g tsx

# Or use npx (already configured)
npx tsx backend/server.ts
```

---

## 📊 Logs

### Backend Logs
Prefixed with `[BACKEND]` in cyan:
```
[BACKEND] 🤖 J.A.R.V.I.S. Backend Server
[BACKEND] ✅ JARVIS Backend Server is ONLINE
[BACKEND] 🌐 Server URL: http://0.0.0.0:3000
```

### Frontend Logs
Prefixed with `[FRONTEND]` in magenta:
```
[FRONTEND] Metro waiting on exp://...
[FRONTEND] › Press w │ open web
```

### System Logs
Prefixed with `[SYSTEM]` in yellow:
```
[SYSTEM] Stopping backend...
[SYSTEM] Stopping frontend...
```

---

## 🎛️ Advanced Configuration

### Change Backend Port
In `.env`:
```env
PORT=8080
EXPO_PUBLIC_API_URL=http://localhost:8080
```

### Run Backend on Different Machine
```bash
# On server (192.168.1.100):
HOST=0.0.0.0 PORT=3000 npm run start:backend

# In .env on client machine:
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
```

### Enable CORS for External Access
Backend already has CORS enabled:
```typescript
// backend/hono.ts
app.use("*", cors());
```

---

## 📱 Mobile Development

### Expo Go (Easiest)
1. Install Expo Go app on phone
2. Run `npm run start:all`
3. Scan QR code from terminal
4. App loads with backend connected!

### Development Build
```bash
# Android
npm run android

# iOS
npm run ios
```

---

## 🎉 Summary

**One Command:**
```bash
npm run start:all
```

**Starts:**
- ✅ Backend tRPC server (Port 3000)
- ✅ Frontend Expo Metro bundler
- ✅ Auto-connects both systems
- ✅ Real production logic
- ✅ No mocks, no placeholders

**Result:**
Full-stack JARVIS AI Command Center running locally!

---

## 📚 Next Steps

1. ✅ Run `npm install` (if not done)
2. ✅ Run `npm run start:all`
3. ✅ Open app on phone or web
4. ✅ Start using JARVIS!

**Everything is ready. It just works!** 🚀
