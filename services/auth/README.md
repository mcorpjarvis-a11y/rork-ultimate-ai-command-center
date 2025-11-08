# Authentication System

A production-ready, single-user, local-first authentication and connection system for Android-only applications (Expo Go, Android APK, and Termux).

## Overview

This authentication system eliminates the need for manual API keys by handling OAuth 2.0 flows and secure on-device token storage. It supports:

- ✅ **PKCE OAuth 2.0** for mobile (Expo Go, Android APK)
- ✅ **Device Flow** for headless environments (Termux)
- ✅ **Local Tokens** for smart home devices
- ✅ **Automatic Token Refresh**
- ✅ **Event-Driven Architecture**
- ✅ **Secure On-Device Storage**

## Supported Platforms

- **Expo Go (Android)**: Full OAuth support with PKCE
- **Android APK (Release)**: Production-ready builds
- **Termux**: Device Flow where supported, fallback to manual flows

**⚠️ Important**: NO iOS/Apple support. This is an Android-only implementation.

## Core Architecture

### Services

#### AuthManager
The central orchestrator for all authentication operations.

```typescript
import AuthManager from '@/services/auth/AuthManager';

// Start OAuth flow
await AuthManager.startAuthFlow('google');

// Get access token (auto-refreshes if expired)
const token = await AuthManager.getAccessToken('google');

// Refresh token manually
await AuthManager.refreshAccessToken('google');

// Revoke and disconnect
await AuthManager.revokeProvider('google');

// Check connection status
const isConnected = await AuthManager.isConnected('google');
const status = await AuthManager.getProviderStatus('google');

// List all connected providers
const providers = await AuthManager.getConnectedProviders();

// Add local token (for smart home devices)
await AuthManager.addLocalToken('homeassistant', 'your-token', {
  baseUrl: 'http://homeassistant.local:8123'
});
```

#### TokenVault
Secure token storage using hardware-encrypted storage (SecureStore).

```typescript
import TokenVault from '@/services/auth/TokenVault';

// Save token
await TokenVault.saveToken('provider', {
  access_token: 'token',
  refresh_token: 'refresh',
  expires_in: 3600,
  scopes: ['read', 'write']
});

// Get token
const tokenData = await TokenVault.getToken('provider');

// Remove token
await TokenVault.removeToken('provider');

// List all providers with tokens
const providers = await TokenVault.listProviders();

// Check if token is expired
const isExpired = TokenVault.isTokenExpired(tokenData);
```

#### MasterProfile
Single-user profile management.

```typescript
import MasterProfile from '@/services/auth/MasterProfile';

// Get profile
const profile = await MasterProfile.getMasterProfile();

// Save profile
await MasterProfile.saveMasterProfile({
  id: 'user-id',
  email: 'user@example.com',
  name: 'User Name',
  avatar: 'https://...',
  createdAt: new Date().toISOString(),
  connectedProviders: ['google', 'github']
});

// Add connected provider
await MasterProfile.addConnectedProvider('discord');

// Remove connected provider
await MasterProfile.removeConnectedProvider('discord');

// Clear profile
await MasterProfile.clearMasterProfile();
```

### Provider Helpers

Each provider has a dedicated helper module in `services/auth/providerHelpers/`:

#### Implemented Providers

- **google.ts** - Google OAuth (Drive, YouTube, Gmail, etc.)
- **github.ts** - GitHub OAuth with Device Flow
- **discord.ts** - Discord OAuth
- **spotify.ts** - Spotify OAuth
- **reddit.ts** - Reddit OAuth (installed app)
- **homeassistant.ts** - Home Assistant local tokens

#### Provider Configuration

```typescript
import { PROVIDERS, getProvider } from '@/services/auth/providerHelpers/config';

// Get provider config
const googleConfig = getProvider('google');

// List all providers
const allProviders = PROVIDERS;

// Get device flow providers
import { getDeviceFlowProviders } from '@/services/auth/providerHelpers/config';
const deviceFlowProviders = getDeviceFlowProviders();
```

### Events

AuthManager uses an event bus for real-time updates:

```typescript
// Subscribe to events
AuthManager.on('connected', (provider, data) => {
  console.log(`Connected to ${provider}`);
});

AuthManager.on('disconnected', (provider) => {
  console.log(`Disconnected from ${provider}`);
});

AuthManager.on('token_refreshed', (provider, data) => {
  console.log(`Token refreshed for ${provider}`);
});

// Unsubscribe
AuthManager.off('connected', handler);
```

## UI Components

### SignInScreen
First-launch onboarding screen for Google Sign-In.

```typescript
import SignInScreen from '@/screens/Onboarding/SignInScreen';

// Use in your navigation
<SignInScreen />
```

Features:
- Google Sign-In button
- Creates Master Profile on success
- Skip option for anonymous usage
- Auto-navigates to dashboard

### ConnectionsHub
Provider connection management interface.

```typescript
import ConnectionsHub from '@/components/ConnectionsHub';

// Use in your navigation
<ConnectionsHub />
```

Features:
- Grid layout with provider tiles
- Status indicators (Connected, Not Connected, Needs Re-Auth)
- Connect/disconnect actions
- Local token wizard for smart home devices
- Real-time updates via event subscriptions

## Usage Examples

### Basic Integration

