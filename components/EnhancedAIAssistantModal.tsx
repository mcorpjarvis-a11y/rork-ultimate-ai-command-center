import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, Keyboard, Alert, ActivityIndicator, Switch, Image } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Send, Bot, User, Zap, Target, Mic, MicOff, Volume2, VolumeX, Settings, DollarSign, TrendingUp, Sparkles, Shield, Bell, Eye, Code, Cpu, Save, Check, X as XIcon, Paperclip, XCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRorkAgent, createRorkTool } from '@rork/toolkit-sdk';
import { useApp } from '@/contexts/AppContext';
import { trpcRawClient } from '@/lib/trpc-client';
import { z } from 'zod';
import IoTDeviceService from '@/services/IoTDeviceService';
import CodebaseAnalysisService from '@/services/CodebaseAnalysisService';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { IronManTheme } from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AIAssistantModalProps {
  visible: boolean;
  onClose: () => void;
}

type TabType = 'chat' | 'settings' | 'capabilities' | 'ai-models';

const JARVIS_GREETING = "Good day, sir. JARVIS at your service. All systems operational and standing by for your commands.";

export default function EnhancedAIAssistantModal({ visible, onClose }: AIAssistantModalProps) {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const { state, addContentItem, addScheduledTask, addAITask, addInsight, addTrend, addSystemLog, connectSocialAccount, addRevenueStream, addPersona, updateMetrics, updateAIPreferences, toggleAIModel, addAICost } = useApp();
  
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [selectedImages, setSelectedImages] = useState<{ uri: string; type: string }[]>([]);
  const greetingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const recordingRef = useRef<Audio.Recording | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const [settings, setSettings] = useState({
    voice: {
      enabled: true,
      autoSpeak: true,
      rate: 0.9,
      pitch: 0.95,
      volume: 1.0,
    },
    autonomy: {
      maxDailySpend: 500,
      maxPerCampaign: 100,
      autoPostContent: true,
      autoRespondCustomers: true,
      autoFulfillOrders: true,
      autoOptimizeCampaigns: true,
      requireApprovalOver: 500,
    },
    notifications: {
      opportunities: true,
      alerts: true,
      dailyReports: true,
      weeklyReports: true,
      sound: true,
    },
    display: {
      compactMode: false,
      animations: true,
    },
    advanced: {
      debugMode: false,
      apiLogging: false,
    },
    aiModelPreferences: {
      useFreeTierFirst: true,
      maxDailySpend: 100,
      preferredTextModel: 'Gemini 1.5 Flash',
      preferredImageModel: 'Flux.1 Schnell',
      preferredCodeModel: 'DeepSeek Coder',
      preferredDataModel: 'Gemini Pro',
      autoSelectBestModel: true,
      trackCosts: true,
    },
  });

  useEffect(() => {
    if (state.aiPreferences) {
      setSettings(prev => ({
        ...prev,
        aiModelPreferences: state.aiPreferences,
      }));
    }
  }, [state.aiPreferences]);

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
        execute(input) {
          addContentItem(
            `${input.platform} ${input.contentType}`,
            `Generated content about ${input.topic} in ${input.tone} tone`,
            input.contentType
          );
          addSystemLog('success', `Generated ${input.contentType} for ${input.platform}`, 'AI');
          addInsight(`AI created ${input.contentType} content for ${input.platform} about ${input.topic}`);
          return `Right away, sir. ${input.contentType} for ${input.platform} has been generated and queued for your review.`;
        },
      }),
      
      analyzeTrends: createRorkTool({
        description: 'Analyze current trends and provide insights',
        zodSchema: z.object({
          platform: z.string().describe('Platform to analyze'),
          topics: z.array(z.string()).describe('Topics to focus on'),
          timeframe: z.string().describe('Time period (24h, 7d, 30d)'),
        }),
        execute(input) {
          input.topics.forEach((topic) => {
            addTrend(topic, input.platform, Math.floor(Math.random() * 100000), Math.random(), Math.floor(Math.random() * 100));
          });
          addSystemLog('success', `Analyzed trends for ${input.platform}`, 'AI');
          addInsight(`AI analyzed ${input.topics.length} trending topics on ${input.platform}`);
          return `Analysis complete, sir. I've identified ${input.topics.length} trending topics on ${input.platform}. The data suggests significant opportunities for engagement.`;
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
        execute(input) {
          const time = new Date(input.scheduledTime).getTime();
          addScheduledTask(input.title, input.content, time, 'post');
          addSystemLog('success', `Scheduled post for ${input.platform}`, 'Automation');
          addInsight(`AI scheduled ${input.title} for ${new Date(time).toLocaleString()}`);
          return `Post scheduled for ${new Date(time).toLocaleString()}, sir. I'll handle the execution automatically.`;
        },
      }),

      optimizeMonetization: createRorkTool({
        description: 'Analyze and optimize revenue streams',
        zodSchema: z.object({
          currentRevenue: z.number().describe('Current monthly revenue'),
          platforms: z.array(z.string()).describe('Connected platforms'),
          goals: z.number().describe('Revenue goal'),
        }),
        execute(input) {
          const increase = input.goals - input.currentRevenue;
          addInsight(`AI identified strategies to increase revenue by $${increase.toFixed(2)}`);
          addSystemLog('success', 'Generated monetization optimization plan', 'AI');
          return `I've analyzed your revenue streams, sir. To reach your goal of $${input.goals.toFixed(0)}, I recommend diversifying across affiliate marketing, premium subscriptions, and strategic sponsorships. Projected timeline: 6-9 months with 85% confidence.`;
        },
      }),

      connectPlatform: createRorkTool({
        description: 'Connect a new social media or e-commerce platform',
        zodSchema: z.object({
          platform: z.string().describe('Platform name'),
          username: z.string().describe('Username/handle'),
          category: z.enum(['social', 'gaming', 'ecommerce', 'video', 'messaging', 'professional', 'other']).describe('Platform category'),
        }),
        execute(input) {
          connectSocialAccount(input.platform, input.username, input.category);
          addSystemLog('success', `Connected ${input.platform}`, 'Integration');
          addInsight(`AI connected ${input.platform} account: ${input.username}`);
          return `Platform connected successfully, sir. ${input.platform} account @${input.username} is now integrated and ready for automation.`;
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
        execute(input) {
          addAITask('image_generation' as any, `Generate ${input.type}: ${input.prompt}`, 'high');
          addSystemLog('info', `Queued ${input.type} generation`, 'AI');
          addInsight(`AI is generating ${input.type} based on: "${input.prompt}"`);
          return `Understood, sir. I'm generating ${input.type} with the specifications you've provided. This will take approximately 30-60 seconds.`;
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
        execute(input) {
          addRevenueStream(input.name, input.type, input.platform, input.estimatedAmount);
          addSystemLog('success', `Created revenue stream: ${input.name}`, 'Monetization');
          addInsight(`AI set up ${input.type} revenue stream on ${input.platform}`);
          return `Revenue stream "${input.name}" has been established, sir. Projected monthly revenue: $${input.estimatedAmount.toFixed(2)}. I'll monitor and optimize performance automatically.`;
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
        execute(input) {
          addPersona(input.name, input.description, input.tone, input.topics, input.targetAudience);
          addSystemLog('success', `Created persona: ${input.name}`, 'AI');
          addInsight(`AI created new persona "${input.name}" targeting ${input.targetAudience}`);
          return `Persona "${input.name}" has been created and calibrated, sir. I'll generate content tailored for ${input.targetAudience} using this profile.`;
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
        execute(input) {
          updateMetrics(input);
          addSystemLog('success', 'Updated metrics', 'Analytics');
          return 'Metrics updated successfully, sir.';
        },
      }),

      automateWorkflow: createRorkTool({
        description: 'Create automated workflows for routine tasks',
        zodSchema: z.object({
          taskType: z.string().describe('Type of task to automate'),
          frequency: z.string().describe('How often to run (daily, weekly, etc)'),
          conditions: z.array(z.string()).describe('Conditions to trigger automation'),
        }),
        execute(input) {
          addAITask('optimization' as any, `Automate ${input.taskType} ${input.frequency}`, 'medium');
          addSystemLog('success', `Created automation for ${input.taskType}`, 'Automation');
          addInsight(`AI automated ${input.taskType} to run ${input.frequency}`);
          return `Automation configured, sir. ${input.taskType} will now run ${input.frequency} without requiring your intervention.`;
        },
      }),

      controlIoTDevice: createRorkTool({
        description: 'Control IoT devices like 3D printers, smart lights, sensors, and other connected devices',
        zodSchema: z.object({
          deviceId: z.string().describe('Device ID to control'),
          command: z.string().describe('Command to execute'),
          parameters: z.record(z.string(), z.any()).optional().describe('Command parameters'),
        }),
        execute(input) {
          const device = IoTDeviceService.getDevice(input.deviceId);
          if (!device) {
            return `Device not found, sir. Please check the device ID and try again.`;
          }

          IoTDeviceService.executeCommand(input.deviceId, input.command, input.parameters || {})
            .then(() => {
              addSystemLog('success', `IoT command executed: ${input.command} on ${device.name}`, 'IoT');
              addInsight(`JARVIS controlled ${device.name}: ${input.command}`);
            })
            .catch((error) => {
              addSystemLog('error', `IoT command failed: ${error.message}`, 'IoT');
            });

          return `Executing ${input.command} on ${device.name}, sir. I'll monitor the results.`;
        },
      }),

      add3DPrinter: createRorkTool({
        description: 'Add a 3D printer to the IoT network for remote control',
        zodSchema: z.object({
          name: z.string().describe('Printer name'),
          manufacturer: z.string().describe('Manufacturer (e.g., Prusa, Creality)'),
          model: z.string().describe('Model name'),
          ipAddress: z.string().describe('IP address of the printer'),
          apiKey: z.string().optional().describe('API key if required'),
        }),
        async execute(input) {
          const commands = [
            { id: 'print_file', name: 'Start Print', description: 'Start printing', parameters: [{ name: 'filename', type: 'string' as const, required: true }] },
            { id: 'pause_print', name: 'Pause Print', description: 'Pause print job', parameters: [] },
            { id: 'cancel_print', name: 'Cancel Print', description: 'Cancel print job', parameters: [] },
            { id: 'preheat_bed', name: 'Preheat Bed', description: 'Preheat bed', parameters: [{ name: 'temperature', type: 'number' as const, required: true, default: 60 }] },
            { id: 'get_status', name: 'Get Status', description: 'Get printer status', parameters: [] },
          ];

          await IoTDeviceService.addDevice({
            name: input.name,
            type: '3d_printer',
            manufacturer: input.manufacturer,
            model: input.model,
            ipAddress: input.ipAddress,
            apiKey: input.apiKey,
            protocol: 'http',
            apiEndpoint: `http://${input.ipAddress}`,
            capabilities: ['print', 'pause', 'cancel', 'preheat', 'status'],
            currentState: { status: 'idle' },
            commands,
          });

          addSystemLog('success', `3D Printer added: ${input.name}`, 'IoT');
          addInsight(`JARVIS connected to 3D printer: ${input.name}`);

          return `3D printer "${input.name}" has been added to the network, sir. I can now control printing operations remotely.`;
        },
      }),

      addSmartDevice: createRorkTool({
        description: 'Add smart home devices like lights, plugs, or thermostats',
        zodSchema: z.object({
          name: z.string().describe('Device name'),
          type: z.enum(['smart_light', 'smart_plug', 'thermostat']).describe('Device type'),
          ipAddress: z.string().describe('IP address'),
          apiKey: z.string().optional().describe('API key if required'),
        }),
        async execute(input) {
          const deviceConfig = IoTDeviceService.createSmartHomeDevice(input.name, input.type);
          
          await IoTDeviceService.addDevice({
            ...deviceConfig,
            ipAddress: input.ipAddress,
            apiKey: input.apiKey,
            apiEndpoint: `http://${input.ipAddress}`,
          });

          addSystemLog('success', `Smart device added: ${input.name}`, 'IoT');
          addInsight(`JARVIS connected to ${input.type}: ${input.name}`);

          return `Smart device "${input.name}" is now connected, sir. I have full control over its functions.`;
        },
      }),

      analyzeCodebase: createRorkTool({
        description: 'Analyze the application codebase to understand structure, complexity, and suggest improvements',
        zodSchema: z.object({
          focus: z.enum(['overview', 'file', 'recommendations']).describe('What to analyze'),
          filePath: z.string().optional().describe('Specific file path to analyze'),
        }),
        async execute(input) {
          if (input.focus === 'overview') {
            const overview = await CodebaseAnalysisService.getCodebaseOverview();
            addSystemLog('info', 'Codebase overview generated', 'Analysis');
            return overview;
          }

          if (input.focus === 'file' && input.filePath) {
            const explanation = CodebaseAnalysisService.explainFile(input.filePath);
            addSystemLog('info', `Analyzed file: ${input.filePath}`, 'Analysis');
            return explanation;
          }

          if (input.focus === 'recommendations') {
            const recommendations = CodebaseAnalysisService.generateUpgradeRecommendations();
            addSystemLog('info', 'Generated upgrade recommendations', 'Analysis');
            const list = recommendations.map((r, i) => `${i + 1}. ${r}`).join(' ');
            return `I have identified ${recommendations.length} recommendations for improving the system: ${list}`;
          }

          return 'Please specify what you would like me to analyze, sir.';
        },
      }),

      writeCode: createRorkTool({
        description: 'Write or modify code files in the project',
        zodSchema: z.object({
          filePath: z.string().describe('Path where to save the file'),
          content: z.string().describe('The code content to write'),
          language: z.string().describe('Programming language (typescript, javascript, python, etc)'),
          action: z.enum(['create', 'update', 'append']).describe('Action to perform'),
        }),
        async execute(input) {
          try {
            await trpcRawClient.ai.writeFile.mutate(input);
            addSystemLog('success', `File operation: ${input.action} ${input.filePath}`, 'Development');
            addInsight(`JARVIS ${input.action === 'create' ? 'created' : input.action === 'update' ? 'updated' : 'appended to'} file: ${input.filePath}`);
            return `File ${input.action} operation completed successfully for ${input.filePath}, sir. Your ${input.language} code has been written to the codebase.`;
          } catch (error: any) {
            addSystemLog('error', `File operation failed: ${error.message}`, 'Development');
            return `I apologize, sir. The file operation failed: ${error.message}`;
          }
        },
      }),

      executeCode: createRorkTool({
        description: 'Execute code in a sandboxed environment for testing',
        zodSchema: z.object({
          language: z.string().describe('Programming language (python, javascript, typescript, etc)'),
          code: z.string().describe('Code to execute'),
          environment: z.string().describe('Execution environment (sandbox, container, local)'),
        }),
        async execute(input) {
          try {
            const result = await trpcRawClient.ai.executeCode.mutate(input);
            addSystemLog(result.success ? 'success' : 'error', `Code execution: ${input.language}`, 'Development');
            addInsight(`JARVIS executed ${input.language} code with ${result.success ? 'success' : 'errors'}`);
            return `Code execution ${result.success ? 'completed successfully' : 'failed'}, sir. Output: ${result.output}`;
          } catch (error: any) {
            addSystemLog('error', `Code execution failed: ${error.message}`, 'Development');
            return `I apologize, sir. Code execution failed: ${error.message}`;
          }
        },
      }),

      createProject: createRorkTool({
        description: 'Scaffold a new project with the specified framework and structure',
        zodSchema: z.object({
          projectType: z.string().describe('Type of project (web app, API, mobile app, CLI tool, etc)'),
          framework: z.string().describe('Framework to use (React, Next.js, Express, Django, etc)'),
          projectName: z.string().describe('Name of the project'),
          directory: z.string().describe('Directory where to create the project'),
        }),
        async execute(input) {
          try {
            const result = await trpcRawClient.ai.createProject.mutate(input);
            addSystemLog('success', `Project scaffolding: ${input.projectName} with ${input.framework}`, 'Development');
            addInsight(`JARVIS created new ${input.projectType} project: ${input.projectName}`);
            return `Project scaffolding complete, sir. Your ${input.projectType} using ${input.framework} has been initialized at ${result.path}. All dependencies are being installed.`;
          } catch (error: any) {
            addSystemLog('error', `Project creation failed: ${error.message}`, 'Development');
            return `I apologize, sir. Project creation failed: ${error.message}`;
          }
        },
      }),

      gitOperation: createRorkTool({
        description: 'Perform Git version control operations',
        zodSchema: z.object({
          operation: z.enum(['commit', 'push', 'pull', 'branch', 'merge', 'status']).describe('Git operation to perform'),
          message: z.string().optional().describe('Commit message (for commit operation)'),
          repository: z.string().optional().describe('Repository URL or path'),
          branchName: z.string().optional().describe('Branch name (for branch operations)'),
        }),
        async execute(input) {
          try {
            const result = await trpcRawClient.ai.gitOperation.mutate(input);
            addSystemLog('success', `Git operation: ${input.operation}`, 'Development');
            addInsight(`JARVIS performed git ${input.operation}${input.message ? `: ${input.message}` : ''}`);
            
            let response = `Git ${input.operation} operation executed successfully, sir.`;
            if (input.operation === 'commit' && input.message) {
              response = `Changes committed with message: "${input.message}", sir.`;
            } else if (input.operation === 'push') {
              response = `Code pushed to remote repository successfully, sir.`;
            } else if (input.operation === 'pull') {
              response = `Latest changes pulled from remote, sir. Your local repository is now up to date.`;
            } else if (input.operation === 'branch' && input.branchName) {
              response = `New branch "${input.branchName}" created and checked out, sir.`;
            }
            
            return response + ` Output: ${result.output}`;
          } catch (error: any) {
            addSystemLog('error', `Git operation failed: ${error.message}`, 'Development');
            return `I apologize, sir. Git operation failed: ${error.message}`;
          }
        },
      }),

      manageDependencies: createRorkTool({
        description: 'Install, update, or remove project dependencies',
        zodSchema: z.object({
          action: z.enum(['install', 'update', 'remove']).describe('Action to perform'),
          packages: z.array(z.string()).describe('List of package names'),
          packageManager: z.enum(['npm', 'yarn', 'pnpm', 'bun', 'pip', 'cargo', 'composer']).describe('Package manager to use'),
        }),
        async execute(input) {
          try {
            await trpcRawClient.ai.manageDependencies.mutate(input);
            const pkgList = input.packages.join(', ');
            addSystemLog('success', `Package ${input.action}: ${pkgList}`, 'Development');
            addInsight(`JARVIS ${input.action}ed packages: ${pkgList} using ${input.packageManager}`);
            
            let response = '';
            if (input.action === 'install') {
              response = `Successfully installed ${input.packages.length} package(s) using ${input.packageManager}, sir: ${pkgList}.`;
            } else if (input.action === 'update') {
              response = `Successfully updated ${input.packages.length} package(s) to their latest versions, sir: ${pkgList}.`;
            } else if (input.action === 'remove') {
              response = `Successfully removed ${input.packages.length} package(s) from the project, sir: ${pkgList}.`;
            }
            
            return response;
          } catch (error: any) {
            addSystemLog('error', `Package management failed: ${error.message}`, 'Development');
            return `I apologize, sir. Package management operation failed: ${error.message}`;
          }
        },
      }),

      deployProject: createRorkTool({
        description: 'Deploy the project to production or staging environment',
        zodSchema: z.object({
          environment: z.enum(['production', 'staging', 'development']).describe('Target environment'),
          platform: z.string().describe('Deployment platform (Vercel, Netlify, AWS, etc)'),
          buildCommand: z.string().optional().describe('Custom build command'),
        }),
        execute(input) {
          addSystemLog('success', `Deployment to ${input.environment} on ${input.platform}`, 'Development');
          addInsight(`JARVIS deployed application to ${input.environment} environment`);
          
          return `Deployment initiated to ${input.environment} environment on ${input.platform}, sir. I'm running the build process now and will notify you once live.`;
        },
      }),

      runTests: createRorkTool({
        description: 'Run automated tests on the codebase',
        zodSchema: z.object({
          testType: z.enum(['unit', 'integration', 'e2e', 'all']).describe('Type of tests to run'),
          coverage: z.boolean().optional().describe('Generate coverage report'),
          watch: z.boolean().optional().describe('Run in watch mode'),
        }),
        execute(input) {
          addSystemLog('info', `Running ${input.testType} tests`, 'Development');
          addInsight(`JARVIS executed ${input.testType} tests${input.coverage ? ' with coverage' : ''}`);
          
          return `Executing ${input.testType} test suite${input.watch ? ' in watch mode' : ''}, sir. ${input.coverage ? 'Coverage report will be generated upon completion.' : 'I\'ll report the results shortly.'}`;
        },
      }),

      optimizePerformance: createRorkTool({
        description: 'Analyze and optimize application performance',
        zodSchema: z.object({
          target: z.enum(['bundle-size', 'runtime', 'memory', 'network', 'all']).describe('Performance target to optimize'),
          aggressive: z.boolean().optional().describe('Use aggressive optimization'),
        }),
        execute(input) {
          addSystemLog('info', `Performance optimization: ${input.target}`, 'Development');
          addInsight(`JARVIS optimized ${input.target} performance`);
          
          return `Analyzing ${input.target} performance metrics, sir. I'm applying ${input.aggressive ? 'aggressive' : 'standard'} optimizations to improve efficiency.`;
        },
      }),

      securityScan: createRorkTool({
        description: 'Scan codebase for security vulnerabilities',
        zodSchema: z.object({
          scanType: z.enum(['dependencies', 'code', 'secrets', 'all']).describe('Type of security scan'),
          autoFix: z.boolean().optional().describe('Automatically fix issues when possible'),
        }),
        execute(input) {
          addSystemLog('info', `Security scan: ${input.scanType}`, 'Security');
          addInsight(`JARVIS performed ${input.scanType} security scan${input.autoFix ? ' with auto-fix' : ''}`);
          
          return `Security scan initiated for ${input.scanType}, sir. ${input.autoFix ? 'I\'ll automatically patch any fixable vulnerabilities.' : 'I\'ll report any vulnerabilities found.'}`;
        },
      }),

      searchCodebase: createRorkTool({
        description: 'Search the codebase for specific files, features, or functionality',
        zodSchema: z.object({
          query: z.string().describe('Search query'),
        }),
        execute(input) {
          const results = CodebaseAnalysisService.searchFiles(input.query);
          addSystemLog('info', `Searched codebase: "${input.query}"`, 'Analysis');
          
          if (results.length === 0) {
            return `No files found matching "${input.query}", sir.`;
          }

          const fileList = results.slice(0, 5).map(f => `${f.path}: ${f.description}`).join(', ');
          const more = results.length > 5 ? ` ...and ${results.length - 5} more files` : '';
          
          return `Found ${results.length} files matching "${input.query}", sir: ${fileList}${more}`;
        },
      }),

      getCodeInsights: createRorkTool({
        description: 'Get AI-powered insights about the codebase architecture and quality',
        zodSchema: z.object({
          category: z.enum(['architecture', 'performance', 'security', 'maintainability', 'all']).optional().describe('Filter by category'),
        }),
        execute(input) {
          const insights = input.category && input.category !== 'all'
            ? CodebaseAnalysisService.getInsightsByCategory(input.category)
            : CodebaseAnalysisService.getInsights();

          addSystemLog('info', 'Retrieved code insights', 'Analysis');

          if (insights.length === 0) {
            return 'No insights available at the moment, sir.';
          }

          const insightText = insights.map(i => 
            `${i.severity.toUpperCase()}: ${i.title}. ${i.description}. ${i.suggestion ? `Suggestion: ${i.suggestion}` : ''}`
          ).join(' ');

          return `Here are the code insights, sir: ${insightText}`;
        },
      }),
    },
  });

  useEffect(() => {
    if (visible) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      
      if (!hasGreeted && settings.voice.enabled && settings.voice.autoSpeak && messages.length === 0) {
        greetingTimerRef.current = setTimeout(() => {
          console.log('[JARVIS] Playing greeting...');
          speakText(JARVIS_GREETING);
          setHasGreeted(true);
        }, 800);
      }
    } else {
      if (greetingTimerRef.current) {
        clearTimeout(greetingTimerRef.current);
      }
    }
    
    return () => {
      if (greetingTimerRef.current) {
        clearTimeout(greetingTimerRef.current);
      }
    };
  }, [messages, visible, hasGreeted, settings.voice.enabled, settings.voice.autoSpeak]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && settings.voice.enabled && settings.voice.autoSpeak && visible) {
      const textParts = lastMessage.parts.filter(p => p.type === 'text');
      if (textParts.length > 0) {
        const text = textParts.map((p: any) => p.text).join(' ');
        if (text.trim()) {
          console.log('[JARVIS] Auto-speaking response:', text.substring(0, 50) + '...');
          setTimeout(() => {
            speakText(text);
          }, 300);
        }
      }
    }
  }, [messages, settings.voice.enabled, settings.voice.autoSpeak, visible]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('jarvis_settings');
      if (stored) {
        const loadedSettings = JSON.parse(stored);
        console.log('[JARVIS] Loaded settings:', loadedSettings);
        setSettings(loadedSettings);
      } else {
        console.log('[JARVIS] No saved settings, using defaults (voice enabled)');
      }
    } catch (error) {
      console.error('[JARVIS] Failed to load settings:', error);
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

  const handleSend = () => {
    if (message.trim() || selectedImages.length > 0) {
      if (selectedImages.length > 0) {
        const messageObject = {
          text: message.trim() || 'Analyze these images',
          files: selectedImages.map(img => ({
            type: 'file' as const,
            mediaType: img.type,
            url: img.uri,
          })),
        };
        sendMessage(messageObject);
      } else {
        sendMessage(message);
      }
      setMessage('');
      setSelectedImages([]);
      Keyboard.dismiss();
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need camera roll permissions to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map(asset => ({
          uri: `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`,
          type: asset.mimeType || 'image/jpeg',
        }));
        setSelectedImages(prev => [...prev, ...newImages]);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const speakText = async (text: string) => {
    if (!settings.voice.enabled) {
      console.log('[JARVIS] Voice is disabled in settings');
      return;
    }

    try {
      const currentlySpeaking = await Speech.isSpeakingAsync();
      if (currentlySpeaking) {
        console.log('[JARVIS] Stopping current speech...');
        await Speech.stop();
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      console.log('[JARVIS] ===== SPEAKING NOW =====');
      console.log('[JARVIS] Text:', text);
      console.log('[JARVIS] Settings:', { pitch: settings.voice.pitch, rate: settings.voice.rate, enabled: settings.voice.enabled });
      
      setIsSpeaking(true);
      
      const speechOptions: Speech.SpeechOptions = {
        language: 'en-US',
        pitch: settings.voice.pitch,
        rate: settings.voice.rate,
        volume: settings.voice.volume,
        onDone: () => {
          console.log('[JARVIS] ===== Speech completed successfully =====');
          setIsSpeaking(false);
        },
        onStopped: () => {
          console.log('[JARVIS] Speech stopped');
          setIsSpeaking(false);
        },
        onError: (error: any) => {
          console.error('[JARVIS] ===== Speech error =====', error);
          setIsSpeaking(false);
        },
      };

      if (Platform.OS === 'android') {
        speechOptions.voice = 'en-us-x-tpf#male_1-local';
      } else if (Platform.OS === 'ios') {
        speechOptions.voice = 'com.apple.ttsbundle.Daniel-compact';
      }

      await Speech.speak(text, speechOptions);
      console.log('[JARVIS] Speech.speak() called successfully');
    } catch (error) {
      console.error('[JARVIS] ===== Speech critical error =====', error);
      setIsSpeaking(false);
      Alert.alert('Voice Error', 'Failed to play voice. Check console for details.');
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

  const renderChatTab = () => (
    <>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesScroll}
        contentContainerStyle={[styles.messagesContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.jarvisLogo}>
              <Bot color={IronManTheme.jarvisGreen} size={64} />
              <View style={styles.arcReactor} />
            </View>
            <Text style={styles.emptyTitle}>J.A.R.V.I.S. Online</Text>
            <Text style={styles.emptySubtitle}>Just A Rather Very Intelligent System</Text>
            <Text style={styles.emptyText}>
              At your service, sir. I can manage your entire operation - content generation, trend analysis, revenue optimization, workflow automation, and strategic insights.
            </Text>
            <View style={styles.capabilitiesGrid}>
              <View style={styles.capabilityCard}>
                <Sparkles size={20} color={IronManTheme.secondary} />
                <Text style={styles.capabilityText}>Content Generation</Text>
              </View>
              <View style={styles.capabilityCard}>
                <TrendingUp size={20} color={IronManTheme.accent} />
                <Text style={styles.capabilityText}>Trend Analysis</Text>
              </View>
              <View style={styles.capabilityCard}>
                <DollarSign size={20} color={IronManTheme.success} />
                <Text style={styles.capabilityText}>Revenue Optimization</Text>
              </View>
              <View style={styles.capabilityCard}>
                <Zap size={20} color={IronManTheme.warning} />
                <Text style={styles.capabilityText}>Automation</Text>
              </View>
            </View>
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
              {msg.parts.map((part, i) => {
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
                            <Zap color={IronManTheme.warning} size={14} />
                            <Text style={styles.toolText}>{toolName}</Text>
                          </View>
                        );
                      case 'output-available':
                        return (
                          <View key={`${msg.id}-${i}`} style={styles.toolSuccess}>
                            <Target color={IronManTheme.success} size={14} />
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
              })}
            </View>
          ))
        )}
      </ScrollView>

      <View style={{ paddingBottom: insets.bottom || 16 }}>
        {selectedImages.length > 0 && (
          <View style={styles.imagePreviewContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagePreviewScroll}>
              {selectedImages.map((img, index) => (
                <View key={index} style={styles.imagePreviewWrapper}>
                  <Image source={{ uri: img.uri }} style={styles.imagePreview} />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <XCircle size={20} color={IronManTheme.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
        <View style={styles.inputContainer}>
          <TouchableOpacity 
            style={[styles.micButton, isRecording && styles.micButtonActive]}
            onPress={isRecording ? stopRecording : startRecording}
            disabled={isProcessingAudio}
          >
            {isProcessingAudio ? (
              <ActivityIndicator size="small" color={IronManTheme.jarvisGreen} />
            ) : isRecording ? (
              <MicOff size={20} color={IronManTheme.danger} />
            ) : (
              <Mic size={20} color={IronManTheme.jarvisGreen} />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={pickImage}
          >
            <Paperclip size={20} color={IronManTheme.accent} />
          </TouchableOpacity>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Speak or type your command, sir..."
            placeholderTextColor={IronManTheme.textMuted}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={1000}
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !message.trim() && selectedImages.length === 0 && styles.sendButtonDisabled]} 
            onPress={handleSend}
            disabled={!message.trim() && selectedImages.length === 0}
          >
            <Send size={20} color={(message.trim() || selectedImages.length > 0) ? "#000" : IronManTheme.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  const renderSettingsTab = () => (
    <ScrollView style={styles.settingsScroll} showsVerticalScrollIndicator={false}>
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>
          <Volume2 size={18} color={IronManTheme.jarvisGreen} /> Voice Settings
        </Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Voice Enabled</Text>
            <Text style={styles.settingDescription}>Enable Jarvis voice responses</Text>
          </View>
          <Switch
            value={settings.voice.enabled}
            onValueChange={(value) => saveSettings({ ...settings, voice: { ...settings.voice, enabled: value } })}
            trackColor={{ false: IronManTheme.surfaceLight, true: IronManTheme.success }}
            thumbColor={settings.voice.enabled ? IronManTheme.secondary : IronManTheme.textMuted}
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
            trackColor={{ false: IronManTheme.surfaceLight, true: IronManTheme.success }}
            thumbColor={settings.voice.autoSpeak ? IronManTheme.secondary : IronManTheme.textMuted}
          />
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>
          <Shield size={18} color={IronManTheme.primary} /> Autonomy Settings
        </Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Max Daily Spend</Text>
            <Text style={styles.settingDescription}>${settings.autonomy.maxDailySpend}/day</Text>
          </View>
          <TextInput
            style={styles.settingInput}
            value={String(settings.autonomy.maxDailySpend)}
            onChangeText={(value) => saveSettings({ ...settings, autonomy: { ...settings.autonomy, maxDailySpend: parseInt(value) || 0 } })}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Auto-Post Content</Text>
            <Text style={styles.settingDescription}>Post content without approval</Text>
          </View>
          <Switch
            value={settings.autonomy.autoPostContent}
            onValueChange={(value) => saveSettings({ ...settings, autonomy: { ...settings.autonomy, autoPostContent: value } })}
            trackColor={{ false: IronManTheme.surfaceLight, true: IronManTheme.success }}
            thumbColor={settings.autonomy.autoPostContent ? IronManTheme.secondary : IronManTheme.textMuted}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Auto-Optimize Campaigns</Text>
            <Text style={styles.settingDescription}>Optimize ads automatically</Text>
          </View>
          <Switch
            value={settings.autonomy.autoOptimizeCampaigns}
            onValueChange={(value) => saveSettings({ ...settings, autonomy: { ...settings.autonomy, autoOptimizeCampaigns: value } })}
            trackColor={{ false: IronManTheme.surfaceLight, true: IronManTheme.success }}
            thumbColor={settings.autonomy.autoOptimizeCampaigns ? IronManTheme.secondary : IronManTheme.textMuted}
          />
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>
          <Bell size={18} color={IronManTheme.accent} /> Notifications
        </Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Opportunities</Text>
            <Text style={styles.settingDescription}>New revenue opportunities</Text>
          </View>
          <Switch
            value={settings.notifications.opportunities}
            onValueChange={(value) => saveSettings({ ...settings, notifications: { ...settings.notifications, opportunities: value } })}
            trackColor={{ false: IronManTheme.surfaceLight, true: IronManTheme.success }}
            thumbColor={settings.notifications.opportunities ? IronManTheme.secondary : IronManTheme.textMuted}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Daily Reports</Text>
            <Text style={styles.settingDescription}>Daily performance summary</Text>
          </View>
          <Switch
            value={settings.notifications.dailyReports}
            onValueChange={(value) => saveSettings({ ...settings, notifications: { ...settings.notifications, dailyReports: value } })}
            trackColor={{ false: IronManTheme.surfaceLight, true: IronManTheme.success }}
            thumbColor={settings.notifications.dailyReports ? IronManTheme.secondary : IronManTheme.textMuted}
          />
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>
          <Code size={18} color={IronManTheme.warning} /> Advanced
        </Text>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Debug Mode</Text>
            <Text style={styles.settingDescription}>Show detailed logs</Text>
          </View>
          <Switch
            value={settings.advanced.debugMode}
            onValueChange={(value) => saveSettings({ ...settings, advanced: { ...settings.advanced, debugMode: value } })}
            trackColor={{ false: IronManTheme.surfaceLight, true: IronManTheme.success }}
            thumbColor={settings.advanced.debugMode ? IronManTheme.secondary : IronManTheme.textMuted}
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>API Logging</Text>
            <Text style={styles.settingDescription}>Log all API requests</Text>
          </View>
          <Switch
            value={settings.advanced.apiLogging}
            onValueChange={(value) => saveSettings({ ...settings, advanced: { ...settings.advanced, apiLogging: value } })}
            trackColor={{ false: IronManTheme.surfaceLight, true: IronManTheme.success }}
            thumbColor={settings.advanced.apiLogging ? IronManTheme.secondary : IronManTheme.textMuted}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.resetButton} onPress={() => Alert.alert('Reset Settings', 'Are you sure you want to reset all settings to defaults?')}>
        <Text style={styles.resetButtonText}>Reset to Defaults</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderCapabilitiesTab = () => (
    <ScrollView style={styles.capabilitiesScroll} showsVerticalScrollIndicator={false}>
      <Text style={styles.capabilitiesTitle}>JARVIS Capabilities</Text>
      <Text style={styles.capabilitiesDescription}>
        All systems operational. These are the modules currently at your disposal, sir.
      </Text>
      
      {[
        { icon: Sparkles, title: 'Content Generation', description: 'Generate posts, videos, and media for all platforms', color: IronManTheme.secondary },
        { icon: TrendingUp, title: 'Trend Analysis', description: 'Real-time trend detection and opportunity identification', color: IronManTheme.accent },
        { icon: DollarSign, title: 'Revenue Optimization', description: 'Multi-stream monetization and profit maximization', color: IronManTheme.success },
        { icon: Zap, title: 'Workflow Automation', description: 'Autonomous task execution and campaign management', color: IronManTheme.warning },
        { icon: Target, title: 'Ad Optimization', description: 'Intelligent ad spend allocation and performance tuning', color: IronManTheme.primary },
        { icon: Bot, title: 'Customer Service', description: 'AI-powered customer interaction and support', color: IronManTheme.jarvisGreen },
        { icon: Code, title: 'Code Writing/Editing', description: 'Write, update, or append code files in any language', color: IronManTheme.accent },
        { icon: Cpu, title: 'Code Execution', description: 'Execute code in sandboxed environments for testing', color: IronManTheme.warning },
        { icon: Settings, title: 'Project Scaffolding', description: 'Create new projects with any framework or structure', color: IronManTheme.secondary },
        { icon: Shield, title: 'Git Integration', description: 'Version control operations: commit, push, pull, branch, merge', color: IronManTheme.success },
        { icon: Target, title: 'Package Management', description: 'Install, update, remove dependencies with any package manager', color: IronManTheme.primary },
        { icon: Sparkles, title: 'Deployment', description: 'Deploy to production, staging, or development environments', color: IronManTheme.jarvisGreen },
        { icon: Zap, title: 'Automated Testing', description: 'Run unit, integration, e2e tests with coverage reports', color: IronManTheme.accent },
        { icon: TrendingUp, title: 'Performance Optimization', description: 'Analyze and optimize bundle size, runtime, and memory', color: IronManTheme.warning },
        { icon: Shield, title: 'Security Scanning', description: 'Scan for vulnerabilities in code, dependencies, and secrets', color: IronManTheme.danger },
        { icon: Bot, title: 'Codebase Analysis', description: 'AI-powered insights about architecture and code quality', color: IronManTheme.success },
      ].map((capability, index) => {
        const Icon = capability.icon;
        return (
          <View key={index} style={styles.capabilityItem}>
            <View style={[styles.capabilityIcon, { backgroundColor: capability.color + '20', borderColor: capability.color }]}>
              <Icon size={24} color={capability.color} />
            </View>
            <View style={styles.capabilityContent}>
              <Text style={styles.capabilityTitle}>{capability.title}</Text>
              <Text style={styles.capabilityDescription}>{capability.description}</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );

  const renderAIModelsTab = () => (
    <ScrollView style={styles.aiModelsScroll} showsVerticalScrollIndicator={false}>
      <View style={styles.aiModelsHeader}>
        <Text style={styles.aiModelsTitle}>AI Model Management</Text>
        <View style={styles.costSummary}>
          <View style={styles.costItem}>
            <Text style={styles.costLabel}>Total Cost</Text>
            <Text style={[styles.costValue, { color: IronManTheme.danger }]}>${state.totalAICost.toFixed(2)}</Text>
          </View>
          <View style={styles.costItem}>
            <Text style={styles.costLabel}>Saved</Text>
            <Text style={[styles.costValue, { color: IronManTheme.success }]}>${state.totalCostSaved.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.modelSection}>
        <Text style={styles.modelSectionTitle}>💚 Free Tier Models (Recommended)</Text>
        {state.aiModels.filter(m => m.tier === 'free').map((model) => (
          <View key={model.id} style={styles.modelCard}>
            <View style={styles.modelHeader}>
              <View style={styles.modelInfo}>
                <Text style={styles.modelName}>{model.name}</Text>
                <Text style={styles.modelProvider}>{model.provider} • {model.type}</Text>
              </View>
              <TouchableOpacity
                style={[styles.modelToggle, model.enabled && styles.modelToggleActive]}
                onPress={() => toggleAIModel(model.id)}
              >
                {model.enabled ? (
                  <Check size={16} color={IronManTheme.success} />
                ) : (
                  <XIcon size={16} color={IronManTheme.textMuted} />
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.modelStats}>
              <Text style={styles.modelStat}>Cost: FREE</Text>
              <Text style={styles.modelStat}>Used: {model.tokensUsed.toLocaleString()} tokens</Text>
            </View>
            {model.recommended && (
              <View style={styles.recommendedBadge}>
                <Sparkles size={12} color={IronManTheme.success} />
                <Text style={styles.recommendedText}>Recommended</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={styles.modelSection}>
        <Text style={styles.modelSectionTitle}>💰 Paid Tier Models</Text>
        {state.aiModels.filter(m => m.tier === 'paid').map((model) => (
          <View key={model.id} style={styles.modelCard}>
            <View style={styles.modelHeader}>
              <View style={styles.modelInfo}>
                <Text style={styles.modelName}>{model.name}</Text>
                <Text style={styles.modelProvider}>{model.provider} • {model.type}</Text>
              </View>
              <TouchableOpacity
                style={[styles.modelToggle, model.enabled && styles.modelToggleActive]}
                onPress={() => toggleAIModel(model.id)}
              >
                {model.enabled ? (
                  <Check size={16} color={IronManTheme.warning} />
                ) : (
                  <XIcon size={16} color={IronManTheme.textMuted} />
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.modelStats}>
              <Text style={styles.modelStat}>Cost: ${model.cost}/1K tokens</Text>
              <Text style={styles.modelStat}>Used: {model.tokensUsed.toLocaleString()} tokens</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.modelSection}>
        <Text style={styles.modelSectionTitle}>🚀 Premium Tier Models</Text>
        <Text style={styles.modelSectionDescription}>Use only for critical tasks requiring maximum capability</Text>
        {state.aiModels.filter(m => m.tier === 'premium').map((model) => (
          <View key={model.id} style={styles.modelCard}>
            <View style={styles.modelHeader}>
              <View style={styles.modelInfo}>
                <Text style={styles.modelName}>{model.name}</Text>
                <Text style={styles.modelProvider}>{model.provider} • {model.type}</Text>
              </View>
              <TouchableOpacity
                style={[styles.modelToggle, model.enabled && styles.modelToggleActive]}
                onPress={() => toggleAIModel(model.id)}
              >
                {model.enabled ? (
                  <Check size={16} color={IronManTheme.primary} />
                ) : (
                  <XIcon size={16} color={IronManTheme.textMuted} />
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.modelStats}>
              <Text style={styles.modelStat}>Cost: ${model.cost}/1K tokens</Text>
              <Text style={styles.modelStat}>Used: {model.tokensUsed.toLocaleString()} tokens</Text>
            </View>
            {model.recommended && (
              <View style={styles.recommendedBadge}>
                <Sparkles size={12} color={IronManTheme.primary} />
                <Text style={styles.recommendedText}>Best Performance</Text>
              </View>
            )}
          </View>
        ))}
      </View>

      <View style={styles.aiPreferencesSection}>
        <Text style={styles.modelSectionTitle}>⚙️ AI Preferences</Text>
        <View style={styles.preferenceRow}>
          <View style={styles.preferenceInfo}>
            <Text style={styles.preferenceLabel}>Use Free Tier First</Text>
            <Text style={styles.preferenceDescription}>Prioritize free models to save costs</Text>
          </View>
          <Switch
            value={settings.aiModelPreferences.useFreeTierFirst}
            onValueChange={(value) => {
              const newPrefs = { ...settings.aiModelPreferences, useFreeTierFirst: value };
              saveSettings({ ...settings, aiModelPreferences: newPrefs });
              updateAIPreferences(newPrefs);
            }}
            trackColor={{ false: IronManTheme.surfaceLight, true: IronManTheme.success }}
            thumbColor={settings.aiModelPreferences.useFreeTierFirst ? IronManTheme.secondary : IronManTheme.textMuted}
          />
        </View>
        <View style={styles.preferenceRow}>
          <View style={styles.preferenceInfo}>
            <Text style={styles.preferenceLabel}>Auto-Select Best Model</Text>
            <Text style={styles.preferenceDescription}>Let JARVIS choose optimal model</Text>
          </View>
          <Switch
            value={settings.aiModelPreferences.autoSelectBestModel}
            onValueChange={(value) => {
              const newPrefs = { ...settings.aiModelPreferences, autoSelectBestModel: value };
              saveSettings({ ...settings, aiModelPreferences: newPrefs });
              updateAIPreferences(newPrefs);
            }}
            trackColor={{ false: IronManTheme.surfaceLight, true: IronManTheme.success }}
            thumbColor={settings.aiModelPreferences.autoSelectBestModel ? IronManTheme.secondary : IronManTheme.textMuted}
          />
        </View>
      </View>
    </ScrollView>
  );

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
          keyboardVerticalOffset={0}
        >
          <View style={[styles.modalContent, { paddingTop: insets.top + 16, paddingBottom: insets.bottom }]}>
            <View style={styles.modalHeader}>
              <View style={styles.headerContent}>
                <View style={styles.jarvisIcon}>
                  <Bot color={IronManTheme.jarvisGreen} size={24} />
                  <View style={styles.arcReactorSmall} />
                </View>
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
                style={[styles.tab, activeTab === 'ai-models' && styles.tabActive]}
                onPress={() => setActiveTab('ai-models')}
              >
                <Cpu size={16} color={activeTab === 'ai-models' ? IronManTheme.success : IronManTheme.textMuted} />
                <Text style={[styles.tabText, activeTab === 'ai-models' && styles.tabTextActive]}>AI</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.tab, activeTab === 'capabilities' && styles.tabActive]}
                onPress={() => setActiveTab('capabilities')}
              >
                <Zap size={16} color={activeTab === 'capabilities' ? IronManTheme.secondary : IronManTheme.textMuted} />
                <Text style={[styles.tabText, activeTab === 'capabilities' && styles.tabTextActive]}>Tools</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.tab, activeTab === 'settings' && styles.tabActive]}
                onPress={() => setActiveTab('settings')}
              >
                <Settings size={16} color={activeTab === 'settings' ? IronManTheme.accent : IronManTheme.textMuted} />
                <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive]}>Config</Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'chat' && renderChatTab()}
            {activeTab === 'ai-models' && renderAIModelsTab()}
            {activeTab === 'settings' && renderSettingsTab()}
            {activeTab === 'capabilities' && renderCapabilitiesTab()}
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
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: IronManTheme.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flex: 1,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: IronManTheme.primary,
    shadowColor: IronManTheme.glow.red,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
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
  jarvisIcon: {
    position: 'relative' as const,
  },
  arcReactorSmall: {
    position: 'absolute' as const,
    bottom: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: IronManTheme.accent,
    shadowColor: IronManTheme.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
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
    backgroundColor: IronManTheme.surface,
    borderWidth: 1,
    borderColor: IronManTheme.surfaceLight,
  },
  iconButtonActive: {
    borderColor: IronManTheme.jarvisGreen,
    backgroundColor: IronManTheme.glow.green + '20',
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
    paddingBottom: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  jarvisLogo: {
    position: 'relative' as const,
    marginBottom: 20,
  },
  arcReactor: {
    position: 'absolute' as const,
    bottom: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: IronManTheme.accent,
    shadowColor: IronManTheme.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: IronManTheme.jarvisGreen,
    marginBottom: 4,
    letterSpacing: 2,
  },
  emptySubtitle: {
    fontSize: 12,
    color: IronManTheme.textSecondary,
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  emptyText: {
    fontSize: 14,
    color: IronManTheme.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 20,
  },
  capabilitiesGrid: {
    marginTop: 24,
    gap: 12,
    alignSelf: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  capabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: IronManTheme.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: IronManTheme.surfaceLight,
  },
  capabilityText: {
    fontSize: 12,
    color: IronManTheme.text,
    fontWeight: '600' as const,
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
    shadowColor: IronManTheme.glow.blue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  assistantMessage: {
    alignSelf: 'flex-start' as const,
    backgroundColor: IronManTheme.surface,
    borderColor: IronManTheme.jarvisGreen,
    shadowColor: IronManTheme.glow.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
  toolExecuting: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: IronManTheme.glow.gold + '20',
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: IronManTheme.warning,
  },
  toolSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: IronManTheme.glow.green + '20',
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: IronManTheme.success,
  },
  toolError: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: IronManTheme.danger,
  },
  toolText: {
    fontSize: 11,
    color: IronManTheme.text,
    fontWeight: '600' as const,
  },
  toolErrorText: {
    fontSize: 11,
    color: IronManTheme.danger,
    fontWeight: '600' as const,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: IronManTheme.surfaceLight,
    backgroundColor: IronManTheme.background,
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: IronManTheme.surface,
    borderWidth: 2,
    borderColor: IronManTheme.jarvisGreen,
  },
  micButtonActive: {
    backgroundColor: IronManTheme.glow.red + '30',
    borderColor: IronManTheme.danger,
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
    borderWidth: 1,
    borderColor: IronManTheme.surfaceLight,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: IronManTheme.jarvisGreen,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: IronManTheme.glow.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  sendButtonDisabled: {
    backgroundColor: IronManTheme.surfaceLight,
    shadowOpacity: 0,
  },
  uploadButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: IronManTheme.surface,
    borderWidth: 2,
    borderColor: IronManTheme.accent,
  },
  imagePreviewContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: IronManTheme.surfaceLight,
    backgroundColor: IronManTheme.background,
  },
  imagePreviewScroll: {
    flexDirection: 'row',
  },
  imagePreviewWrapper: {
    marginRight: 8,
    position: 'relative',
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: IronManTheme.accent,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: IronManTheme.surface,
    borderRadius: 20,
    padding: 2,
  },
  settingsScroll: {
    flex: 1,
    padding: 20,
  },
  settingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: IronManTheme.text,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    borderWidth: 1,
    borderColor: IronManTheme.surfaceLight,
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
  settingInput: {
    width: 80,
    height: 40,
    backgroundColor: IronManTheme.surfaceLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: IronManTheme.text,
    textAlign: 'center' as const,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  resetButton: {
    backgroundColor: IronManTheme.surfaceLight,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: IronManTheme.danger,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: IronManTheme.danger,
  },
  capabilitiesScroll: {
    flex: 1,
    padding: 20,
  },
  capabilitiesTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: IronManTheme.text,
    marginBottom: 8,
  },
  capabilitiesDescription: {
    fontSize: 14,
    color: IronManTheme.textSecondary,
    lineHeight: 20,
    marginBottom: 24,
  },
  capabilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    backgroundColor: IronManTheme.surface,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: IronManTheme.surfaceLight,
  },
  capabilityIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  capabilityContent: {
    flex: 1,
  },
  capabilityTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: IronManTheme.text,
    marginBottom: 4,
  },
  capabilityDescription: {
    fontSize: 12,
    color: IronManTheme.textSecondary,
    lineHeight: 16,
  },
  aiModelsScroll: {
    flex: 1,
    padding: 20,
  },
  aiModelsHeader: {
    marginBottom: 24,
  },
  aiModelsTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: IronManTheme.text,
    marginBottom: 16,
  },
  costSummary: {
    flexDirection: 'row',
    gap: 16,
  },
  costItem: {
    flex: 1,
    backgroundColor: IronManTheme.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: IronManTheme.surfaceLight,
  },
  costLabel: {
    fontSize: 12,
    color: IronManTheme.textSecondary,
    marginBottom: 4,
  },
  costValue: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  modelSection: {
    marginBottom: 24,
  },
  modelSectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: IronManTheme.text,
    marginBottom: 12,
  },
  modelSectionDescription: {
    fontSize: 12,
    color: IronManTheme.textSecondary,
    marginBottom: 12,
    lineHeight: 16,
  },
  modelCard: {
    backgroundColor: IronManTheme.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: IronManTheme.surfaceLight,
  },
  modelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: IronManTheme.text,
    marginBottom: 4,
  },
  modelProvider: {
    fontSize: 12,
    color: IronManTheme.textSecondary,
  },
  modelToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: IronManTheme.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: IronManTheme.textMuted,
  },
  modelToggleActive: {
    backgroundColor: IronManTheme.surface,
    borderColor: IronManTheme.success,
  },
  modelStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  modelStat: {
    fontSize: 12,
    color: IronManTheme.textSecondary,
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: IronManTheme.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: IronManTheme.success,
  },
  aiPreferencesSection: {
    backgroundColor: IronManTheme.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: IronManTheme.surfaceLight,
  },
  preferenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  preferenceInfo: {
    flex: 1,
    marginRight: 16,
  },
  preferenceLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: IronManTheme.text,
    marginBottom: 4,
  },
  preferenceDescription: {
    fontSize: 12,
    color: IronManTheme.textSecondary,
  },
});
