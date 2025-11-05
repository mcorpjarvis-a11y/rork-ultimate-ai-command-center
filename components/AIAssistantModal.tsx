import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, Keyboard, Alert, ActivityIndicator, Animated } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Send, Bot, User, Zap, Target, Mic, MicOff, Volume2, VolumeX, Settings } from 'lucide-react-native';
import { useRorkAgent, createRorkTool } from '@rork/toolkit-sdk';
import { useApp } from '@/contexts/AppContext';
import { z } from 'zod';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { IronManTheme } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

interface AIAssistantModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AIAssistantModal({ visible, onClose }: AIAssistantModalProps) {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const { addContentItem, addScheduledTask, addAITask, addInsight, addTrend, addSystemLog, connectSocialAccount, addRevenueStream, addPersona, updateMetrics } = useApp();
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const { messages, sendMessage } = useRorkAgent({
    tools: {
      generateContent: createRorkTool({
        description: 'Generate social media content based on trends and persona',
        zodSchema: z.object({
          platform: z.string().describe('Target platform (Instagram, TikTok, YouTube, etc)'),
          contentType: z.string().describe('Type of content (post, story, video, reel)'),
          topic: z.string().describe('Main topic or theme'),
          tone: z.string().describe('Tone of voice'),
          hashtags: z.array(z.string()).optional().describe('Relevant hashtags'),
        }),
        execute(input: any) {
          addContentItem(
            `${input.platform} ${input.contentType}`,
            `Generated content about ${input.topic} in ${input.tone} tone`,
            input.contentType
          );
          addSystemLog('success', `Generated ${input.contentType} for ${input.platform}`, 'AI');
          addInsight(`AI created ${input.contentType} content for ${input.platform} about ${input.topic}`);
          return `Successfully generated ${input.contentType} for ${input.platform}`;
        },
      }),
      
      analyzeTrends: createRorkTool({
        description: 'Analyze current trends and provide insights',
        zodSchema: z.object({
          platform: z.string().describe('Platform to analyze'),
          topics: z.array(z.string()).describe('Topics to focus on'),
          timeframe: z.string().describe('Time period (24h, 7d, 30d)'),
        }),
        execute(input: any) {
          input.topics.forEach((topic: any) => {
            addTrend(topic, input.platform, Math.floor(Math.random() * 100000), Math.random(), Math.floor(Math.random() * 100));
          });
          addSystemLog('success', `Analyzed trends for ${input.platform}`, 'AI');
          addInsight(`AI analyzed ${input.topics.length} trending topics on ${input.platform}`);
          return `Analyzed ${input.topics.length} trends on ${input.platform}`;
        },
      }),

      schedulePost: createRorkTool({
        description: 'Schedule content to be posted at optimal time',
        zodSchema: z.object({
          title: z.string().describe('Post title'),
          platform: z.string().describe('Target platform'),
          content: z.string().describe('Post content'),
          scheduledTime: z.string().describe('When to post (ISO 8601 format)'),
        }),
        execute(input: any) {
          const time = new Date(input.scheduledTime).getTime();
          addScheduledTask(input.title, input.content, time, 'post');
          addSystemLog('success', `Scheduled post for ${input.platform}`, 'Automation');
          addInsight(`AI scheduled ${input.title} for ${new Date(time).toLocaleString()}`);
          return `Scheduled post for ${new Date(time).toLocaleString()}`;
        },
      }),

      optimizeMonetization: createRorkTool({
        description: 'Analyze and optimize revenue streams',
        zodSchema: z.object({
          currentRevenue: z.number().describe('Current monthly revenue'),
          platforms: z.array(z.string()).describe('Connected platforms'),
          goals: z.number().describe('Revenue goal'),
        }),
        execute(input: any) {
          const suggestions = [
            'Enable affiliate marketing on high-traffic posts',
            'Create exclusive content for subscription tier',
            'Launch merchandise store for top-performing content',
            'Negotiate sponsorship deals based on engagement data',
          ];
          const increase = input.goals - input.currentRevenue;
          addInsight(`AI suggests ${suggestions.length} strategies to increase revenue by ${increase.toFixed(2)}`);
          addSystemLog('success', 'Generated monetization optimization plan', 'AI');
          return `Generated optimization plan to increase revenue by ${increase.toFixed(2)}`;
        },
      }),

      connectPlatform: createRorkTool({
        description: 'Connect a new social media or e-commerce platform',
        zodSchema: z.object({
          platform: z.string().describe('Platform name'),
          username: z.string().describe('Username/handle'),
          category: z.enum(['social', 'gaming', 'ecommerce', 'video', 'messaging', 'professional', 'other']).describe('Platform category'),
        }),
        execute(input: any) {
          connectSocialAccount(input.platform, input.username, input.category);
          addSystemLog('success', `Connected ${input.platform}`, 'Integration');
          addInsight(`AI connected ${input.platform} account: ${input.username}`);
          return `Connected ${input.platform} account: ${input.username}`;
        },
      }),

      generateMedia: createRorkTool({
        description: 'Generate images, videos, or other media using AI',
        zodSchema: z.object({
          type: z.enum(['image', 'video', 'audio']).describe('Media type'),
          prompt: z.string().describe('Description of what to generate'),
          style: z.string().optional().describe('Visual style or theme'),
          dimensions: z.string().optional().describe('Dimensions (e.g., 1080x1080, 1920x1080)'),
        }),
        execute(input: any) {
          addAITask('image_generation' as any, `Generate ${input.type}: ${input.prompt}`, 'high');
          addSystemLog('info', `Queued ${input.type} generation`, 'AI');
          addInsight(`AI is generating ${input.type} based on: "${input.prompt}"`);
          return `Queued ${input.type} generation`;
        },
      }),

      createRevenueStream: createRorkTool({
        description: 'Set up a new revenue stream',
        zodSchema: z.object({
          name: z.string().describe('Revenue stream name'),
          type: z.enum(['sponsorship', 'affiliate', 'subscription', 'ads', 'merchandise', 'tips', 'courses', 'nft']).describe('Revenue type'),
          platform: z.string().describe('Platform name'),
          estimatedAmount: z.number().describe('Estimated monthly revenue'),
        }),
        execute(input: any) {
          addRevenueStream(input.name, input.type, input.platform, input.estimatedAmount);
          addSystemLog('success', `Created revenue stream: ${input.name}`, 'Monetization');
          addInsight(`AI set up ${input.type} revenue stream on ${input.platform}`);
          return `Created revenue stream: ${input.name}`;
        },
      }),

      createPersona: createRorkTool({
        description: 'Create a new content persona for different audience segments',
        zodSchema: z.object({
          name: z.string().describe('Persona name'),
          description: z.string().describe('Persona description'),
          tone: z.string().describe('Tone of voice'),
          topics: z.array(z.string()).describe('Main topics'),
          targetAudience: z.string().describe('Target audience'),
        }),
        execute(input: any) {
          addPersona(input.name, input.description, input.tone, input.topics, input.targetAudience);
          addSystemLog('success', `Created persona: ${input.name}`, 'AI');
          addInsight(`AI created new persona "${input.name}" targeting ${input.targetAudience}`);
          return `Created persona: ${input.name}`;
        },
      }),

      updateMetrics: createRorkTool({
        description: 'Update performance metrics based on analysis',
        zodSchema: z.object({
          followers: z.number().optional(),
          engagementRate: z.number().optional(),
          monthlyRevenue: z.number().optional(),
          conversionRate: z.number().optional(),
        }),
        execute(input: any) {
          updateMetrics(input);
          addSystemLog('success', 'Updated metrics', 'Analytics');
          return 'Updated metrics successfully';
        },
      }),

      automateWorkflow: createRorkTool({
        description: 'Create automated workflows for routine tasks',
        zodSchema: z.object({
          taskType: z.string().describe('Type of task to automate'),
          frequency: z.string().describe('How often to run (daily, weekly, etc)'),
          conditions: z.array(z.string()).describe('Conditions to trigger automation'),
        }),
        execute(input: any) {
          addAITask('optimization' as any, `Automate ${input.taskType} ${input.frequency}`, 'medium');
          addSystemLog('success', `Created automation for ${input.taskType}`, 'Automation');
          addInsight(`AI automated ${input.taskType} to run ${input.frequency}`);
          return `Automated ${input.taskType} to run ${input.frequency}`;
        },
      }),
    },
  });

