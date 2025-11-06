import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { AppProvider } from "@/contexts/AppContext";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import { trpc, trpcClient } from "@/lib/trpc";
import ErrorBoundary from "@/components/ErrorBoundary";
import StartupWizard from "@/components/StartupWizard";
import JarvisInitializationService from "@/services/JarvisInitializationService";
import GoogleAuthService from "@/services/auth/GoogleAuthService";
import UserProfileService from "@/services/user/UserProfileService";
import GoogleDriveSync from "@/services/sync/GoogleDriveSync";
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
  const [appReady, setAppReady] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  useEffect(() => {
    async function initializeApp() {
      try {
        console.log('[App] Starting app initialization...');
        
        // Step 1: Check authentication and load user profile
        const isAuthenticated = await checkAuthentication();
        
        if (!isAuthenticated) {
          console.log('[App] No authentication found, showing wizard');
          setShowWizard(true);
          setIsAuthenticating(false);
          SplashScreen.hideAsync();
          return;
        }

        // Step 2: Initialize JARVIS with user's API keys
        await initializeJarvis();
        
        setAppReady(true);
        console.log('[App] App initialization complete');
      } catch (error) {
        console.error('[App] App initialization error:', error);
        // Show wizard on error
        setShowWizard(true);
      } finally {
        setIsAuthenticating(false);
        SplashScreen.hideAsync();
      }
    }

    initializeApp();
    
    // Cleanup on unmount
    return () => {
      SchedulerService.stop();
      WebSocketService.disconnect();
      MonitoringService.stopMonitoring();
    };
  }, []);

  async function checkAuthentication(): Promise<boolean> {
    try {
      // Check if user is signed in with Google
      const googleUser = await GoogleAuthService.getStoredTokens();
      
      if (!googleUser) {
        console.log('[App] No Google user found');
        return false;
      }

      console.log('[App] Google user found:', googleUser.email);

      // Load or create user profile
      let profile = await UserProfileService.loadProfile(googleUser.id);
      
      if (!profile) {
        // Try to restore from cloud
        console.log('[App] No local profile, checking cloud...');
        profile = await GoogleDriveSync.downloadProfile();
        
        if (!profile) {
          // Create new profile
          console.log('[App] No cloud profile, creating new...');
          profile = await UserProfileService.createProfile(googleUser);
        }
      }

      // Check if setup is complete
      if (!profile.setupCompleted) {
        console.log('[App] Setup not complete');
        return false;
      }

      // Validate and refresh token if needed
      const accessToken = await GoogleAuthService.getAccessToken();
      if (!accessToken) {
        console.log('[App] Failed to get valid access token');
        return false;
      }

      console.log('[App] Authentication successful');
      return true;
    } catch (error) {
      console.error('[App] Authentication check error:', error);
      return false;
    }
  }

  async function initializeJarvis() {
    try {
      console.log('[App] Initializing Jarvis...');
      await JarvisInitializationService.initialize();
      
      // Initialize backend connectivity
      await PlugAndPlayService.initialize();
      
      // Initialize speech services
      await VoiceService.initialize();
      console.log('[App] VoiceService initialized');
      
      // JarvisVoiceService and JarvisListenerService auto-initialize in their constructors
      // Access them to ensure they're loaded (they're singleton instances)
      const speechServices = [JarvisVoiceService, JarvisListenerService];
      console.log('[App] Speech services initialized:', speechServices.length);
      
      // Start scheduler for automated tasks
      SchedulerService.start();
      console.log('[App] Scheduler service started');
      
      // Connect WebSocket for real-time updates
      WebSocketService.connect().catch((error) => {
        console.warn('[App] WebSocket connection failed (will retry):', error);
      });
      
      // Start system monitoring
      MonitoringService.startMonitoring();
      console.log('[App] Monitoring service started');
      
      console.log('[App] Jarvis initialization complete');
    } catch (error) {
      console.error('[App] Jarvis initialization error:', error);
      throw error;
    }
  }

  async function handleWizardComplete() {
    console.log('[App] Wizard completed, initializing app...');
    setShowWizard(false);
    setIsAuthenticating(true);
    
    try {
      // Initialize JARVIS after wizard completion
      await initializeJarvis();
      setAppReady(true);
    } catch (error) {
      console.error('[App] Failed to initialize after wizard:', error);
      setAppReady(true); // Continue loading app even if Jarvis fails
    } finally {
      setIsAuthenticating(false);
    }
  }

  if (showWizard) {
    return (
      <ErrorBoundary>
        <StartupWizard visible={true} onComplete={handleWizardComplete} />
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
