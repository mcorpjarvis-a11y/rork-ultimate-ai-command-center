# Auth System Integration Guide

## Overview
This guide explains how to integrate the new authentication system into existing services and test the functionality.

## Architecture

### Core Components
1. **AuthManager** (`services/auth/AuthManager.ts`)
   - Central orchestrator for all authentication flows
   - Manages OAuth flows, token refresh, and provider connections
   - Event bus for auth state changes

2. **TokenVault** (`services/auth/TokenVault.ts`)
   - Secure token storage using SecureKeyStorage
   - Automatic expiration checking
   - CRUD operations for tokens

3. **MasterProfile** (`services/auth/MasterProfile.ts`)
   - Single-user profile management
   - Tracks connected providers
   - Stores user information

4. **Provider Helpers** (`services/auth/providerHelpers/*.ts`)
   - Individual OAuth implementations per provider
   - Support for PKCE (mobile) and Device Flow (Termux)
   - Dynamic loading to reduce bundle size

### UI Components
1. **SignInScreen** (`screens/Onboarding/SignInScreen.tsx`)
   - First-launch onboarding
   - Google Sign-In creates Master Profile
   - Skip option for anonymous usage

2. **ConnectionsHub** (`components/ConnectionsHub.tsx`)
   - Provider connection management
   - Grid layout with status indicators
   - Connect/disconnect actions
   - Local token wizard for smart home devices

## Integration Steps

### 1. Migrating Existing Google Auth
The app currently uses `GoogleAuthService.ts`. To integrate with the new system:

```typescript
// In your service or component:
import AuthManager from '@/services/auth/AuthManager';

// Instead of:
// const token = await GoogleAuthService.getAccessToken();

// Use:
const token = await AuthManager.getAccessToken('google');
```

### 2. Adding the ConnectionsHub to Navigation
Add a new navigation item to the Sidebar for "Connections":

```typescript
// In Sidebar component or navigation config:
{
  id: 'integrations-connections',
  label: 'Connections Hub',
  icon: 'link',
  page: 'integrations-connections'
}
```

Then in the main app, render ConnectionsHub:

```typescript
case 'integrations-connections':
  return <ConnectionsHub />;
```

### 3. Updating _layout.tsx for New Auth Flow
Replace the existing authentication check with Master Profile check:

```typescript
import MasterProfile from '@/services/auth/MasterProfile';

async function checkAuthentication(): Promise<boolean> {
  try {
    const profile = await MasterProfile.getMasterProfile();
    return profile !== null;
  } catch (error) {
    console.error('[App] Auth check error:', error);
    return false;
  }
}
```

### 4. Using Auth Events in Components
Subscribe to auth events for real-time updates:

```typescript
import AuthManager from '@/services/auth/AuthManager';

useEffect(() => {
  const handleConnected = (provider: string) => {
    console.log(`Connected to ${provider}`);
    // Update UI
  };

  AuthManager.on('connected', handleConnected);
  
  return () => {
    AuthManager.off('connected', handleConnected);
  };
}, []);
```

## Manual Testing Procedures

### Test 1: First Launch & Google Sign-In
**Platform:** Expo Go (Android)

1. Clear app data: `AsyncStorage.clear()` or reinstall
2. Launch app
3. Should show SignInScreen
4. Tap "Sign in with Google"
5. Complete Google OAuth flow
6. Verify:
   - Master Profile created
   - Google token saved in TokenVault
   - App navigates to dashboard
   - User info displayed in header/profile

**Expected Result:** ✅ User signed in, profile created, token stored securely

### Test 2: ConnectionsHub - Connect Provider
**Platform:** Expo Go (Android)

1. Navigate to Connections Hub
2. Find a provider tile (e.g., Discord)
3. Tap "Connect"
4. Complete OAuth flow
5. Verify:
   - Tile updates to "Connected" status
   - Token saved in TokenVault
   - Provider added to Master Profile
   - Event emitted and UI updates

**Expected Result:** ✅ Provider connected, token stored, UI updated

### Test 3: ConnectionsHub - Disconnect Provider
**Platform:** Expo Go (Android)

1. Navigate to Connections Hub
2. Find a connected provider
3. Tap "Disconnect"
4. Confirm disconnect
5. Verify:
   - Token removed from TokenVault
   - Provider removed from Master Profile
   - Tile updates to "Not Connected"
   - Revoke API called (if supported)

