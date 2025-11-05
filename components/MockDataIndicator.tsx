import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertCircle, Info, Settings } from 'lucide-react-native';

interface MockDataIndicatorProps {
  service: string;
  dataType?: string;
  onSetupClick?: () => void;
  variant?: 'compact' | 'full';
}

export default function MockDataIndicator({
  service,
  dataType,
  onSetupClick,
  variant = 'compact',
}: MockDataIndicatorProps) {
  const getServiceMessage = () => {
    const messages: Record<string, string> = {
      'social-media': 'Sample social media data shown. Connect real accounts to see your data.',
      'analytics': 'Demo analytics shown. Connect platforms to track real metrics.',
      'monetization': 'Sample revenue data shown. Add real revenue streams to track earnings.',
      'trends': 'Demo trend data shown. Connect to real platforms for live trends.',
      'content': 'Sample content shown. Connect platforms to manage your real content.',
      'iot': 'No devices connected. Add IoT devices to control them.',
    };
    return messages[service] || `Using sample ${dataType || 'data'}. Connect real services for live data.`;
  };

  if (variant === 'compact') {
    return (
      <View style={styles.compactContainer}>
        <Info size={14} color="#ffa500" />
        <Text style={styles.compactText}>Sample Data</Text>
        {onSetupClick && (
          <TouchableOpacity onPress={onSetupClick} style={styles.compactButton}>
            <Settings size={12} color="#00f2ff" />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.fullContainer}>
      <View style={styles.fullHeader}>
        <AlertCircle size={18} color="#ffa500" />
        <Text style={styles.fullTitle}>Using Sample Data</Text>
      </View>
      <Text style={styles.fullMessage}>{getServiceMessage()}</Text>
      {onSetupClick && (
        <TouchableOpacity style={styles.setupButton} onPress={onSetupClick}>
          <Settings size={16} color="#fff" />
          <Text style={styles.setupButtonText}>Configure Real Data</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffa50015',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ffa50030',
    gap: 6,
  },
  compactText: {
    color: '#ffa500',
    fontSize: 11,
    fontWeight: '600',
  },
  compactButton: {
    padding: 2,
  },
  fullContainer: {
    backgroundColor: '#ffa50010',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ffa50030',
    marginVertical: 8,
  },
  fullHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  fullTitle: {
    color: '#ffa500',
    fontSize: 14,
    fontWeight: '600',
  },
  fullMessage: {
    color: '#ccc',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  setupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00f2ff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 8,
  },
  setupButtonText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '600',
  },
});
