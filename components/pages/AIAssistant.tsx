import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageCircle, Send, Bot, User, Zap, Brain, Target, TrendingUp, DollarSign, Calendar, Image as ImageIcon, FileText, BarChart3, RefreshCw } from 'lucide-react-native';
import { useRorkAgent, createRorkTool } from '@rork/toolkit-sdk';
import { useApp } from '@/contexts/AppContext';
import { z } from 'zod';

export default function AIAssistant() {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const { state, addContentItem, addScheduledTask, addAITask, addInsight, addTrend, addSystemLog, connectSocialAccount, addRevenueStream, addPersona, updateMetrics } = useApp();
  const [message, setMessage] = useState('');
  const [autoMode, setAutoMode] = useState(false);
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([
    'content', 'trends', 'scheduling', 'monetization', 'analytics', 'social', 'media'
  ]);

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
        execute(input: { platform: string; contentType: string; topic: string; tone: string; hashtags?: string[] }) {
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
        execute(input: { platform: string; topics: string[]; timeframe: string }) {
          input.topics.forEach((topic: string) => {
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
        execute(input: { title: string; platform: string; content: string; scheduledTime: string }) {
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
        execute(input: { currentRevenue: number; platforms: string[]; goals: number }) {
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
        execute(input: { platform: string; username: string; category: 'social' | 'gaming' | 'ecommerce' | 'video' | 'messaging' | 'professional' | 'other' }) {
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
        execute(input: { type: 'image' | 'video' | 'audio'; prompt: string; style?: string; dimensions?: string }) {
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
        execute(input: { name: string; type: 'sponsorship' | 'affiliate' | 'subscription' | 'ads' | 'merchandise' | 'tips' | 'courses' | 'nft'; platform: string; estimatedAmount: number }) {
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
        execute(input: { name: string; description: string; tone: string; topics: string[]; targetAudience: string }) {
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
        execute(input: { followers?: number; engagementRate?: number; monthlyRevenue?: number; conversionRate?: number }) {
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
        execute(input: { taskType: string; frequency: string; conditions: string[] }) {
          addAITask('optimization' as any, `Automate ${input.taskType} ${input.frequency}`, 'medium');
          addSystemLog('success', `Created automation for ${input.taskType}`, 'Automation');
          addInsight(`AI automated ${input.taskType} to run ${input.frequency}`);
          return `Automated ${input.taskType} to run ${input.frequency}`;
        },
      }),
    },
  });

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  const quickActions = [
    { icon: FileText, label: 'Generate Content', action: () => sendMessage('Generate engaging content for Instagram about the latest tech trends') },
    { icon: TrendingUp, label: 'Analyze Trends', action: () => sendMessage('Analyze current trending topics on all platforms and suggest content ideas') },
    { icon: Calendar, label: 'Schedule Posts', action: () => sendMessage('Schedule posts for this week based on optimal engagement times') },
    { icon: DollarSign, label: 'Optimize Revenue', action: () => sendMessage('Analyze my current revenue streams and suggest ways to increase earnings by 30%') },
    { icon: ImageIcon, label: 'Generate Media', action: () => sendMessage('Create a stunning promotional image for my latest video') },
    { icon: BarChart3, label: 'Full Analysis', action: () => sendMessage('Perform a comprehensive analysis of all my accounts and provide actionable insights') },
  ];

  const capabilities = [
    { id: 'content', label: 'Content Generation', icon: FileText },
    { id: 'trends', label: 'Trend Analysis', icon: TrendingUp },
    { id: 'scheduling', label: 'Smart Scheduling', icon: Calendar },
    { id: 'monetization', label: 'Revenue Optimization', icon: DollarSign },
    { id: 'analytics', label: 'Performance Analytics', icon: BarChart3 },
    { id: 'social', label: 'Platform Management', icon: MessageCircle },
    { id: 'media', label: 'Media Generation', icon: ImageIcon },
    { id: 'automation', label: 'Workflow Automation', icon: Zap },
  ];

  const stats = [
    { label: 'Tasks Queued', value: state.aiTaskQueue.filter(t => t.status === 'queued').length, icon: RefreshCw },
    { label: 'Tasks Processing', value: state.aiTaskQueue.filter(t => t.status === 'processing').length, icon: Zap },
    { label: 'Completed Today', value: state.aiTaskQueue.filter(t => t.status === 'completed').length, icon: Target },
    { label: 'AI Models Active', value: state.aiModels.filter(m => m.enabled).length, icon: Brain },
  ];

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Brain color="#7CFC00" size={28} />
            <View>
              <Text style={styles.headerTitle}>Master AI Assistant</Text>
              <Text style={styles.headerSubtitle}>Full System Control & Automation</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.autoLabel}>Auto Mode</Text>
            <Switch
              value={autoMode}
              onValueChange={setAutoMode}
              trackColor={{ false: '#333', true: '#7CFC00' }}
              thumbColor={autoMode ? '#fff' : '#999'}
            />
          </View>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((stat, idx) => (
            <View key={idx} style={styles.statCard}>
              <stat.icon color="#7CFC00" size={16} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.capabilitiesSection}>
          <Text style={styles.capabilitiesTitle}>Active Capabilities</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.capabilitiesList}>
            {capabilities.map((cap) => (
              <TouchableOpacity
                key={cap.id}
                style={[styles.capabilityChip, selectedCapabilities.includes(cap.id) && styles.capabilityChipActive]}
                onPress={() => {
                  setSelectedCapabilities(prev =>
                    prev.includes(cap.id) ? prev.filter(c => c !== cap.id) : [...prev, cap.id]
                  );
                }}
              >
                <cap.icon color={selectedCapabilities.includes(cap.id) ? '#7CFC00' : '#666'} size={14} />
                <Text style={[styles.capabilityText, selectedCapabilities.includes(cap.id) && styles.capabilityTextActive]}>
                  {cap.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer} 
        contentContainerStyle={[styles.messagesContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.length === 0 && (
          <View style={styles.welcomeSection}>
            <Brain color="#7CFC00" size={64} />
            <Text style={styles.welcomeTitle}>Master AI Command Center</Text>
            <Text style={styles.welcomeText}>
              I have full control over all systems. I can manage your content, analyze trends, optimize revenue, schedule posts, generate media, and automate your entire workflow.
            </Text>
            <Text style={styles.welcomeSubtext}>Try these quick actions:</Text>
            <View style={styles.quickActionsGrid}>
              {quickActions.map((action, idx) => (
                <TouchableOpacity key={idx} style={styles.quickActionCard} onPress={action.action}>
                  <action.icon color="#7CFC00" size={24} />
                  <Text style={styles.quickActionLabel}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {messages.map((msg: any) => (
          <View
            key={msg.id}
            style={[styles.messageCard, msg.role === 'user' ? styles.userMessage : styles.assistantMessage]}
          >
            <View style={styles.messageHeader}>
              {msg.role === 'assistant' ? (
                <Bot color="#7CFC00" size={20} />
              ) : (
                <User color="#00E5FF" size={20} />
              )}
              <Text style={styles.messageRole}>
                {msg.role === 'assistant' ? 'Master AI' : 'You'}
              </Text>
            </View>
            {msg.parts && Array.isArray(msg.parts) && msg.parts.length > 0 ? (
              msg.parts.map((part: any, i: number) => {
                if (!part) return null;
                switch (part.type) {
                  case 'text':
                    return (
                      <Text key={`${msg.id}-${i}`} style={styles.messageContent}>
                        {part.text || ''}
                      </Text>
                    );
                  case 'tool':
                    const toolName = part.toolName || 'Unknown Tool';
                    switch (part.state) {
                      case 'input-streaming':
                      case 'input-available':
                        return (
                          <View key={`${msg.id}-${i}`} style={styles.toolCard}>
                            <Zap color="#FFD700" size={16} />
                            <Text style={styles.toolText}>Executing: {toolName}</Text>
                          </View>
                        );
                      case 'output-available':
                        return (
                          <View key={`${msg.id}-${i}`} style={styles.toolCardSuccess}>
                            <Target color="#7CFC00" size={16} />
                            <Text style={styles.toolText}>Completed: {toolName}</Text>
                          </View>
                        );
                      case 'output-error':
                        return (
                          <View key={`${msg.id}-${i}`} style={styles.toolCardError}>
                            <Text style={styles.toolText}>Error: {part.errorText || 'Unknown error'}</Text>
                          </View>
                        );
                      default:
                        return null;
                    }
                  default:
                    return null;
                }
              })
            ) : (
              <Text style={styles.messageContent}>
                {(msg as any).text || (msg as any).content || 'Message received'}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={[styles.inputSection, { paddingBottom: insets.bottom || 16 }]}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Delegate any task to the AI..."
            placeholderTextColor="#666"
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Send size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#7CFC00',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  autoLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600' as const,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#fff',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 9,
    color: '#666',
    marginTop: 2,
    textAlign: 'center' as const,
  },
  capabilitiesSection: {
    paddingHorizontal: 20,
  },
  capabilitiesTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#999',
    marginBottom: 8,
    textTransform: 'uppercase' as const,
  },
  capabilitiesList: {
    flexDirection: 'row',
  },
  capabilityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#1a1a1a',
    marginRight: 8,
  },
  capabilityChipActive: {
    backgroundColor: '#0f1f0a',
    borderColor: '#7CFC00',
  },
  capabilityText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600' as const,
  },
  capabilityTextActive: {
    color: '#7CFC00',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 20,
  },
  welcomeSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#fff',
    marginTop: 16,
  },
  welcomeText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center' as const,
    marginTop: 12,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  welcomeSubtext: {
    fontSize: 12,
    color: '#7CFC00',
    marginTop: 24,
    fontWeight: '600' as const,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
    justifyContent: 'center',
  },
  quickActionCard: {
    width: 100,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  quickActionLabel: {
    fontSize: 11,
    color: '#ccc',
    marginTop: 8,
    textAlign: 'center' as const,
    fontWeight: '600' as const,
  },
  messageCard: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    maxWidth: '85%',
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
    gap: 8,
    marginBottom: 8,
  },
  messageRole: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: '#fff',
    textTransform: 'uppercase' as const,
  },
  messageContent: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1a1a0a',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  toolCardSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0a1a0a',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#7CFC00',
  },
  toolCardError: {
    backgroundColor: '#1a0a0a',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  toolText: {
    fontSize: 12,
    color: '#ccc',
    fontWeight: '600' as const,
  },
  inputSection: {
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    backgroundColor: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 0,
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#1a1a1a',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7CFC00',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