  useEffect(() => {
    if (visible) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages, visible]);

  useEffect(() => {
    const lastMessage: any = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && autoSpeak && visible) {
      if (lastMessage.parts && Array.isArray(lastMessage.parts)) {
        const textParts = lastMessage.parts.filter((p: any) => p.type === 'text');
        if (textParts.length > 0) {
          const text = textParts.map((p: any) => p.text).join(' ');
          speakText(text);
        }
      } else if ((lastMessage as any).text) {
        speakText((lastMessage as any).text);
      }
    }
  }, [messages, autoSpeak, visible]);

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
      Keyboard.dismiss();
    }
  };

  const speakText = async (text: string) => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    try {
      setIsSpeaking(true);
      await Speech.speak(text, {
        language: 'en-US',
        pitch: 0.95,
        rate: 0.9,
        voice: Platform.select({
          ios: 'com.apple.ttsbundle.Daniel-compact',
          android: 'en-gb-x-rjs#male_1-local',
          default: undefined,
        }),
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch (error) {
      console.error('Speech error:', error);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  const startRecording = async () => {
    try {
      if (Platform.OS === 'web') {
        await startWebRecording();
      } else {
        await startNativeRecording();
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please check microphone permissions.');
    }
  };

  const startWebRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        await processAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      throw error;
    }
  };

  const startNativeRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Microphone access is required for voice input.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });

      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (error) {
      throw error;
    }
  };

  const stopRecording = async () => {
    try {
      setIsProcessingAudio(true);

      if (Platform.OS === 'web') {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
          mediaRecorderRef.current = null;
        }
      } else {
        if (recordingRef.current) {
          await recordingRef.current.stopAndUnloadAsync();
          await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
          
          const uri = recordingRef.current.getURI();
          if (uri) {
            await processNativeAudio(uri);
          }
          recordingRef.current = null;
        }
      }

      setIsRecording(false);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsRecording(false);
      setIsProcessingAudio(false);
    }
  };

  const processAudioBlob = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('https://toolkit.rork.com/stt/transcribe/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      if (data.text) {
        setMessage(data.text);
      }
    } catch (error) {
      console.error('Transcription error:', error);
      Alert.alert('Error', 'Failed to transcribe audio. Please try again.');
    } finally {
      setIsProcessingAudio(false);
    }
  };

  const processNativeAudio = async (uri: string) => {
    try {
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      const formData = new FormData();
      formData.append('audio', {
        uri,
        name: `recording.${fileType}`,
        type: `audio/${fileType}`,
      } as any);

      const response = await fetch('https://toolkit.rork.com/stt/transcribe/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      if (data.text) {
        setMessage(data.text);
      }
    } catch (error) {
      console.error('Transcription error:', error);
      Alert.alert('Error', 'Failed to transcribe audio. Please try again.');
    } finally {
      setIsProcessingAudio(false);
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
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={[styles.modalContent, { paddingTop: insets.top + 16, paddingBottom: insets.bottom }]}>
            <View style={styles.modalHeader}>
              <View style={styles.headerContent}>
                <Bot color="#7CFC00" size={24} />
                <View>
                  <Text style={styles.modalTitle}>J.A.R.V.I.S.</Text>
                  <Text style={styles.modalSubtitle}>Just A Rather Very Intelligent System</Text>
                </View>
              </View>
              <View style={styles.headerButtons}>
                <TouchableOpacity 
                  style={[styles.iconButton, autoSpeak && styles.iconButtonActive]} 
                  onPress={() => setAutoSpeak(!autoSpeak)}
                >
                  {autoSpeak ? <Volume2 color="#7CFC00" size={20} /> : <VolumeX color="#666" size={20} />}
                </TouchableOpacity>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <X color="#999" size={24} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView 
              ref={scrollViewRef}
              style={styles.messagesScroll}
              contentContainerStyle={styles.messagesContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {messages.length === 0 ? (
                <View style={styles.emptyState}>
                  <Bot color="#7CFC00" size={56} />
                  <Text style={styles.emptyTitle}>J.A.R.V.I.S. Online</Text>
                  <Text style={styles.emptyText}>
                    At your service, sir. I can manage your entire operation - content generation, trend analysis, revenue optimization, workflow automation, and strategic insights. Just speak or type your command.
                  </Text>
                  <View style={styles.capabilitiesGrid}>
                    <Text style={styles.capabilityText}>🎯 Content Generation</Text>
                    <Text style={styles.capabilityText}>📊 Analytics & Insights</Text>
                    <Text style={styles.capabilityText}>💰 Revenue Optimization</Text>
                    <Text style={styles.capabilityText}>⚡ Automation</Text>
                    <Text style={styles.capabilityText}>🎨 Media Creation</Text>
                    <Text style={styles.capabilityText}>🔮 Trend Prediction</Text>
                  </View>
                </View>
              ) : (
                messages.map((msg: any) => (
                  <View
                    key={msg.id}
                    style={[styles.messageCard, msg.role === 'user' ? styles.userMessage : styles.assistantMessage]}
                  >
                    <View style={styles.messageHeader}>
                      {msg.role === 'assistant' ? (
                        <Bot color="#7CFC00" size={18} />
                      ) : (
                        <User color="#00E5FF" size={18} />
                      )}
                      <Text style={styles.messageRole}>
                        {msg.role === 'assistant' ? 'JARVIS' : 'You'}
                      </Text>
                    </View>
                    {msg.parts && Array.isArray(msg.parts) && msg.parts.length > 0 ? (
                      msg.parts.map((part: any, i: number) => {
                        switch (part.type) {
                          case 'text':
                            return (
                              <Text key={`${msg.id}-${i}`} style={styles.messageText}>
                                {part.text}
                              </Text>
                            );
                          case 'tool':
                            const toolName = part.toolName;
                            switch (part.state) {
                              case 'input-streaming':
                              case 'input-available':
                                return (
                                  <View key={`${msg.id}-${i}`} style={styles.toolExecuting}>
                                    <Zap color="#FFD700" size={14} />
                                    <Text style={styles.toolText}>{toolName}</Text>
                                  </View>
                                );
                              case 'output-available':
                                return (
                                  <View key={`${msg.id}-${i}`} style={styles.toolSuccess}>
                                    <Target color="#7CFC00" size={14} />
                                    <Text style={styles.toolText}>Completed</Text>
                                  </View>
                                );
                              case 'output-error':
                                return (
                                  <View key={`${msg.id}-${i}`} style={styles.toolError}>
                                    <Text style={styles.toolErrorText}>{part.errorText}</Text>
                                  </View>
                                );
                            }
                        }
                      })
                    ) : (
                      <Text style={styles.messageText}>
                        {(msg as any).text || (msg as any).content || 'Message received'}
                      </Text>
                    )}
                  </View>
                ))
              )}
            </ScrollView>

            <View style={styles.inputContainer}>
              <TouchableOpacity 
                style={[styles.micButton, isRecording && styles.micButtonActive]}
                onPress={isRecording ? stopRecording : startRecording}
                disabled={isProcessingAudio}
              >
                {isProcessingAudio ? (
                  <ActivityIndicator size="small" color="#7CFC00" />
                ) : isRecording ? (
                  <MicOff size={20} color="#FF3B30" />
                ) : (
                  <Mic size={20} color="#7CFC00" />
                )}
              </TouchableOpacity>
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="Speak or type your command..."
                placeholderTextColor="#666"
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={1000}
                returnKeyType="send"
                blurOnSubmit={false}
                onSubmitEditing={handleSend}
              />
              <TouchableOpacity 
                style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]} 
                onPress={handleSend}
                disabled={!message.trim()}
              >
                <Send size={20} color={message.trim() ? "#000" : "#666"} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#000',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#7CFC00',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#7CFC00',
    letterSpacing: 2,
  },
  modalSubtitle: {
    fontSize: 9,
    color: '#666',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  iconButtonActive: {
    borderColor: '#7CFC00',
    backgroundColor: 'rgba(124, 252, 0, 0.1)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center' as const,
    marginTop: 8,
    lineHeight: 20,
  },
  capabilitiesGrid: {
    marginTop: 20,
    gap: 8,
    alignSelf: 'stretch',
  },
  capabilityText: {
    fontSize: 12,
    color: '#7CFC00',
    textAlign: 'center' as const,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(124, 252, 0, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(124, 252, 0, 0.2)',
  },
  messageCard: {
    marginBottom: 12,
    borderRadius: 16,
    padding: 12,
    maxWidth: '80%',
    borderWidth: 1,
  },
  userMessage: {
    alignSelf: 'flex-end' as const,
    backgroundColor: '#0a1a1f',
    borderColor: '#00E5FF',
  },
  assistantMessage: {
    alignSelf: 'flex-start' as const,
    backgroundColor: '#0f1f0a',
    borderColor: '#7CFC00',
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
    color: '#fff',
    textTransform: 'uppercase' as const,
  },
  messageText: {
    fontSize: 14,
    color: '#e0e0e0',
    lineHeight: 20,
  },
  toolExecuting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  toolSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(124, 252, 0, 0.1)',
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#7CFC00',
  },
  toolError: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  toolText: {
    fontSize: 11,
    color: '#e0e0e0',
    fontWeight: '600' as const,
  },
  toolErrorText: {
    fontSize: 11,
    color: '#FF3B30',
    fontWeight: '600' as const,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    backgroundColor: '#000',
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    borderWidth: 2,
    borderColor: '#7CFC00',
  },
  micButtonActive: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderColor: '#FF3B30',
  },
  input: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7CFC00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#1a1a1a',
  },
});
