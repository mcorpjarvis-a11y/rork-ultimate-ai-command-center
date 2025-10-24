import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Switch } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Send, Bot, User, Zap, Volume2, VolumeX, Settings } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { IronManTheme } from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AIAssistantModalProps {
  visible: boolean;
  onClose: () => void;
}

type TabType = 'chat' | 'settings';

const JARVIS_GREETING = "Good day, sir. JARVIS at your service. All systems operational and standing by for your commands.";

export default function EnhancedAIAssistantModal({ visible, onClose }: AIAssistantModalProps) {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const { state } = useApp();
  
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [hasGreeted, setHasGreeted] = useState(false);
  
  const [settings, setSettings] = useState({
    voice: {
      enabled: true,
      autoSpeak: true,
      rate: 0.9,
      pitch: 0.95,
    },
  });

  useEffect(() => {
    if (visible && !hasGreeted && settings.voice.enabled && settings.voice.autoSpeak && messages.length === 0) {
      setTimeout(() => {
        console.log('[JARVIS] Playing greeting...');
        speakText(JARVIS_GREETING);
        setHasGreeted(true);
      }, 800);
    }
  }, [visible, hasGreeted, settings.voice.enabled, settings.voice.autoSpeak, messages.length]);

  const speakText = async (text: string) => {
    if (!settings.voice.enabled) {
      console.log('[JARVIS] Voice is disabled in settings');
      return;
    }

    try {
      console.log('[JARVIS] Speaking:', text.substring(0, 50));
      
      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
        });
      }

      await Speech.speak(text, {
        language: 'en-US',
        pitch: settings.voice.pitch,
        rate: settings.voice.rate,
      });
    } catch (error) {
      console.error('[JARVIS] Speech error:', error);
    }
  };

  const sendMessage = (msg: string) => {
    console.log('[JARVIS] Message sent:', msg);
    const userMsg = { 
      id: Date.now().toString(), 
      role: 'user', 
      parts: [{ type: 'text', text: msg }] 
    };
    setMessages(prev => [...prev, userMsg]);
    setTimeout(() => {
      const responseText = 'JARVIS is currently in offline mode, sir. Backend connection will be restored shortly.';
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        parts: [{ type: 'text', text: responseText }] 
      }]);
      if (settings.voice.enabled && settings.voice.autoSpeak) {
        speakText(responseText);
      }
    }, 500);
  };

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  const saveSettings = async (newSettings: typeof settings) => {
    try {
      await AsyncStorage.setItem('jarvis_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.modalContent, { paddingTop: insets.top + 16 }]}>
            <View style={styles.modalHeader}>
              <View style={styles.headerContent}>
                <Bot color={IronManTheme.jarvisGreen} size={24} />
                <View>
                  <Text style={styles.modalTitle}>J.A.R.V.I.S.</Text>
                  <Text style={styles.modalSubtitle}>Just A Rather Very Intelligent System</Text>
                </View>
              </View>
              <View style={styles.headerButtons}>
                {settings.voice.enabled && (
                  <TouchableOpacity 
                    style={[styles.iconButton, settings.voice.autoSpeak && styles.iconButtonActive]} 
                    onPress={() => saveSettings({ ...settings, voice: { ...settings.voice, autoSpeak: !settings.voice.autoSpeak } })}
                  >
                    {settings.voice.autoSpeak ? (
                      <Volume2 color={IronManTheme.jarvisGreen} size={20} />
                    ) : (
                      <VolumeX color={IronManTheme.textMuted} size={20} />
                    )}
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <X color={IronManTheme.textSecondary} size={24} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.tabBar}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'chat' && styles.tabActive]}
                onPress={() => setActiveTab('chat')}
              >
                <Bot size={16} color={activeTab === 'chat' ? IronManTheme.jarvisGreen : IronManTheme.textMuted} />
                <Text style={[styles.tabText, activeTab === 'chat' && styles.tabTextActive]}>Chat</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.tab, activeTab === 'settings' && styles.tabActive]}
                onPress={() => setActiveTab('settings')}
              >
                <Settings size={16} color={activeTab === 'settings' ? IronManTheme.accent : IronManTheme.textMuted} />
                <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive]}>Config</Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'chat' && (
              <>
                <ScrollView 
                  ref={scrollViewRef}
                  style={styles.messagesScroll}
                  contentContainerStyle={styles.messagesContent}
                  showsVerticalScrollIndicator={false}
                >
                  {messages.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Bot color={IronManTheme.jarvisGreen} size={64} />
                      <Text style={styles.emptyTitle}>J.A.R.V.I.S. Online</Text>
                      <Text style={styles.emptyText}>
                        At your service, sir. All systems operational and standing by for your commands.
                      </Text>
                    </View>
                  ) : (
                    messages.map((msg) => (
                      <View
                        key={msg.id}
                        style={[styles.messageCard, msg.role === 'user' ? styles.userMessage : styles.assistantMessage]}
                      >
                        <View style={styles.messageHeader}>
                          {msg.role === 'assistant' ? (
                            <Bot color={IronManTheme.jarvisGreen} size={18} />
                          ) : (
                            <User color={IronManTheme.accent} size={18} />
                          )}
                          <Text style={styles.messageRole}>
                            {msg.role === 'assistant' ? 'JARVIS' : 'You'}
                          </Text>
                        </View>
                        <Text style={styles.messageText}>{msg.parts[0].text}</Text>
                      </View>
                    ))
                  )}
                </ScrollView>

                <View style={[styles.inputContainer, { paddingBottom: insets.bottom || 16 }]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Type your command, sir..."
                    placeholderTextColor={IronManTheme.textMuted}
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    returnKeyType="send"
                    onSubmitEditing={handleSend}
                  />
                  <TouchableOpacity 
                    style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]} 
                    onPress={handleSend}
                    disabled={!message.trim()}
                  >
                    <Send size={20} color={message.trim() ? "#000" : IronManTheme.textMuted} />
                  </TouchableOpacity>
                </View>
              </>
            )}

            {activeTab === 'settings' && (
              <ScrollView style={styles.settingsScroll}>
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>Voice Enabled</Text>
                    <Text style={styles.settingDescription}>Enable JARVIS voice responses</Text>
                  </View>
                  <Switch
                    value={settings.voice.enabled}
                    onValueChange={(value) => saveSettings({ ...settings, voice: { ...settings.voice, enabled: value } })}
                  />
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>Auto-Speak Responses</Text>
                    <Text style={styles.settingDescription}>Automatically speak AI responses</Text>
                  </View>
                  <Switch
                    value={settings.voice.autoSpeak}
                    onValueChange={(value) => saveSettings({ ...settings, voice: { ...settings.voice, autoSpeak: value } })}
                  />
                </View>
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  modalContainer: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: IronManTheme.background,
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 2,
    borderColor: IronManTheme.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: IronManTheme.surfaceLight,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: IronManTheme.jarvisGreen,
    letterSpacing: 2,
  },
  modalSubtitle: {
    fontSize: 9,
    color: IronManTheme.textMuted,
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: IronManTheme.surface,
  },
  iconButtonActive: {
    borderColor: IronManTheme.jarvisGreen,
    borderWidth: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: IronManTheme.surface,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: IronManTheme.surfaceLight,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: IronManTheme.surface,
  },
  tabActive: {
    backgroundColor: IronManTheme.surfaceLight,
    borderWidth: 1,
    borderColor: IronManTheme.borderActive,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: IronManTheme.textMuted,
  },
  tabTextActive: {
    color: IronManTheme.text,
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: IronManTheme.jarvisGreen,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: IronManTheme.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 20,
  },
  messageCard: {
    marginBottom: 12,
    borderRadius: 16,
    padding: 12,
    maxWidth: '85%',
    borderWidth: 1,
  },
  userMessage: {
    alignSelf: 'flex-end' as const,
    backgroundColor: IronManTheme.surface,
    borderColor: IronManTheme.accent,
  },
  assistantMessage: {
    alignSelf: 'flex-start' as const,
    backgroundColor: IronManTheme.surface,
    borderColor: IronManTheme.jarvisGreen,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  messageRole: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: IronManTheme.text,
    textTransform: 'uppercase' as const,
  },
  messageText: {
    fontSize: 14,
    color: IronManTheme.textSecondary,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: IronManTheme.surfaceLight,
  },
  input: {
    flex: 1,
    backgroundColor: IronManTheme.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: IronManTheme.text,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: IronManTheme.jarvisGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: IronManTheme.surfaceLight,
  },
  settingsScroll: {
    flex: 1,
    padding: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: IronManTheme.surface,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: IronManTheme.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: IronManTheme.textSecondary,
  },
});
