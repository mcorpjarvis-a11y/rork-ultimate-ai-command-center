import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Check, X, AlertCircle, ExternalLink } from 'lucide-react-native';
import JarvisGuidanceService from '@/services/JarvisGuidanceService';
import { IronManTheme } from '@/constants/colors';

interface APIKeyStatusProps {
  onSetupClick?: (service: string) => void;
}

export default function APIKeyStatus({ onSetupClick }: APIKeyStatusProps) {
  const [keyStatus, setKeyStatus] = useState<{
    configured: string[];
    missing: string[];
    hasAnyAI: boolean;
  }>({ configured: [], missing: [], hasAnyAI: false });

  useEffect(() => {
    checkAPIKeys();
  }, []);

  const checkAPIKeys = async () => {
    const guidance = JarvisGuidanceService.getInstance();
    const status = await guidance.detectAPIKeys();
    setKeyStatus(status);
  };

  const getServiceDisplayName = (service: string): string => {
    const names: Record<string, string> = {
      groq: 'Groq',
      openai: 'OpenAI',
      gemini: 'Google Gemini',
      anthropic: 'Anthropic Claude',
      huggingface: 'HuggingFace',
      together: 'Together.ai',
      deepseek: 'DeepSeek',
    };
    return names[service] || service;
  };

  const getServiceTier = (service: string): string => {
    const tiers: Record<string, string> = {
      groq: 'Free',
      huggingface: 'Free',
      gemini: 'Free Tier',
      together: 'Free Tier',
      deepseek: 'Free Tier',
      openai: 'Paid',
      anthropic: 'Paid',
    };
    return tiers[service] || 'Unknown';
  };

  const handleSetup = async (service: string) => {
    if (onSetupClick) {
      onSetupClick(service);
    } else {
      const guidance = JarvisGuidanceService.getInstance();
      const setupInfo = await guidance.generateAPIKeyGuidance(service);
      console.log('[APIKeyStatus] Setup guidance:', setupInfo);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>API Key Configuration</Text>
        {keyStatus.hasAnyAI ? (
          <View style={styles.statusBadge}>
            <Check size={14} color="#00ff00" />
            <Text style={styles.statusTextGood}>Connected</Text>
          </View>
        ) : (
          <View style={[styles.statusBadge, styles.statusBadgeWarning]}>
            <AlertCircle size={14} color="#ffa500" />
            <Text style={styles.statusTextWarning}>Setup Needed</Text>
          </View>
        )}
      </View>

      {keyStatus.hasAnyAI ? (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ✅ AI services are configured and ready. JARVIS can use {keyStatus.configured.length} provider(s).
          </Text>
        </View>
      ) : (
        <View style={[styles.infoBox, styles.infoBoxWarning]}>
          <AlertCircle size={16} color="#ffa500" style={{ marginRight: 8 }} />
          <Text style={styles.infoTextWarning}>
            No AI API keys configured. Add at least one free API key to enable AI features.
          </Text>
        </View>
      )}

      <ScrollView style={styles.servicesList}>
        {keyStatus.configured.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✓ Configured Services</Text>
            {keyStatus.configured.map((service) => (
              <View key={service} style={styles.serviceItem}>
                <View style={styles.serviceInfo}>
                  <Check size={18} color="#00ff00" />
                  <Text style={styles.serviceName}>{getServiceDisplayName(service)}</Text>
                  <View style={styles.tierBadge}>
                    <Text style={styles.tierText}>{getServiceTier(service)}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {keyStatus.missing.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {keyStatus.configured.length > 0 ? '○ Additional Services (Optional)' : '⚠ Available Services'}
            </Text>
            {keyStatus.missing.map((service) => (
              <View key={service} style={styles.serviceItem}>
                <View style={styles.serviceInfo}>
                  <X size={18} color="#666" />
                  <Text style={[styles.serviceName, styles.serviceNameDisabled]}>
                    {getServiceDisplayName(service)}
                  </Text>
                  <View style={[styles.tierBadge, styles.tierBadgeDisabled]}>
                    <Text style={styles.tierTextDisabled}>{getServiceTier(service)}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.setupButton}
                  onPress={() => handleSetup(service)}
                >
                  <Text style={styles.setupButtonText}>Setup</Text>
                  <ExternalLink size={12} color="#00f2ff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 Tip: Free services like Groq and HuggingFace are great for getting started!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00ff0020',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusBadgeWarning: {
    backgroundColor: '#ffa50020',
  },
  statusTextGood: {
    color: '#00ff00',
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextWarning: {
    color: '#ffa500',
    fontSize: 12,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#00ff0010',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#00ff0030',
  },
  infoBoxWarning: {
    backgroundColor: '#ffa50010',
    borderColor: '#ffa50030',
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    color: '#00ff00',
    fontSize: 13,
    lineHeight: 18,
  },
  infoTextWarning: {
    color: '#ffa500',
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  servicesList: {
    maxHeight: 300,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#222',
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  serviceName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  serviceNameDisabled: {
    color: '#666',
  },
  tierBadge: {
    backgroundColor: '#00f2ff20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tierBadgeDisabled: {
    backgroundColor: '#33333320',
  },
  tierText: {
    color: '#00f2ff',
    fontSize: 11,
    fontWeight: '600',
  },
  tierTextDisabled: {
    color: '#666',
    fontSize: 11,
    fontWeight: '600',
  },
  setupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00f2ff20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  setupButtonText: {
    color: '#00f2ff',
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  footerText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
