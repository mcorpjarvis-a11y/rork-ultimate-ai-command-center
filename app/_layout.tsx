import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { AppProvider } from "@/contexts/AppContext";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import { trpc, trpcClient } from "@/lib/trpc";
import ErrorBoundary from "@/components/ErrorBoundary";
import JarvisInitializationService from "@/services/JarvisInitializationService";
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
  const [jarvisReady, setJarvisReady] = useState(false);

  useEffect(() => {
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
        
        setJarvisReady(true);
        console.log('[App] Jarvis initialization complete');
      } catch (error) {
        console.error('[App] Jarvis initialization error:', error);
        // Continue loading app even if Jarvis fails to initialize
        setJarvisReady(true);
      } finally {
        SplashScreen.hideAsync();
      }
    }

    initializeJarvis();
    
    // Cleanup on unmount
    return () => {
      SchedulerService.stop();
      WebSocketService.disconnect();
      MonitoringService.stopMonitoring();
    };
  }, []);

  if (!jarvisReady) {
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