**Expected Result:** ✅ Provider disconnected, token removed, UI updated

### Test 4: Token Refresh
**Platform:** Expo Go (Android)

1. Connect a provider (e.g., Google)
2. Manually expire token in TokenVault (set expires_at to past)
3. Call `AuthManager.getAccessToken('google')`
4. Verify:
   - Token automatically refreshed
   - New token saved
   - `token_refreshed` event emitted

**Expected Result:** ✅ Token auto-refreshed, new token stored

### Test 5: Local Token (Smart Home)
**Platform:** Expo Go (Android)

1. Navigate to Connections Hub
2. Find Home Assistant tile
3. Tap "Add Token"
4. Enter a dummy token
5. Optionally add metadata (e.g., baseUrl)
6. Tap "Add Token"
7. Verify:
   - Token saved in TokenVault
   - Provider added to Master Profile
   - Tile shows "Connected"

**Expected Result:** ✅ Local token stored, provider connected

### Test 6: Device Flow (Termux)
**Platform:** Termux on Android

1. Install Node.js in Termux
2. Clone repository
3. Install dependencies
4. Run a test script that calls `AuthManager.startAuthFlow('github')`
5. Verify:
   - Device code displayed
   - Verification URL shown
   - User can visit URL on another device
   - Token received after authorization
   - Token saved in TokenVault

**Expected Result:** ✅ Device Flow works, token stored

### Test 7: Android APK Build
**Platform:** Android APK (Release)

1. Build release APK: `npm run build:apk`
2. Install on Android device
3. Complete onboarding
4. Connect at least one provider
5. Verify:
   - No runtime errors
   - OAuth flows work
   - Tokens persisted across app restarts
   - UI responsive and functional

**Expected Result:** ✅ APK runs without errors, full functionality

## Security Checklist

- [ ] No secrets (client IDs, client secrets) hardcoded
- [ ] All secrets loaded from environment variables
- [ ] Tokens stored using SecureKeyStorage
- [ ] No token logging in production
- [ ] PKCE used for all mobile OAuth flows
- [ ] Client secrets not included in mobile bundle (PKCE doesn't require them)

## Environment Variables Required

Create a `.env` file with the following:

```env
# Google OAuth
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=your_client_id_here

# GitHub OAuth
EXPO_PUBLIC_GITHUB_CLIENT_ID=your_client_id_here

# Discord OAuth
EXPO_PUBLIC_DISCORD_CLIENT_ID=your_client_id_here

# Spotify OAuth
EXPO_PUBLIC_SPOTIFY_CLIENT_ID=your_client_id_here

# Add other providers as needed
```

**Important:** Never commit `.env` to the repository. Use `.env.example` as a template.

## Supported Providers

### OAuth Providers (PKCE)
- ✅ Google (with Drive, YouTube, Gmail scopes)
- ✅ GitHub (with Device Flow support)
- ✅ Discord
- ✅ Spotify
- 🔄 Reddit (template available)
- 🔄 Twitter/X (template available)
- 🔄 Slack (template available)
- 🔄 Notion (template available)

### Local Token Providers
- ✅ Home Assistant
- 🔄 Philips Hue
- 🔄 Tuya Smart Home

### Legend
- ✅ Implemented
- 🔄 Template available, needs testing
- ⏳ Not yet implemented

## Troubleshooting

### Issue: OAuth redirect not working
**Solution:** Check that redirect URI in provider console matches `AuthSession.makeRedirectUri()` output. For Google, add `myapp://redirect` to allowed redirect URIs.

### Issue: Token not refreshing
**Solution:** Verify refresh token is present and provider helper implements `refreshToken()`. Some providers (like GitHub) don't support refresh.

### Issue: SecureKeyStorage fails
**Solution:** SecureStore requires native platform (Android/iOS). On web, it falls back to AsyncStorage. Check platform with `Platform.OS`.

### Issue: Provider helper not found
**Solution:** Verify helper file exists in `services/auth/providerHelpers/` and is named correctly (lowercase, no spaces).

## Next Steps

1. **Add More Providers**: Create helper files for additional providers using existing templates
2. **Integrate with Services**: Update existing services to use AuthManager instead of direct API key access
3. **Add Proper Testing**: Set up Jest or another test framework for automated testing
4. **Enhance UI**: Add provider logos, better status indicators, connection history
5. **Add Analytics**: Track connection success rates, token refresh frequency, etc.
