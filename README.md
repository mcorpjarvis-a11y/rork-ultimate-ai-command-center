# JARVIS Ultimate AI Command Center

> **📋 All documentation has been consolidated into [MASTER_CHECKLIST.md](./MASTER_CHECKLIST.md)**
> 
> This is the single source of truth for the entire project.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Verify Metro bundler (important!)
npm run verify

# 3. Start the application
npm start
```

## Documentation

**→ [READ MASTER_CHECKLIST.md](./MASTER_CHECKLIST.md)** - Complete documentation including:

- 🚀 Project overview & quick start
- 📖 Environment setup & configuration
- 🧪 Testing strategy & commands
- ✅ Completed tasks (DONE section)
- 📋 Remaining tasks (TODO section)
- 🔧 Metro bundler troubleshooting (Node 20.x recommended)
- 🔐 Security & vulnerability scanning
- 🖥️ Backend API documentation
- 🔑 Authentication system guide
- 🤖 AI API keys setup (free & paid)
- 📝 How to update documentation

## Key Commands

```bash
# Verification (run before every commit)
npm test                 # Run all tests (142 expected)
npm run verify           # Verify Metro bundler
npm run lint             # Check code quality

# Development
npm start                    # Start Metro bundler
npm run start:all            # Start frontend + backend
npm run start:backend:prod   # Backend (compiled, stable)
npm run dev:backend          # Backend with hot reload (has tsx limitation)

# Build
npm run build:backend    # Build backend TypeScript
npm run build:apk        # Build Android APK
```

## Important Notes

- **Platform**: Android only (iOS not supported)
- **Node Version**: Node 20.x LTS recommended (current: 20.19.5)
- **Framework**: React Native + Expo 54
- **Documentation**: All in [MASTER_CHECKLIST.md](./MASTER_CHECKLIST.md)

## Project Structure

This is a React Native mobile app with TypeScript backend:

```
├── app/                    # React Native screens (Expo Router)
├── backend/                # TypeScript Express.js server
├── components/             # React components
├── services/               # Business logic (auth, AI, voice, storage)
├── scripts/                # Build & verification scripts
├── MASTER_CHECKLIST.md     # 📋 COMPLETE DOCUMENTATION (READ THIS!)
└── package.json            # Dependencies & scripts
```

## Need Help?

1. **Read**: [MASTER_CHECKLIST.md](./MASTER_CHECKLIST.md)
2. **Metro issues?**: See Metro Troubleshooting section in MASTER_CHECKLIST.md
3. **Node version?**: Use Node 20.x LTS (check with `node --version`)
4. **Tests failing?**: Run `npm test` and check output

## Contributing

Before making changes:

1. Read [MASTER_CHECKLIST.md](./MASTER_CHECKLIST.md) completely
2. Update MASTER_CHECKLIST.md with your changes (do NOT create new docs)
3. Run `npm test && npm run verify && npm run lint`
4. Commit with descriptive message

**Rule**: All documentation goes in MASTER_CHECKLIST.md - do not create separate docs!

---

**For complete documentation, see [MASTER_CHECKLIST.md](./MASTER_CHECKLIST.md)**
