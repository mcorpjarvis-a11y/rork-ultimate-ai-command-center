import AsyncStorage from '@react-native-async-storage/async-storage';
import { queryJarvis } from './JarvisAPIRouter.ts'; // <-- IMPORT THE NEW ROUTER

const GUIDANCE_MODEL_PROVIDER = 'groq'; // Use a fast model for guidance

export interface SetupRequirement {
  id: string;
  feature: string;
  required: string[];
  missingItems: string[];
  setupSteps: string[];
  pageId?: string;
}

class JarvisGuidanceService {
  private static instance: JarvisGuidanceService;

  private constructor() {}

  static getInstance(): JarvisGuidanceService {
    if (!JarvisGuidanceService.instance) {
      JarvisGuidanceService.instance = new JarvisGuidanceService();
    }
    return JarvisGuidanceService.instance;
  }

  async checkConfiguration(feature: string): Promise<SetupRequirement | null> {
    const configurations: Record<string, () => Promise<SetupRequirement | null>> = {
      'social-media': async () => this.checkSocialMediaSetup(),
      'content-generation': async () => this.checkContentGenerationSetup(),
      'monetization': async () => this.checkMonetizationSetup(),
      'iot-control': async () => this.checkIoTSetup(),
      'analytics': async () => this.checkAnalyticsSetup(),
    };

    const checker = configurations[feature];
    if (!checker) {
      return null;
    }

    return await checker();
  }

  private async checkSocialMediaSetup(): Promise<SetupRequirement | null> {
    const accounts = await AsyncStorage.getItem('social_accounts');
    const parsedAccounts = accounts ? JSON.parse(accounts) : [];

    if (parsedAccounts.length === 0) {
      return {
        id: 'social-media',
        feature: 'Social Media Integration',
        required: ['At least one social media account'],
        missingItems: ['Social media accounts'],
        setupSteps: [
          'Navigate to Integrations > Social Connect',
          'Click "Connect Platform" button',
          'Select your social media platform (Instagram, TikTok, YouTube, etc.)',
          'Enter your authentication credentials or API keys',
          'Test the connection',
          'Save the configuration',
        ],
        pageId: 'integrations-social-connect',
      };
    }

    return null;
  }

  private async checkContentGenerationSetup(): Promise<SetupRequirement | null> {
    const apiKeys = await AsyncStorage.getItem('api_keys');
    const parsedKeys = apiKeys ? JSON.parse(apiKeys) : [];
    
    const hasAIKey = parsedKeys.some((key: any) => 
      key.service === 'OpenAI' || key.service === 'Anthropic' || key.service === 'Google AI'
    );

    if (!hasAIKey) {
      return {
        id: 'content-generation',
        feature: 'AI Content Generation',
        required: ['AI API Key (OpenAI, Anthropic, or Google)'],
        missingItems: ['AI API Key'],
        setupSteps: [
          'Navigate to Integrations > API Keys',
          'Click "Add API Key" button',
          'Select an AI provider (OpenAI, Anthropic, or Google)',
          'Enter your API key from the provider dashboard',
          'Test the key connection',
          'Enable the models you want to use',
        ],
        pageId: 'integrations-api-keys',
      };
    }

    return null;
  }

  private async checkMonetizationSetup(): Promise<SetupRequirement | null> {
    const revenueStreams = await AsyncStorage.getItem('revenue_streams');
    const parsed = revenueStreams ? JSON.parse(revenueStreams) : [];

    if (parsed.length === 0) {
      return {
        id: 'monetization',
        feature: 'Monetization Tracking',
        required: ['At least one revenue stream'],
        missingItems: ['Revenue streams'],
        setupSteps: [
          'Navigate to Monetization page',
          'Click "Add Revenue Stream" button',
          'Select revenue type (ads, affiliate, sponsorship, etc.)',
          'Enter platform and stream details',
          'Set up tracking parameters',
          'Save the revenue stream',
        ],
        pageId: 'monetization',
      };
    }

    return null;
  }

