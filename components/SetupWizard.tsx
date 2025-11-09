import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { X, Check, ChevronRight, ExternalLink, Copy, AlertCircle } from 'lucide-react-native';
import JarvisGuidanceService from '@/services/JarvisGuidanceService';
import { IronManTheme } from '@/constants/colors';
import * as Clipboard from 'expo-clipboard';

interface SetupWizardProps {
  visible: boolean;
  onClose: () => void;
  initialService?: string;
}

export default function SetupWizard({ visible, onClose, initialService }: SetupWizardProps) {
  const [selectedService, setSelectedService] = useState<string | null>(initialService || null);
  const [apiKey, setApiKey] = useState('');
  const [showGuidance, setShowGuidance] = useState(false);
  const [guidance, setGuidance] = useState('');

  const services = [
    { id: 'groq', name: 'Groq', tier: 'Free', recommended: true },
    { id: 'huggingface', name: 'HuggingFace', tier: 'Free', recommended: true },
    { id: 'gemini', name: 'Google Gemini', tier: 'Free Tier', recommended: true },
    { id: 'together', name: 'Together.ai', tier: 'Free Tier', recommended: false },
    { id: 'deepseek', name: 'DeepSeek', tier: 'Free Tier', recommended: false },
    { id: 'openai', name: 'OpenAI', tier: 'Paid', recommended: false },
    { id: 'anthropic', name: 'Anthropic Claude', tier: 'Paid', recommended: false },
  ];

  const handleShowGuidance = async (serviceId: string) => {
    const guidanceService = JarvisGuidanceService;
    const setupInfo = await guidanceService.generateAPIKeyGuidance(serviceId);
    setGuidance(setupInfo);
    setShowGuidance(true);
  };

  const handleSaveKey = async () => {
    if (!selectedService || !apiKey.trim()) {
      Alert.alert('Error', 'Please enter an API key');
      return;
    }

    try {
      // In a real implementation, this would save to secure storage
      // For now, we'll guide the user to add it to .env
      const envVarName = `EXPO_PUBLIC_${selectedService.toUpperCase()}_API_KEY`;
      const instructions = `To add your ${selectedService} API key:\n\n1. Open your .env file\n2. Add this line:\n${envVarName}=${apiKey}\n3. Restart the application\n\nYour key has been copied to clipboard!`;
      
      await Clipboard.setStringAsync(`${envVarName}=${apiKey}`);
      
      Alert.alert(
        'API Key Ready',
        instructions,
        [
          {
            text: 'OK',
            onPress: () => {
              setApiKey('');
              setSelectedService(null);
              onClose();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to process API key');
    }
  };

  const renderServiceList = () => (
    <ScrollView style={styles.serviceList}>
      <Text style={styles.subtitle}>Select a service to set up:</Text>
      
      <View style={styles.recommendedSection}>
        <Text style={styles.sectionTitle}>⭐ Recommended (Free)</Text>
        {services.filter(s => s.recommended).map((service) => (
          <TouchableOpacity
            key={service.id}
            style={[
              styles.serviceCard,
              selectedService === service.id && styles.serviceCardSelected,
            ]}
            onPress={() => setSelectedService(service.id)}
          >
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <View style={styles.tierBadge}>
                <Text style={styles.tierText}>{service.tier}</Text>
              </View>
            </View>
            <ChevronRight size={20} color="#00f2ff" />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.otherSection}>
        <Text style={styles.sectionTitle}>Other Services</Text>
        {services.filter(s => !s.recommended).map((service) => (
          <TouchableOpacity
            key={service.id}
            style={[
              styles.serviceCard,
              selectedService === service.id && styles.serviceCardSelected,
            ]}
            onPress={() => setSelectedService(service.id)}
          >
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <View style={[styles.tierBadge, service.tier === 'Paid' && styles.tierBadgePaid]}>
                <Text style={[styles.tierText, service.tier === 'Paid' && styles.tierTextPaid]}>
                  {service.tier}
                </Text>
              </View>
            </View>
            <ChevronRight size={20} color="#00f2ff" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderSetupForm = () => {
    const service = services.find(s => s.id === selectedService);
    if (!service) return null;

    return (
      <ScrollView style={styles.setupForm}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setSelectedService(null)}
        >
          <Text style={styles.backButtonText}>← Back to Services</Text>
        </TouchableOpacity>

        <Text style={styles.setupTitle}>Setting up {service.name}</Text>

        <View style={styles.infoBox}>
          <AlertCircle size={16} color="#00f2ff" />
          <Text style={styles.infoText}>
            {service.tier === 'Free' || service.tier.includes('Free')
              ? `${service.name} offers free API access. Great choice for getting started!`
              : `${service.name} is a premium service. Make sure you have an API key.`}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.guidanceButton}
          onPress={() => handleShowGuidance(service.id)}
        >
          <ExternalLink size={18} color="#00f2ff" />
          <Text style={styles.guidanceButtonText}>View Setup Instructions</Text>
        </TouchableOpacity>

        <Text style={styles.inputLabel}>Enter your {service.name} API Key:</Text>
        <TextInput
          style={styles.input}
          value={apiKey}
          onChangeText={setApiKey}
          placeholder={`sk-...`}
          placeholderTextColor="#666"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TouchableOpacity
          style={[styles.saveButton, !apiKey.trim() && styles.saveButtonDisabled]}
          onPress={handleSaveKey}
          disabled={!apiKey.trim()}
        >
          <Check size={20} color="#000" />
          <Text style={styles.saveButtonText}>Save API Key</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>JARVIS Setup Wizard</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {selectedService ? renderSetupForm() : renderServiceList()}
          </View>
        </View>
      </Modal>

      <Modal visible={showGuidance} animationType="fade" transparent>
        <View style={styles.guidanceOverlay}>
          <View style={styles.guidanceModal}>
            <View style={styles.guidanceHeader}>
              <Text style={styles.guidanceTitle}>Setup Instructions</Text>
              <TouchableOpacity onPress={() => setShowGuidance(false)}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.guidanceContent}>
              <Text style={styles.guidanceText}>{guidance}</Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.guidanceCloseButton}
              onPress={() => setShowGuidance(false)}
            >
              <Text style={styles.guidanceCloseButtonText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0a0a0a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    borderTopWidth: 2,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#00f2ff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00f2ff',
  },
  closeButton: {
    padding: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 16,
  },
  serviceList: {
    padding: 20,
  },
  recommendedSection: {
    marginBottom: 24,
  },
  otherSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  serviceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#222',
  },
  serviceCardSelected: {
    borderColor: '#00f2ff',
    backgroundColor: '#00f2ff10',
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  tierBadge: {
    backgroundColor: '#00ff0020',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tierBadgePaid: {
    backgroundColor: '#ffa50020',
  },
  tierText: {
    color: '#00ff00',
    fontSize: 12,
    fontWeight: '600',
  },
  tierTextPaid: {
    color: '#ffa500',
  },
  setupForm: {
    padding: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: '#00f2ff',
    fontSize: 14,
  },
  setupTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#00f2ff10',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00f2ff30',
    marginBottom: 16,
    gap: 10,
  },
  infoText: {
    flex: 1,
    color: '#00f2ff',
    fontSize: 13,
    lineHeight: 18,
  },
  guidanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00f2ff',
    marginBottom: 24,
    gap: 10,
  },
  guidanceButtonText: {
    color: '#00f2ff',
    fontSize: 14,
    fontWeight: '600',
  },
  inputLabel: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 20,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00f2ff',
    padding: 16,
    borderRadius: 8,
    gap: 10,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  guidanceOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    padding: 20,
  },
  guidanceModal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#00f2ff',
  },
  guidanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  guidanceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00f2ff',
  },
  guidanceContent: {
    padding: 20,
  },
  guidanceText: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 24,
  },
  guidanceCloseButton: {
    backgroundColor: '#00f2ff',
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  guidanceCloseButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
