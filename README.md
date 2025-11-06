# Welcome to JARVIS Ultimate AI Command Center

## Project info

This is a native Android mobile app - the Ultimate AI Command Center powered by JARVIS.

**Platform**: Native Android app (iOS not supported)  
**Framework**: Expo Router + React Native  
**Distribution**: APK for sideloading on Android devices

> **Note**: This project is Android-only by design. All iOS/Apple platform support has been removed. See [docs/development/ANDROID_ONLY.md](docs/development/ANDROID_ONLY.md) for details.

## 🚀 Quick Start

### New Users
1. **Try without signing in**: Use guest mode to test the app
2. **Or sign in with Google**: Enable cloud sync and full features
3. **Configure voice**: Set up JARVIS voice assistant
4. **Add API keys**: Connect your AI services (optional)

### Documentation
- 📖 [Quick Start Guide](docs/guides/QUICK_START.md)
- 🔧 [Setup Instructions](docs/setup/SETUP_GUIDE.md) 
- 📋 [Project Status](MASTER_CHECKLIST.md)
- 🔑 [API Keys Setup](AI_KEYS_NEEDED.md)
- 👨‍💻 [Development Docs](docs/development/)

## How can I edit this code?

There are several ways of editing your native mobile application.

### **Use your preferred code editor**

If you want to work locally using your own code editor, you can clone this repo and push changes.

If you are new to coding and unsure which editor to use, we recommend Cursor. If you're familiar with terminals, try Claude Code.