```typescript
// In your service or component
import AuthManager from '@/services/auth/AuthManager';

// Get token for API call
async function makeAPICall() {
  const token = await AuthManager.getAccessToken('google');
  
  if (!token) {
    throw new Error('Not authenticated');
  }
  
  const response = await fetch('https://api.example.com/data', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
}
```

### Connecting a Provider

```typescript
import AuthManager from '@/services/auth/AuthManager';

async function connectProvider(providerName: string) {
  try {
    const success = await AuthManager.startAuthFlow(providerName);
    
    if (success) {
      console.log(`Connected to ${providerName}`);
      // Update UI
    }
  } catch (error) {
    console.error('Connection failed:', error);
  }
}
```

### Using Events in React Components

```typescript
import { useEffect, useState } from 'react';
import AuthManager from '@/services/auth/AuthManager';

function MyComponent() {
  const [connectedProviders, setConnectedProviders] = useState<string[]>([]);
  
  useEffect(() => {
    // Load initial state
    AuthManager.getConnectedProviders().then(setConnectedProviders);
    
    // Subscribe to updates
    const handleConnected = (provider: string) => {
      setConnectedProviders(prev => [...prev, provider]);
    };
    
    const handleDisconnected = (provider: string) => {
      setConnectedProviders(prev => prev.filter(p => p !== provider));
    };
    
    AuthManager.on('connected', handleConnected);
    AuthManager.on('disconnected', handleDisconnected);
    
    return () => {
      AuthManager.off('connected', handleConnected);
      AuthManager.off('disconnected', handleDisconnected);
    };
  }, []);
  
  return (
    <View>
      <Text>Connected: {connectedProviders.join(', ')}</Text>
    </View>
  );
}
```

## Environment Variables

Create a `.env` file with your OAuth client IDs:

```env
# Google OAuth
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=your_google_client_id

# GitHub OAuth
EXPO_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id

# Discord OAuth
EXPO_PUBLIC_DISCORD_CLIENT_ID=your_discord_client_id

# Spotify OAuth
EXPO_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id

# Reddit OAuth
EXPO_PUBLIC_REDDIT_CLIENT_ID=your_reddit_client_id
```

**Important**: 
- Use `.env.example` as a template
- Never commit `.env` to version control
- Client secrets are NOT required for PKCE flows
- Do NOT include client secrets in mobile apps

## Security

### Token Storage
- All tokens stored using `SecureKeyStorage`
- Hardware-encrypted on native platforms (Android Keystore)
- Fallback to AsyncStorage on web (for development only)

### OAuth Flows
- **PKCE** (Proof Key for Code Exchange) for all mobile flows
- No client secrets in mobile app code
- Device Flow for headless environments

### Best Practices
- ✅ Never log tokens
- ✅ Never commit secrets
- ✅ Use environment variables for client IDs
- ✅ Validate tokens before API calls
- ✅ Handle token refresh automatically
- ✅ Revoke tokens on sign-out

## Testing

See `AUTH_INTEGRATION_GUIDE.md` for detailed manual testing procedures.

### Quick Test

```typescript
// Test TokenVault
import TokenVault from '@/services/auth/TokenVault';

await TokenVault.saveToken('test', {
  access_token: 'test-token',
  expires_in: 3600
});

const token = await TokenVault.getToken('test');
console.log('Token:', token);

await TokenVault.removeToken('test');
```

## Adding New Providers

1. Create a new helper file in `services/auth/providerHelpers/`:

```typescript
// services/auth/providerHelpers/newprovider.ts
import * as AuthSession from 'expo-auth-session';
import { AuthResponse } from '../types';

export async function startAuth(): Promise<AuthResponse> {
  // Implement OAuth flow
}

export async function refreshToken(refresh_token: string): Promise<AuthResponse> {
  // Implement token refresh
}

export async function revokeToken(token: string): Promise<void> {
  // Implement token revocation
}
```

2. Add provider configuration in `config.ts`:

```typescript
newprovider: {
  name: 'newprovider',
  displayName: 'New Provider',
  authUrl: 'https://...',
  tokenUrl: 'https://...',
  scopes: ['read'],
  supportsDeviceFlow: false,
  supportsLocalToken: false,
}
```

3. Use it:

```typescript
await AuthManager.startAuthFlow('newprovider');
```

## Troubleshooting

### OAuth Redirect Issues
- Verify redirect URI matches provider console settings
- For Expo, use `npx expo start --clear` to refresh
- Check `AuthSession.makeRedirectUri()` output

### Token Refresh Failures
- Verify refresh token exists
- Check provider supports token refresh
- Some providers (GitHub) have long-lived tokens

### SecureStore Errors
- SecureStore requires native platform
- Web development uses AsyncStorage fallback
- Check `Platform.OS` is 'android'

## Migration from Old Auth

If you have existing code using the old `GoogleAuthService`:

```typescript
// Old code
import GoogleAuthService from '@/services/auth/GoogleAuthService';
const token = await GoogleAuthService.getAccessToken();

// New code
import AuthManager from '@/services/auth/AuthManager';
const token = await AuthManager.getAccessToken('google');

// Or use the adapter for gradual migration
import GoogleAuthAdapter from '@/services/auth/GoogleAuthAdapter';
const token = await GoogleAuthAdapter.getAccessToken();
```

## License

This authentication system is part of the RORK AI Command Center project.
