import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Circle, Mic, MicOff } from 'lucide-react-native';
import JarvisInitializationService from '@/services/JarvisInitializationService';
import JarvisListenerService from '@/services/JarvisListenerService';

export default function JarvisStatusIndicator() {
  const [status, setStatus] = useState({
    initialized: false,
    aiProvidersConnected: 0,
    listeningMode: false,
    memoryCount: 0,
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadStatus();
    
    // Refresh status every 10 seconds (reduced from 5 for better performance)
    const interval = setInterval(loadStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      const currentStatus = await JarvisInitializationService.getStatus();
      setStatus(currentStatus);
    } catch (error) {
      console.error('[JarvisStatus] Failed to load status:', error);
    }
  };

  const toggleListening = async () => {
    try {
      await JarvisListenerService.toggleContinuousListening();
      await loadStatus();
    } catch (error) {
      console.error('[JarvisStatus] Failed to toggle listening:', error);
    }
  };

  const getStatusColor = () => {
    if (!status.initialized) return '#EF4444'; // Red
    if (status.aiProvidersConnected === 0) return '#F59E0B'; // Orange
    return '#10B981'; // Green
  };

  const getStatusText = () => {
    if (!status.initialized) return 'Initializing...';
    if (status.aiProvidersConnected === 0) return 'No AI Providers';
    return 'Operational';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.statusButton}
        onPress={() => setShowDetails(!showDetails)}
      >
        <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>JARVIS: {getStatusText()}</Text>
        {status.listeningMode && (
          <View style={styles.listeningBadge}>
            <Mic size={12} color="#00E5FF" />
          </View>
        )}
      </TouchableOpacity>

      {showDetails && (
        <View style={styles.detailsPanel}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <View style={styles.detailValue}>
              {status.initialized ? (
                <CheckCircle size={16} color="#10B981" />
              ) : (
                <Circle size={16} color="#6B7280" />
              )}
              <Text style={styles.detailText}>
                {status.initialized ? 'Initialized' : 'Starting...'}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>AI Providers:</Text>
            <Text style={styles.detailText}>
              {status.aiProvidersConnected} connected
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Memories:</Text>
            <Text style={styles.detailText}>
              {status.memoryCount} stored
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Voice Control:</Text>
            <TouchableOpacity 
              style={styles.listeningToggle}
              onPress={toggleListening}
            >
              {status.listeningMode ? (
                <>
                  <Mic size={16} color="#00E5FF" />
                  <Text style={[styles.detailText, { color: '#00E5FF' }]}>
                    Listening
                  </Text>
                </>
              ) : (
                <>
                  <MicOff size={16} color="#6B7280" />
                  <Text style={styles.detailText}>
                    Stopped
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.reinitButton}
            onPress={async () => {
              await JarvisInitializationService.reinitialize();
              await loadStatus();
            }}
          >
            <Text style={styles.reinitButtonText}>Reinitialize JARVIS</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1000,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  listeningBadge: {
    marginLeft: 8,
    backgroundColor: 'rgba(0, 229, 255, 0.2)',
    borderRadius: 10,
    padding: 2,
  },
  detailsPanel: {
    marginTop: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    minWidth: 250,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
  },
  detailValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  listeningToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  reinitButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
    alignItems: 'center',
  },
  reinitButtonText: {
    color: '#00E5FF',
    fontSize: 12,
    fontWeight: '600',
  },
});
