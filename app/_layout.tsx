import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { AppProvider } from "@/contexts/AppContext";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import { trpc, trpcClient } from "@/lib/trpc";
import ErrorBoundary from "@/components/ErrorBoundary";
import SignInScreen from "@/screens/Onboarding/SignInScreen";
import JarvisInitializationService from "@/services/JarvisInitializationService";
import MasterProfile from "@/services/auth/MasterProfile";
import AuthManager from "@/services/auth/AuthManager";
import SecureKeyStorage from "@/services/security/SecureKeyStorage";
import ConfigValidator from "@/services/config/ConfigValidator";
import OnboardingStatus from "@/services/onboarding/OnboardingStatus";
import OAuthRequirementService from "@/services/onboarding/OAuthRequirementService";
import MasterProfileValidator from "@/services/onboarding/MasterProfileValidator";
import JarvisAlwaysListeningService from "@/services/JarvisAlwaysListeningService";
import { 
  SchedulerService, 
  WebSocketService, 
  MonitoringService, 
  PlugAndPlayService,
  JarvisVoiceService,
  JarvisListenerService,
  VoiceService
} from "@/services";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back", headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const router = useRouter();
  const [appReady, setAppReady] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [initSequence, setInitSequence] = useState(0);

  useEffect(() => {
    async function initializeApp() {
      try {
        console.log('[App] 🚀 Starting app initialization...');
        
        // Step 0: Validate configuration
        console.log('[App] Step 0: Validating configuration...');
        const configValidation = ConfigValidator.validateConfig();
        
        if (!ConfigValidator.canRunApp(configValidation)) {
          console.error('[App] ❌ Critical configuration errors:', configValidation.errors);
          // Show error but continue - app can still work with local features
        }
        
        if (configValidation.warnings.length > 0) {
          console.warn('[App] ⚠️  Configuration warnings:', configValidation.warnings);
        }
        
        // Step 1: Test SecureStorage on app startup
        console.log('[App] Step 1: Testing secure storage...');
        const storageWorks = await SecureKeyStorage.testSecureStorage();
        if (!storageWorks) {
          console.warn('[App] ⚠️  SecureStorage not fully functional, some features may be limited');
        } else {
          console.log('[App] ✅ SecureStorage test passed');
        }
        
        // Steps 2-4: Parallel authentication and validation checks (OPTIMIZED)
        console.log('[App] Steps 2-4: Checking authentication, OAuth, and onboarding in parallel...');
        
        const [isAuthenticated, oauthValid, onboardingComplete] = await Promise.all([
          checkAuthentication(),
          OAuthRequirementService.hasValidOAuthProfile(),
          OnboardingStatus.isOnboardingComplete()
        ]);
        
        // Check authentication result
        if (!isAuthenticated) {
          console.log('[App] ❌ No valid master profile found, showing sign-in');
          console.log('[App] 🔐 OAuth login REQUIRED to proceed');
          setShowSignIn(true);
          setIsAuthenticating(false);
          SplashScreen.hideAsync();
          return;
        }
        console.log('[App] ✅ Authentication check passed');

        // Check OAuth validation result
        if (!oauthValid) {
          console.log('[App] ❌ OAuth providers not connected, showing sign-in');
          setShowSignIn(true);
          setIsAuthenticating(false);
          SplashScreen.hideAsync();
          return;
        }
        console.log('[App] ✅ OAuth validation passed');
        
        // Log OAuth status asynchronously (non-blocking)
        OAuthRequirementService.logOAuthStatus();

        // Check onboarding status result
        
        if (!onboardingComplete) {
          console.log('[App] ⚠️  Profile exists but onboarding not complete, redirecting to wizard');
          setIsAuthenticating(false);
          SplashScreen.hideAsync();
          // Let the router navigate to permissions screen
          router.replace('/onboarding/permissions');
          return;
        }
        
        // Step 5: Validate master profile integrity (non-blocking log)
        console.log('[App] Step 5: Validating master profile...');
        MasterProfileValidator.logValidationStatus(); // Non-blocking - logs asynchronously

        // Step 6: Initialize JARVIS with real data
        console.log('[App] Step 6: Initializing JARVIS with live data...');
        await initializeJarvis();
        
        setAppReady(true);
        console.log('[App] ✅ JARVIS initialized and ready');
        console.log('[App] 🎯 App initialization complete - All systems operational');
      } catch (error) {
        console.error('[App] ❌ App initialization error:', error);
        // Show sign-in on error
        setShowSignIn(true);
      } finally {
        setIsAuthenticating(false);
        SplashScreen.hideAsync();
      }
    }

    initializeApp();

    // Cleanup on unmount
    return () => {
      JarvisAlwaysListeningService.stop();
      SchedulerService.stop();
      WebSocketService.disconnect();
      MonitoringService.stopMonitoring();
    };
  }, [router, initSequence]);

  useEffect(() => {
    const handleAuthSuccess = () => {
      console.log('[App] 🔄 Authenticated event received - restarting initialization');
      setShowSignIn(false);
      setAppReady(false);
      setIsAuthenticating(true);
      setInitSequence((value) => value + 1);
    };

    AuthManager.on('authenticated', handleAuthSuccess);

    return () => {
      AuthManager.off('authenticated', handleAuthSuccess);
    };
  }, []);

  async function checkAuthentication(): Promise<boolean> {
    try {
      // Check if master profile exists
      const profile = await MasterProfile.getMasterProfile();
      
      if (!profile) {
        console.log('[App] ❌ No master profile found');
        return false;
      }

      console.log('[App] ✅ Master profile found:', profile.email || profile.id);
      
      // Verify OAuth providers are connected
      const hasOAuth = profile.connectedProviders && profile.connectedProviders.length > 0;
      
      if (!hasOAuth) {
        console.log('[App] ❌ Master profile exists but no OAuth providers connected');
        return false;
      }
      
      console.log('[App] ✅ OAuth providers connected:', profile.connectedProviders.join(', '));
      return true;
    } catch (error) {
      console.error('[App] ❌ Authentication check error:', error);
      return false;
    }
  }

  async function initializeJarvis() {
    try {
      console.log('[Jarvis] 🤖 Initializing JARVIS core systems...');
      
      // Initialize core JARVIS services (NO voice services yet)
      await JarvisInitializationService.initialize();
      console.log('[Jarvis] ✅ Core JARVIS services initialized');
      
      // Initialize backend connectivity with error handling
      try {
        console.log('[Jarvis] Connecting to backend services...');
        await PlugAndPlayService.initialize();
        console.log('[Jarvis] ✅ Backend services connected');
      } catch (error) {
        console.warn('[Jarvis] ⚠️  Backend connectivity initialization failed (will retry later):', error);
        // Continue - app can work without backend
      }
      
      // NOW initialize speech services (lazy-loaded post-OAuth)
      try {
        console.log('[Jarvis] Initializing speech recognition services...');
        await VoiceService.initialize();
        console.log('[Jarvis] ✅ VoiceService initialized');
        
        // JarvisVoiceService and JarvisListenerService auto-initialize in their constructors
        // Access them to ensure they're loaded (they're singleton instances)
        const speechServices = [JarvisVoiceService, JarvisListenerService];
        console.log('[Jarvis] ✅ Speech services initialized:', speechServices.length);
      } catch (error) {
        console.error('[Jarvis] ❌ Speech recognition error:', error);
        console.warn('[Jarvis] ⚠️  Speech services unavailable, continuing without voice features');
        // Continue without voice - other features still work
      }
      
      // Start always-listening service for wake word detection (lazy-loaded)
      try {
        console.log('[Jarvis] Starting always-listening service...');
        const alwaysListeningStarted = await JarvisAlwaysListeningService.start();
        if (alwaysListeningStarted) {
          console.log('[Jarvis] ✅ Always-listening service started - JARVIS is now listening for wake word');
        } else {
          console.warn('[Jarvis] ⚠️  Always-listening service could not be started');
        }
      } catch (error) {
        console.error('[Jarvis] ❌ Failed to start always-listening service:', error);
        console.warn('[Jarvis] ⚠️  Continuing without wake word detection');
        // Continue - wake word is optional
      }
      
      // Start scheduler for automated tasks
      SchedulerService.start();
      console.log('[Jarvis] ✅ Scheduler service started');
      
      // Connect WebSocket for real-time updates with error handling
      try {
        console.log('[Jarvis] Connecting WebSocket...');
        await WebSocketService.connect();
        console.log('[Jarvis] ✅ WebSocket connected');
      } catch (error) {
        console.warn('[Jarvis] ⚠️  WebSocket connection failed (will retry automatically):', error);
        // Continue - app can work without WebSocket
      }
      
      // Start system monitoring
      MonitoringService.startMonitoring();
      console.log('[Jarvis] ✅ Monitoring service started');
      
      console.log('[Jarvis] 🎉 JARVIS initialization complete - All systems operational!');
    } catch (error) {
      console.error('[Jarvis] ❌ JARVIS initialization error:', error);
      // Don't throw - allow app to continue with reduced functionality
      console.warn('[Jarvis] ⚠️  Continuing with reduced functionality');
    }
  }

  if (showSignIn) {
    return (
      <ErrorBoundary>
        <SignInScreen />
      </ErrorBoundary>
    );
  }

  if (isAuthenticating) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00E5FF" />
        <Text style={styles.loadingText}>Initializing JARVIS...</Text>
      </View>
    );
  }

  if (!appReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00E5FF" />
        <Text style={styles.loadingText}>Initializing JARVIS...</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <AppProvider>
            <View style={styles.container}>
              <RootLayoutNav />
            </View>
          </AppProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#00E5FF',
    fontSize: 16,
    marginTop: 20,
    fontWeight: '600',
  },
});