  private async checkIoTSetup(): Promise<SetupRequirement | null> {
    const devices = await AsyncStorage.getItem('iot_devices');
    const parsed = devices ? JSON.parse(devices) : [];

    if (parsed.length === 0) {
      return {
        id: 'iot-control',
        feature: 'IoT Device Control',
        required: ['At least one IoT device'],
        missingItems: ['IoT devices'],
        setupSteps: [
          'Navigate to Tools > IoT Devices',
          'Click "Add Device" button',
          'Select device type (3D printer, smart light, etc.)',
          'Enter device name and IP address',
          'Add API key if required',
          'Test device connection',
          'Save device configuration',
        ],
        pageId: 'tools-iot-devices',
      };
    }

    return null;
  }

  private async checkAnalyticsSetup(): Promise<SetupRequirement | null> {
    const socialAccounts = await AsyncStorage.getItem('social_accounts');
    const parsed = socialAccounts ? JSON.parse(socialAccounts) : [];

    if (parsed.length === 0) {
      return {
        id: 'analytics',
        feature: 'Analytics & Insights',
        required: ['Connected social media accounts'],
        missingItems: ['Social media accounts'],
        setupSteps: [
          'Navigate to Integrations > Social Connect',
          'Connect your social media accounts',
          'Enable analytics permissions for each account',
          'Wait for initial data sync (may take a few minutes)',
          'View analytics on the Analytics page',
        ],
        pageId: 'integrations-social-connect',
      };
    }

    return null;
  }

  generateGuidanceResponse(requirement: SetupRequirement): string {
    let response = `Excellent question, sir. I'm detecting that ${requirement.feature} requires some setup. `;
    response += `Here's what you'll need:\n\n`;
    
    response += `**Missing Components:**\n`;
    requirement.missingItems.forEach((item, i) => {
      response += `${i + 1}. ${item}\n`;
    });

    response += `\n**Setup Instructions:**\n`;
    requirement.setupSteps.forEach((step, i) => {
      response += `${i + 1}. ${step}\n`;
    });

    response += `\nShall I navigate you to the ${requirement.feature} setup page now, sir? `;
    response += `I'm standing by to guide you through each step of the configuration process.`;

    return response;
  }

  async detectIntent(userMessage: string): Promise<{ feature: string; isSetupQuery: boolean } | null> {
    const message = userMessage.toLowerCase();

    const intentPatterns: Record<string, string[]> = {
      'social-media': ['post', 'social', 'instagram', 'tiktok', 'youtube', 'twitter', 'facebook', 'connect platform'],
      'content-generation': ['generate content', 'create post', 'write', 'ai content', 'generate image'],
      'monetization': ['revenue', 'money', 'monetize', 'earn', 'income', 'profit'],
      'iot-control': ['iot', 'device', '3d printer', 'smart home', 'control device', 'printer'],
      'analytics': ['analytics', 'stats', 'performance', 'metrics', 'insights', 'engagement'],
    };

    for (const [feature, patterns] of Object.entries(intentPatterns)) {
      for (const pattern of patterns) {
        if (message.includes(pattern)) {
          return {
            feature,
            isSetupQuery: true,
          };
        }
      }
    }

    return null;
  }

  generateCapabilityList(): string {
    return `I'm fully operational and ready to assist with:

**Content & Social Media**
• Generate content for any platform (Instagram, TikTok, YouTube, etc.)
• Schedule posts at optimal times
• Analyze trending topics
• Create personalized content based on your brand voice

**Monetization & Business**
• Track revenue across multiple streams
• Optimize ad campaigns
• Identify new revenue opportunities
• Analyze ROI and performance

**IoT & Automation**
• Control 3D printers remotely
• Manage smart home devices
• Automate workflows
• Execute custom device commands

**Analytics & Insights**
• Real-time performance tracking
• Audience analysis
• Competitor monitoring
• Growth recommendations

**Self-Improvement**
• Read and analyze the codebase
• Suggest system improvements
• Debug issues autonomously
• Optimize performance

Simply tell me what you need, sir, and I'll either execute it immediately or guide you through the necessary setup steps.`;
  }

  async getSTTSetupGuidance(): Promise<string> {
    return `Speech-to-Text is not currently configured, sir. Here's how to enable voice transcription:

**Option 1: OpenAI Whisper (Recommended)**
1. Get API key at: https://platform.openai.com/api-keys
2. Add to .env: EXPO_PUBLIC_STT_URL=https://api.openai.com/v1/audio/transcriptions
3. Restart the application

**Option 2: Google Cloud Speech-to-Text**
1. Enable API at: https://console.cloud.google.com/apis/library/speech.googleapis.com
2. Get API key from credentials page
3. Configure endpoint in .env file

**Option 3: Use Web Browser (Web Platform Only)**
On web browsers, I can use the built-in Web Speech API without any configuration.

**For Now:**
You can still use text input in the chat interface, sir. Voice transcription will work automatically once you configure an STT endpoint.

Would you like me to guide you through setting up any of these options?`;
  }