The only requirement is having Node.js installed - [install Node.js with nvm](https://github.com/nvm-sh/nvm)

Follow these steps:

```bash
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm install

# Step 4: Start the instant web preview of your app in your browser, with auto-reloading of your changes
npm run start-web

# Step 5: Start Android preview
# Option A (recommended):
npm run start  # then press "a" for Android
# Option B (if supported by your environment):
npm run android
```

### **Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

## What technologies are used for this project?

This project is built with native mobile development for Android:

### Frontend
- **React Native** - Native mobile development framework created by Meta
- **Expo** - Extension of React Native used by Discord, Shopify, Coinbase, and more
- **Expo Router** - File-based routing system for React Native
- **TypeScript** - Type-safe JavaScript
- **React Query** - Server state management
- **Lucide React Native** - Beautiful icons

### Backend (TypeScript)
- **Express.js** - Fast, unopinionated web framework for Node.js with full TypeScript support
- **TypeScript 5.9.x** - Strict type checking with production-ready configuration
- **tRPC** - End-to-end typesafe APIs (optional, for advanced features)
- **tsx** - TypeScript execution with hot reloading for development
- **AI Integration** - Support for Groq, Google Gemini, HuggingFace, and OpenAI

The backend is fully TypeScript-enabled with:
- ✅ Production-ready build system
- ✅ Hot reloading in development
- ✅ Environment variable validation
- ✅ Comprehensive error handling
- ✅ Full type safety across all routes

For backend details, see [backend/README.md](backend/README.md)

## Backend Development

### Quick Start

```bash
# Development mode with hot reload
npm run dev:backend

# Or run without hot reload
npm run start:backend

# Build for production
npm run build:backend

# Run production build
npm run start:backend:prod

# Start both frontend and backend
npm run start:all
```

### Environment Setup

Create a `.env` file with at least one AI API key:

```bash
# Recommended: Groq (fastest, free)
EXPO_PUBLIC_GROQ_API_KEY=your_groq_key

# Or use Google Gemini
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_key

# Optional: Other AI services
EXPO_PUBLIC_HF_API_TOKEN=your_huggingface_token
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_key

# Server configuration (optional)
PORT=3000
HOST=0.0.0.0
```

The backend will validate environment variables on startup and provide helpful warnings if API keys are missing.

### Backend Architecture

- **REST API Endpoints**: `/api/voice`, `/api/ask`, `/api/analytics`, etc.
- **Type-Safe Routes**: All Express routes with proper TypeScript types
- **Environment Validation**: Automatic validation on server startup
- **Error Handling**: Comprehensive error handling with type guards
- **Build Output**: Compiled to `backend/dist/` with source maps

See the full [Backend Documentation](backend/README.md) for:
- Complete API reference
- TypeScript configuration details
- Deployment instructions
- Troubleshooting guide

## How can I test my app?

### **On your phone (Recommended)**

1. **Android**: Download the [Expo Go app from Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Run `npm run start` and scan the QR code from your development server

> **Note**: iOS is not supported. This is an Android-only project.

### **In your browser**

Run `npm run start-web` to test in a web browser. Note: The browser preview is great for quick testing, but some native features may not be available.

### **Android Emulator**

You can test apps in Expo Go. You don't need Android Studio for most features.

**When do you need Custom Development Builds?**

- Native authentication (Fingerprint, biometric)
- In-app purchases and subscriptions
- Push notifications
- Custom native modules

Learn more: [Expo Custom Development Builds Guide](https://docs.expo.dev/develop/development-builds/introduction/)

If you have Android Studio installed:

```bash
# Android Emulator
npm run android

# Build release APK
npm run build:apk
```

## How can I deploy this project?

### **Publish to Google Play (Android)**

1. **Install EAS CLI**:

   ```bash
   npm i -g eas-cli
   ```

2. **Configure your project**:

   ```bash
   eas build:configure
   ```

3. **Build for Android**:

   ```bash
   eas build --platform android
   ```

4. **Submit to Google Play**:
   ```bash
   eas submit --platform android
   ```

For detailed instructions, visit [Expo's Google Play deployment guide](https://docs.expo.dev/submit/android/).

### **Sideload APK (Recommended)**

Build and distribute APKs directly for sideloading on Android devices:

```bash
# Build release APK locally
npm run build:apk
```

The APK can then be shared and installed directly on Android devices without going through Google Play.

> **Note**: iOS/App Store deployment is not supported. This is an Android-only project. See [ANDROID_ONLY.md](ANDROID_ONLY.md) for details.

### **Publish as a Website**

Your React Native app can also run on the web:

1. **Build for web**:

   ```bash
   eas build --platform web
   ```

2. **Deploy with EAS Hosting**:
   ```bash
   eas hosting:configure
   eas hosting:deploy
   ```

Alternative web deployment options:

- **Vercel**: Deploy directly from your GitHub repository
- **Netlify**: Connect your GitHub repo to Netlify for automatic deployments

## App Features

This template includes:

- **Android native compatibility** - Optimized for Android devices
- **File-based routing** with Expo Router
- **Tab navigation** with customizable tabs
- **Modal screens** for overlays and dialogs
- **TypeScript support** for better development experience
- **Async storage** for local data persistence
- **Vector icons** with Lucide React Native

## Project Structure

```
├── app/                    # App screens (Expo Router)
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── _layout.tsx    # Tab layout configuration
│   │   └── index.tsx      # Home tab screen
│   ├── _layout.tsx        # Root layout
│   ├── modal.tsx          # Modal screen example
│   └── +not-found.tsx     # 404 screen
├── assets/                # Static assets
│   └── images/           # App icons and images
├── constants/            # App constants and configuration
├── app.json             # Expo configuration
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## Custom Development Builds

For advanced native features, you'll need to create a Custom Development Build instead of using Expo Go.

### **When do you need a Custom Development Build?**

- **Native Authentication**: Fingerprint, biometric authentication
- **In-App Purchases**: Google Play subscriptions
- **Advanced Native Features**: Third-party SDKs, Android-specific features (e.g. Widgets)
- **Background Processing**: Background tasks, location tracking

### **Creating a Custom Development Build**

```bash
# Install EAS CLI
bun i -g @expo/eas-cli

# Configure your project for development builds
eas build:configure

# Create a development build for your device
eas build --profile development --platform android

# Install the development build on your device and start developing
npm start --dev-client
```

**Learn more:**

- [Development Builds Introduction](https://docs.expo.dev/develop/development-builds/introduction/)
- [Creating Development Builds](https://docs.expo.dev/develop/development-builds/create-a-build/)
- [Installing Development Builds](https://docs.expo.dev/develop/development-builds/installation/)

## Advanced Features

### **Add a Database**

Integrate with backend services:

- **Supabase** - PostgreSQL database with real-time features
- **Firebase** - Google's mobile development platform
- **Custom API** - Connect to your own backend

### **Add Authentication**

Implement user authentication:

**Basic Authentication (works in Expo Go):**

- **Expo AuthSession** - OAuth providers (Google, Facebook, Apple) - [Guide](https://docs.expo.dev/guides/authentication/)
- **Supabase Auth** - Email/password and social login - [Integration Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- **Firebase Auth** - Comprehensive authentication solution - [Setup Guide](https://docs.expo.dev/guides/using-firebase/)

**Native Authentication (requires Custom Development Build):**

- **Google Sign In** - Native Google authentication - [Setup Guide](https://docs.expo.dev/guides/google-authentication/)

### **Add Push Notifications**

Send notifications to your users:

- **Expo Notifications** - Cross-platform push notifications
- **Firebase Cloud Messaging** - Advanced notification features

### **Add Payments**

Monetize your app:

**Web & Credit Card Payments:**

- **Stripe** - Credit card payments and subscriptions - [Expo + Stripe Guide](https://docs.expo.dev/guides/using-stripe/)
- **PayPal** - PayPal payments integration - [Setup Guide](https://developer.paypal.com/docs/checkout/mobile/react-native/)

**Native In-App Purchases (requires Custom Development Build):**

- **RevenueCat** - In-app purchases and subscriptions for Android - [Expo Integration Guide](https://www.revenuecat.com/docs/expo)
- **Expo In-App Purchases** - Direct Google Play integration - [Implementation Guide](https://docs.expo.dev/versions/latest/sdk/in-app-purchases/)

**Paywall Optimization:**

- **Superwall** - Paywall A/B testing and optimization - [React Native SDK](https://docs.superwall.com/docs/react-native)
- **Adapty** - Mobile subscription analytics and paywalls - [Expo Integration](https://docs.adapty.io/docs/expo)

## I want to use a custom domain - is that possible?

For web deployments, you can use custom domains with:

- **EAS Hosting** - Custom domains available on paid plans
- **Netlify** - Free custom domain support
- **Vercel** - Custom domains with automatic SSL

For mobile apps, you'll configure your app's deep linking scheme in `app.json`.

## Troubleshooting

### **App not loading on device?**

1. Make sure your phone and computer are on the same WiFi network
2. Try using tunnel mode: `bun start -- --tunnel`
3. Check if your firewall is blocking the connection

### **Build failing?**

1. Clear your cache: `bunx expo start --clear`
2. Delete `node_modules` and reinstall: `rm -rf node_modules && bun install`
3. Check [Expo's troubleshooting guide](https://docs.expo.dev/troubleshooting/build-errors/)

### **Need help with native features?**

- Check [Expo's documentation](https://docs.expo.dev/) for native APIs
- Browse [React Native's documentation](https://reactnative.dev/docs/getting-started) for core components

## About this app

This is a fully native mobile app built using React Native and Expo - the same technology stack used by Discord, Shopify, Coinbase, Instagram, and many popular Android apps.

This app is production-ready and can be published to Google Play Store or distributed as an APK for sideloading on Android devices.

> **Note**: This is an Android-only project. iOS/Apple platforms are not supported. See [ANDROID_ONLY.md](ANDROID_ONLY.md) for details.
