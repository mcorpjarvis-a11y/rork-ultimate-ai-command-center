# Google Authentication Guide

## OAuth Should Work Automatically

Google sign-in is configured to work out of the box using Expo's authentication proxy. **You should NOT need to manually configure OAuth credentials for basic sign-in.**

## How It Works

The app uses:
- **Expo AuthSession Proxy**: Handles OAuth automatically without manual setup
- **PKCE Flow**: Secure authentication for mobile apps
- **Pre-configured Client ID**: Already set up for testing

## If Google Sign-In Fails

### Common Reasons and Solutions

#### 1. **You Cancelled the Sign-In**
If you closed the browser or clicked "Cancel" during sign-in, that's why it failed. Just try again!

#### 2. **Network Issues**
Check your internet connection and try again.

#### 3. **Denied Permissions**
If you clicked "Deny" when Google asked for permissions, the sign-in will fail. Try again and click "Allow."

#### 4. **Running on iOS**
This app only supports Android. iOS is not supported.

### Use Email Sign-In Instead

The easiest solution: **Use email authentication!**

1. Open the app
2. Click "Sign Up" or "Sign In"  
3. Enter your email and password (min 8 characters)
4. You're done!

Later, you can optionally connect Google from Settings → Connected Accounts.

## Advanced: Custom OAuth Setup (Optional)

Only do this if you want to use your own Google OAuth credentials instead of the default ones.

### When You Might Want Custom Credentials
- You're deploying to production
- You want your own branding in the OAuth consent screen
- You need additional Google API access (Drive, Calendar, etc.)

### Steps for Custom Setup

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the "Google+ API" and "People API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Choose "Android" as the application type
6. Enter your package name: `com.mcorpjarvis.aicommandcenter`
7. Get your SHA-1 certificate fingerprint:
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```
8. Copy the Client ID and add it to your `.env` file:
   ```
   EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=your-client-id-here.apps.googleusercontent.com
   ```

### 2. **Redirect URI Mismatch**

The app uses the redirect URI: `myapp://redirect`

**Problem**: The redirect URI configured in Google Cloud Console must exactly match what the app uses.

**Solution**: In Google Cloud Console, ensure your OAuth client has this redirect URI:
- `myapp://redirect`

### 3. **Incorrect App Signing**

**Problem**: Google OAuth for Android requires the SHA-1 certificate fingerprint to match.

**Solution**:
- For debug builds: Use the debug keystore SHA-1
- For release builds: Use your release keystore SHA-1
- Make sure the SHA-1 in Google Console matches the keystore you're using

### 4. **OAuth Consent Screen Not Configured**

**Problem**: Google requires an OAuth consent screen to be configured before users can sign in.

**Solution**:
1. Go to "OAuth consent screen" in Google Cloud Console
2. Choose "External" for testing (or "Internal" if you have a Google Workspace)
3. Fill in the required fields:
   - App name: "Ultimate AI Command Center"
   - User support email: your email
   - Developer contact: your email
4. Add scopes:
   - `openid`
   - `profile`
   - `email`
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `https://www.googleapis.com/auth/userinfo.email`
5. Add test users if using "External" in testing mode

### 5. **Missing API Enablement**

**Problem**: Required Google APIs may not be enabled for your project.

**Solution**: Enable these APIs in Google Cloud Console:
- Google+ API (for profile information)
- People API (for user information)
- Google Drive API (if using Drive sync)

### 6. **App Not Running on Android**

**Problem**: The current implementation only supports Android (not iOS).

**Solution**: Make sure you're running the app on:
- Android device
- Android emulator
- Expo Go on Android
- **NOT on iOS** (iOS support is explicitly disabled)

## Quick Fix Steps

1. **Use Email Authentication Instead** (Recommended for immediate access):
   - The app now supports email-based authentication
   - You can sign up with just an email and password
   - Google sign-in is now optional

2. **Configure Your Own Google OAuth**:
   - Follow the steps in "Missing or Invalid OAuth Credentials" above
   - Create your own client ID
   - Add it to `.env` file

3. **Check Console Logs**:
   - Look for specific error messages in the console
   - Common errors:
     - `redirect_uri_mismatch`: Fix redirect URI in Google Console
     - `invalid_client`: Invalid Client ID
     - `access_denied`: User denied permission or OAuth not configured
     - `unauthorized_client`: App not registered properly

## Testing Your Configuration

After setting up Google OAuth, test with these steps:

1. Clear app data/cache
2. Restart the app
3. Try Google sign-in
4. Check console logs for detailed error messages

## Environment Variables

Create a `.env` file in the project root with:

```bash
# Google OAuth for Android
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=your-client-id.apps.googleusercontent.com
# Optional: Only needed for server-side flows (not PKCE)
EXPO_PUBLIC_GOOGLE_CLIENT_SECRET=your-client-secret

# Google Drive (optional, for cloud sync)
EXPO_PUBLIC_GOOGLE_DRIVE_CLIENT_ID=your-drive-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_DRIVE_CLIENT_SECRET=your-drive-client-secret
EXPO_PUBLIC_GOOGLE_DRIVE_API_KEY=your-drive-api-key
```

## Alternative: Use Email Authentication

Since Google authentication requires additional setup, you can use the newly implemented email authentication:

1. Open the app
2. Choose "Sign Up" or "Sign In"
3. Enter your email and password (min 8 characters)
4. Create your account
5. Later, you can connect Google from Settings → Connected Accounts

This allows you to use the app immediately while setting up Google OAuth properly.

## Error Messages Reference

| Error | Meaning | Solution |
|-------|---------|----------|
| `redirect_uri_mismatch` | Redirect URI doesn't match | Fix in Google Console |
| `invalid_client` | Client ID is wrong or not found | Check Client ID |
| `access_denied` | User denied or OAuth not configured | Configure OAuth consent screen |
| `unauthorized_client` | App not properly registered | Complete OAuth setup |
| `invalid_grant` | Authorization code expired | Try again |
| `invalid_scope` | Requested scope not enabled | Enable APIs in Console |

## Need More Help?

Check the console logs for specific error messages. The app logs detailed information about:
- Platform (Android/iOS)
- Redirect URI being used
- Auth result type
- Specific error codes

Look for log entries starting with `[GoogleProvider]` for detailed debugging information.