  async detectAPIKeys(): Promise<{
    configured: string[];
    missing: string[];
    hasAnyAI: boolean;
  }> {
    const keys = {
      groq: process.env.EXPO_PUBLIC_GROQ_API_KEY,
      openai: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
      gemini: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
      anthropic: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY,
      huggingface: process.env.EXPO_PUBLIC_HF_API_TOKEN,
      together: process.env.EXPO_PUBLIC_TOGETHER_API_KEY,
      deepseek: process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY,
    };

    const configured: string[] = [];
    const missing: string[] = [];

    Object.entries(keys).forEach(([name, key]) => {
      if (key && key.trim() !== '' && !key.includes('your_') && !key.includes('placeholder')) {
        configured.push(name);
      } else {
        missing.push(name);
      }
    });

    return {
      configured,
      missing,
      hasAnyAI: configured.length > 0,
    };
  }

  async generateAPIKeyGuidance(service: string): Promise<string> {
    const guides: Record<string, string> = {
      groq: `**Groq (Free & Fast - Recommended)**
Get your free API key:
1. Visit: https://console.groq.com
2. Sign up for a free account
3. Navigate to API Keys section
4. Create new API key
5. Add to .env: EXPO_PUBLIC_GROQ_API_KEY=your_key_here

Groq offers fast, free AI inference with generous limits, sir.`,
      
      openai: `**OpenAI (Premium)**
Get your API key:
1. Visit: https://platform.openai.com/api-keys
2. Sign in or create account
3. Click "Create new secret key"
4. Copy the key immediately (it won't be shown again)
5. Add to .env: EXPO_PUBLIC_OPENAI_API_KEY=your_key_here

Note: OpenAI is a paid service, sir. Credits required.`,
      
      gemini: `**Google Gemini (Free tier available)**
Get your API key:
1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the generated key
5. Add to .env: EXPO_PUBLIC_GEMINI_API_KEY=your_key_here

Gemini offers a generous free tier, sir.`,
      
      huggingface: `**HuggingFace (Free)**
Get your API token:
1. Visit: https://huggingface.co/settings/tokens
2. Sign in or create account
3. Click "New token"
4. Select "read" permission
5. Add to .env: EXPO_PUBLIC_HF_API_TOKEN=your_token_here

HuggingFace provides free access to many open-source models, sir.`,
    };

    return guides[service] || `API key setup guidance not available for ${service}, sir. Please consult the service documentation.`;
  }

  /**
   * Provides guidance or suggestions based on the user's current context.
   * @param context A string describing the current user activity or screen.
   * @returns A promise that resolves to a helpful suggestion string.
   */
  async getSuggestion(context: string): Promise<string> {
    const prompt = `User is currently in this context: "${context}". Provide a brief, helpful tip or suggestion.`;

    try {
      // Use the unified query function for guidance
      const result = await queryJarvis(prompt, GUIDANCE_MODEL_PROVIDER);

      if (result.success && result.content) {
        return result.content;
      } else {
        console.error('[JarvisGuidanceService] Failed to get suggestion:', result.error);
        return 'Could not retrieve a suggestion at this time.';
      }
    } catch (error) {
      console.error('[JarvisGuidanceService] Error:', error);
      return 'An error occurred while fetching guidance.';
    }
  }

  /**
   * Analyzes text for sentiment.
   * @param text The text to analyze.
   * @returns A promise that resolves to the sentiment (e.g., "positive", "negative").
   */
  async analyzeSentiment(text: string): Promise<string> {
    const prompt = `Analyze the sentiment of the following text and return only one word (Positive, Negative, or Neutral): "${text}"`;
    const result = await queryJarvis(prompt, GUIDANCE_MODEL_PROVIDER);
    return result.success ? result.content || 'Neutral' : 'Neutral';
  }
}

export default JarvisGuidanceService.getInstance();
