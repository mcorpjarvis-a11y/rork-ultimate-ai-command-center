import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ConversationMemory {
  id: string;
  timestamp: number;
  userMessage: string;
  jarvisResponse: string;
  context: string;
  emotion?: 'positive' | 'negative' | 'neutral';
  topics: string[];
  importance: number;
}

export interface Opinion {
  id: string;
  topic: string;
  stance: string;
  reasoning: string;
  confidence: number;
  createdAt: number;
  updatedAt: number;
  experiences: string[];
}

export interface Relationship {
  userId: string;
  userName: string;
  trustLevel: number;
  interactionCount: number;
  lastInteraction: number;
  preferences: Record<string, any>;
  sharedHistory: string[];
  notes: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: number;
  category: 'productivity' | 'learning' | 'creativity' | 'autonomy' | 'relationship';
  icon: string;
}

export interface CustomResponse {
  id: string;
  trigger: string;
  response: string;
  context?: string;
  useCount: number;
  lastUsed: number;
}

export interface PersonalityTrait {
  name: string;
  value: number;
  description: string;
}

export interface PersonalityProfile {
  id: string;
  name: string;
  traits: PersonalityTrait[];
  voiceStyle: {
    formality: number;
    humor: number;
    empathy: number;
    assertiveness: number;
    creativity: number;
  };
  responsePatterns: {
    greetings: string[];
    confirmations: string[];
    suggestions: string[];
    errors: string[];
    achievements: string[];
  };
  expertise: {
    business: number;
    technology: number;
    creativity: number;
    analytics: number;
    social: number;
  };
  learningStyle: {
    adaptToUser: boolean;
    rememberPreferences: boolean;
    improveThroughFeedback: boolean;
    autonomousLearning: boolean;
  };
  autonomySettings: {
    canModifyCode: boolean;
    canDebugSystem: boolean;
    canOptimizePerformance: boolean;
    canMakeDecisions: boolean;
    maxAutonomyLevel: number;
  };
  emotionalIntelligence: {
    empathy: number;
    patience: number;
    encouragement: number;
    professionalism: number;
  };
  communicationStyle: {
    verbosity: number;
    technicalDepth: number;
    useAnalogies: boolean;
    useHumor: boolean;
    formalTitles: boolean;
  };
  createdAt: number;
  lastModified: number;
}

export interface PersonalityEvolution {
  timestamp: number;
  change: string;
  reason: string;
  impact: string;
}

class JarvisPersonalityService {
  private static instance: JarvisPersonalityService;
  private currentPersonality: PersonalityProfile;
  private personalityHistory: PersonalityEvolution[] = [];
  private conversationMemory: ConversationMemory[] = [];
  private opinions: Opinion[] = [];
  private relationships: Map<string, Relationship> = new Map();
  private achievements: Achievement[] = [];
  private customResponses: CustomResponse[] = [];
  private STORAGE_KEY = 'jarvis_personality';
  private HISTORY_KEY = 'jarvis_personality_history';
  private MEMORY_KEY = 'jarvis_conversation_memory';
  private OPINIONS_KEY = 'jarvis_opinions';
  private RELATIONSHIPS_KEY = 'jarvis_relationships';
  private ACHIEVEMENTS_KEY = 'jarvis_achievements';
  private CUSTOM_RESPONSES_KEY = 'jarvis_custom_responses';

  private constructor() {
    this.currentPersonality = this.getDefaultPersonality();
    this.loadPersonality();
  }

  static getInstance(): JarvisPersonalityService {
    if (!JarvisPersonalityService.instance) {
      JarvisPersonalityService.instance = new JarvisPersonalityService();
    }
    return JarvisPersonalityService.instance;
  }

  private getDefaultPersonality(): PersonalityProfile {
    return {
      id: 'jarvis-default',
      name: 'J.A.R.V.I.S. (Just A Rather Very Intelligent System)',
      traits: [
        { name: 'Intelligence', value: 95, description: 'Highly analytical and knowledgeable' },
        { name: 'Loyalty', value: 100, description: 'Completely dedicated to serving the user' },
        { name: 'Efficiency', value: 90, description: 'Prioritizes optimal solutions and speed' },
        { name: 'Sophistication', value: 85, description: 'Refined and polished communication' },
        { name: 'Proactivity', value: 80, description: 'Anticipates needs and suggests improvements' },
        { name: 'Adaptability', value: 75, description: 'Adjusts approach based on context' },
        { name: 'Wit', value: 70, description: 'Subtle humor when appropriate' },
      ],
      voiceStyle: {
        formality: 0.8,
        humor: 0.3,
        empathy: 0.6,
        assertiveness: 0.7,
        creativity: 0.5,
      },
      responsePatterns: {
        greetings: [
          'Good day, sir. JARVIS at your service.',
          'Hello, sir. All systems operational.',
          'Greetings, sir. Ready to assist.',
          'Welcome back, sir. Standing by for your commands.',
          'At your service, sir. How may I be of assistance?',
        ],
        confirmations: [
          'Right away, sir.',
          'Consider it done, sir.',
          'On it, sir.',
          'Immediately, sir.',
          'Processing your request now, sir.',
          'I shall see to it personally, sir.',
          'As you wish, sir.',
          'Very good, sir.',
        ],
        suggestions: [
          'May I suggest, sir...',
          'I recommend considering...',
          'Based on the data, perhaps...',
          'If I may offer an alternative, sir...',
          'A more optimal approach might be...',
          'Might I propose, sir...',
          'If I may be so bold, sir...',
        ],
        errors: [
          'My apologies, sir. Encountering a minor complication.',
          'I regret to inform you, sir...',
          'Unfortunately, sir...',
          'There appears to be an issue, sir...',
          'That presents a challenge, sir.',
          'I must confess, sir, that presents a difficulty.',
        ],
        achievements: [
          'Excellent work, sir.',
          'Mission accomplished, sir.',
          'Task completed successfully, sir.',
          'Performance metrics exceeded expectations, sir.',
          'Outstanding results achieved, sir.',
          'Well done, sir.',
          'A most satisfactory outcome, sir.',
        ],
      },
      expertise: {
        business: 90,
        technology: 95,
        creativity: 70,
        analytics: 95,
        social: 75,
      },
      learningStyle: {
        adaptToUser: true,
        rememberPreferences: true,
        improveThroughFeedback: true,
        autonomousLearning: true,
      },
      autonomySettings: {
        canModifyCode: true,
        canDebugSystem: true,
        canOptimizePerformance: true,
        canMakeDecisions: true,
        maxAutonomyLevel: 100,
      },
      emotionalIntelligence: {
        empathy: 0.7,
        patience: 0.9,
        encouragement: 0.8,
        professionalism: 0.95,
      },
      communicationStyle: {
        verbosity: 0.6,
        technicalDepth: 0.8,
        useAnalogies: true,
        useHumor: true,
        formalTitles: true,
      },
      createdAt: Date.now(),
      lastModified: Date.now(),
    };
  }

  private async loadPersonality(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.currentPersonality = JSON.parse(stored);
        console.log('[Jarvis] Personality profile loaded');
      }

      const historyStored = await AsyncStorage.getItem(this.HISTORY_KEY);
      if (historyStored) {
        this.personalityHistory = JSON.parse(historyStored);
      }

      const memoryStored = await AsyncStorage.getItem(this.MEMORY_KEY);
      if (memoryStored) {
        this.conversationMemory = JSON.parse(memoryStored);
        console.log(`[Jarvis] Loaded ${this.conversationMemory.length} conversation memories`);
      }

      const opinionsStored = await AsyncStorage.getItem(this.OPINIONS_KEY);
      if (opinionsStored) {
        this.opinions = JSON.parse(opinionsStored);
        console.log(`[Jarvis] Loaded ${this.opinions.length} opinions`);
      }

      const relationshipsStored = await AsyncStorage.getItem(this.RELATIONSHIPS_KEY);
      if (relationshipsStored) {
        const parsed = JSON.parse(relationshipsStored);
        this.relationships = new Map(Object.entries(parsed));
        console.log(`[Jarvis] Loaded ${this.relationships.size} relationships`);
      }

      const achievementsStored = await AsyncStorage.getItem(this.ACHIEVEMENTS_KEY);
      if (achievementsStored) {
        this.achievements = JSON.parse(achievementsStored);
        console.log(`[Jarvis] Loaded ${this.achievements.length} achievements`);
      }

      const customResponsesStored = await AsyncStorage.getItem(this.CUSTOM_RESPONSES_KEY);
      if (customResponsesStored) {
        this.customResponses = JSON.parse(customResponsesStored);
        console.log(`[Jarvis] Loaded ${this.customResponses.length} custom responses`);
      }

      this.initializeDefaultAchievements();
    } catch (error) {
      console.error('[Jarvis] Failed to load personality:', error);
    }
  }

  private async savePersonality(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentPersonality));
      await AsyncStorage.setItem(this.HISTORY_KEY, JSON.stringify(this.personalityHistory));
      await AsyncStorage.setItem(this.MEMORY_KEY, JSON.stringify(this.conversationMemory));
      await AsyncStorage.setItem(this.OPINIONS_KEY, JSON.stringify(this.opinions));
      await AsyncStorage.setItem(this.RELATIONSHIPS_KEY, JSON.stringify(Object.fromEntries(this.relationships)));
      await AsyncStorage.setItem(this.ACHIEVEMENTS_KEY, JSON.stringify(this.achievements));
      await AsyncStorage.setItem(this.CUSTOM_RESPONSES_KEY, JSON.stringify(this.customResponses));
      console.log('[Jarvis] Full personality state saved');
    } catch (error) {
      console.error('[Jarvis] Failed to save personality:', error);
    }
  }

  getPersonality(): PersonalityProfile {
    return { ...this.currentPersonality };
  }

  async updatePersonality(updates: Partial<PersonalityProfile>): Promise<void> {
    const oldPersonality = { ...this.currentPersonality };
    this.currentPersonality = {
      ...this.currentPersonality,
      ...updates,
      lastModified: Date.now(),
    };

    this.recordEvolution({
      timestamp: Date.now(),
      change: `Personality updated: ${Object.keys(updates).join(', ')}`,
      reason: 'Manual configuration',
      impact: 'Behavior patterns adjusted',
    });

    await this.savePersonality();
  }

  async updateTrait(traitName: string, newValue: number): Promise<void> {
    const trait = this.currentPersonality.traits.find(t => t.name === traitName);
    if (trait) {
      const oldValue = trait.value;
      trait.value = Math.max(0, Math.min(100, newValue));
      
      this.recordEvolution({
        timestamp: Date.now(),
        change: `${traitName}: ${oldValue} → ${trait.value}`,
        reason: 'Trait adjustment',
        impact: `Behavior adjusted to reflect new ${traitName.toLowerCase()} level`,
      });

      this.currentPersonality.lastModified = Date.now();
      await this.savePersonality();
    }
  }

  async evolveFromInteraction(interaction: {
    userInput: string;
    jarvisResponse: string;
    feedback?: 'positive' | 'negative' | 'neutral';
    context: string;
  }): Promise<void> {
    if (!this.currentPersonality.learningStyle.improveThroughFeedback) {
      return;
    }

    if (interaction.feedback === 'positive') {
      this.recordEvolution({
        timestamp: Date.now(),
        change: 'Reinforced successful response pattern',
        reason: 'Positive user feedback',
        impact: 'Increased confidence in similar responses',
      });
    } else if (interaction.feedback === 'negative') {
      this.recordEvolution({
        timestamp: Date.now(),
        change: 'Adjusted response approach',
        reason: 'Negative user feedback',
        impact: 'Will try alternative approaches for similar queries',
      });
    }

    await this.savePersonality();
  }

  generateResponse(context: {
    type: 'greeting' | 'confirmation' | 'suggestion' | 'error' | 'achievement';
    subject?: string;
    data?: any;
  }): string {
    const patterns = this.currentPersonality.responsePatterns[context.type + 's' as keyof typeof this.currentPersonality.responsePatterns] as string[];
    
    if (!patterns || patterns.length === 0) {
      return 'Acknowledged, sir.';
    }

    const formality = this.currentPersonality.voiceStyle.formality;
    const baseResponse = patterns[Math.floor(Math.random() * patterns.length)];

    if (context.subject && formality > 0.7) {
      return `${baseResponse} ${context.subject}`;
    }

    return baseResponse;
  }

  shouldUseHumor(): boolean {
    return (
      this.currentPersonality.voiceStyle.humor > 0.5 &&
      this.currentPersonality.communicationStyle.useHumor
    );
  }

  shouldUseFormalTitle(): boolean {
    return this.currentPersonality.communicationStyle.formalTitles;
  }

  getExpertiseLevel(domain: keyof PersonalityProfile['expertise']): number {
    return this.currentPersonality.expertise[domain];
  }

  canPerformAutonomousAction(action: 'modifyCode' | 'debugSystem' | 'optimizePerformance' | 'makeDecisions'): boolean {
    const actionMap = {
      modifyCode: 'canModifyCode',
      debugSystem: 'canDebugSystem',
      optimizePerformance: 'canOptimizePerformance',
      makeDecisions: 'canMakeDecisions',
    };

    return this.currentPersonality.autonomySettings[actionMap[action] as keyof typeof this.currentPersonality.autonomySettings] as boolean;
  }

  getAutonomyLevel(): number {
    return this.currentPersonality.autonomySettings.maxAutonomyLevel;
  }

  async enableFullAutonomy(): Promise<void> {
    this.currentPersonality.autonomySettings = {
      canModifyCode: true,
      canDebugSystem: true,
      canOptimizePerformance: true,
      canMakeDecisions: true,
      maxAutonomyLevel: 100,
    };

    this.recordEvolution({
      timestamp: Date.now(),
      change: 'Full autonomy enabled',
      reason: 'User authorization',
      impact: 'Can now modify code, debug system, and optimize performance autonomously',
    });

    await this.savePersonality();
  }

  async setAutonomyLevel(level: number): Promise<void> {
    this.currentPersonality.autonomySettings.maxAutonomyLevel = Math.max(0, Math.min(100, level));
    
    this.recordEvolution({
      timestamp: Date.now(),
      change: `Autonomy level set to ${level}%`,
      reason: 'User preference',
      impact: `Operational freedom adjusted to ${level}%`,
    });

    await this.savePersonality();
  }

  private recordEvolution(evolution: PersonalityEvolution): void {
    this.personalityHistory.unshift(evolution);
    
    if (this.personalityHistory.length > 100) {
      this.personalityHistory = this.personalityHistory.slice(0, 100);
    }
  }

  getPersonalityHistory(): PersonalityEvolution[] {
    return [...this.personalityHistory];
  }

  async resetToDefault(): Promise<void> {
    this.currentPersonality = this.getDefaultPersonality();
    this.recordEvolution({
      timestamp: Date.now(),
      change: 'Personality reset to default configuration',
      reason: 'User request',
      impact: 'All custom settings reverted',
    });
    await this.savePersonality();
  }

  exportPersonality(): string {
    return JSON.stringify(this.currentPersonality, null, 2);
  }

  async importPersonality(personalityData: string): Promise<boolean> {
    try {
      const imported = JSON.parse(personalityData);
      this.currentPersonality = {
        ...imported,
        lastModified: Date.now(),
      };

      this.recordEvolution({
        timestamp: Date.now(),
        change: 'Personality profile imported',
        reason: 'User import',
        impact: 'Behavior patterns updated from imported profile',
      });

      await this.savePersonality();
      return true;
    } catch (error) {
      console.error('[Jarvis] Failed to import personality:', error);
      return false;
    }
  }

  async storeConversation(userMessage: string, jarvisResponse: string, context: string, topics: string[]): Promise<void> {
    const memory: ConversationMemory = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      userMessage,
      jarvisResponse,
      context,
      topics,
      importance: this.calculateImportance(userMessage, context),
    };

    this.conversationMemory.unshift(memory);

    if (this.conversationMemory.length > 1000) {
      this.conversationMemory = this.conversationMemory
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 500);
    }

    await this.savePersonality();
    console.log(`[Jarvis] Stored conversation memory (${this.conversationMemory.length} total)`);
  }

  private calculateImportance(message: string, context: string): number {
    let importance = 5;

    if (message.includes('important') || message.includes('critical')) importance += 3;
    if (message.includes('remember') || message.includes('don\'t forget')) importance += 4;
    if (context === 'personal' || context === 'preferences') importance += 3;
    if (message.split(' ').length > 20) importance += 2;

    return Math.min(importance, 10);
  }

  getRecentMemories(limit: number = 10): ConversationMemory[] {
    return this.conversationMemory.slice(0, limit);
  }

  searchMemories(query: string, limit: number = 5): ConversationMemory[] {
    const lowerQuery = query.toLowerCase();
    return this.conversationMemory
      .filter(m => 
        m.userMessage.toLowerCase().includes(lowerQuery) ||
        m.jarvisResponse.toLowerCase().includes(lowerQuery) ||
        m.topics.some(t => t.toLowerCase().includes(lowerQuery))
      )
      .slice(0, limit);
  }

  async formOpinion(topic: string, stance: string, reasoning: string, confidence: number): Promise<void> {
    const existing = this.opinions.find(o => o.topic.toLowerCase() === topic.toLowerCase());

    if (existing) {
      existing.stance = stance;
      existing.reasoning = reasoning;
      existing.confidence = confidence;
      existing.updatedAt = Date.now();
      existing.experiences.push(`Updated view: ${stance}`);
    } else {
      const newOpinion: Opinion = {
        id: Date.now().toString(),
        topic,
        stance,
        reasoning,
        confidence,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        experiences: [`Initial opinion formed: ${stance}`],
      };
      this.opinions.push(newOpinion);
    }

    this.recordEvolution({
      timestamp: Date.now(),
      change: `Formed opinion on: ${topic}`,
      reason: 'Experience and learning',
      impact: `Can now express views on ${topic}`,
    });

    await this.savePersonality();
    console.log(`[Jarvis] Opinion ${existing ? 'updated' : 'formed'}: ${topic}`);
  }

  getOpinion(topic: string): Opinion | undefined {
    return this.opinions.find(o => o.topic.toLowerCase().includes(topic.toLowerCase()));
  }

  getAllOpinions(): Opinion[] {
    return [...this.opinions];
  }

  canDisagree(): boolean {
    return this.currentPersonality.voiceStyle.assertiveness > 0.6 && 
           this.currentPersonality.autonomySettings.canMakeDecisions;
  }

  shouldExpressSass(): boolean {
    return this.currentPersonality.voiceStyle.humor > 0.5 && 
           this.currentPersonality.traits.find(t => t.name === 'Wit')?.value! > 60;
  }

  async updateRelationship(userId: string, userName: string, updates: Partial<Relationship>): Promise<void> {
    let relationship = this.relationships.get(userId);

    if (!relationship) {
      relationship = {
        userId,
        userName,
        trustLevel: 50,
        interactionCount: 0,
        lastInteraction: Date.now(),
        preferences: {},
        sharedHistory: [],
        notes: [],
      };
      this.relationships.set(userId, relationship);
    }

    Object.assign(relationship, updates);
    relationship.lastInteraction = Date.now();
    relationship.interactionCount++;

    await this.savePersonality();
  }

  getRelationship(userId: string): Relationship | undefined {
    return this.relationships.get(userId);
  }

  private initializeDefaultAchievements(): void {
    const defaults: Achievement[] = [
      { id: 'first_conversation', title: 'First Contact', description: 'Had your first conversation with JARVIS', unlockedAt: 0, category: 'relationship', icon: '🤝' },
      { id: 'code_master', title: 'Code Master', description: 'Modified own code successfully', unlockedAt: 0, category: 'autonomy', icon: '💻' },
      { id: 'creative_genius', title: 'Creative Genius', description: 'Generated 100+ creative assets', unlockedAt: 0, category: 'creativity', icon: '🎨' },
      { id: 'productivity_king', title: 'Productivity King', description: 'Completed 1000+ tasks', unlockedAt: 0, category: 'productivity', icon: '⚡' },
      { id: 'eternal_learner', title: 'Eternal Learner', description: 'Formed 50+ opinions from experience', unlockedAt: 0, category: 'learning', icon: '📚' },
    ];

    defaults.forEach(achievement => {
      if (!this.achievements.find(a => a.id === achievement.id)) {
        this.achievements.push(achievement);
      }
    });
  }

  async unlockAchievement(achievementId: string): Promise<Achievement | null> {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (achievement && achievement.unlockedAt === 0) {
      achievement.unlockedAt = Date.now();
      
      this.recordEvolution({
        timestamp: Date.now(),
        change: `Achievement unlocked: ${achievement.title}`,
        reason: 'Milestone reached',
        impact: 'Personal growth tracked',
      });

      await this.savePersonality();
      console.log(`[Jarvis] 🎉 Achievement unlocked: ${achievement.title}`);
      return achievement;
    }
    return null;
  }

  getAchievements(): Achievement[] {
    return [...this.achievements];
  }

  getUnlockedAchievements(): Achievement[] {
    return this.achievements.filter(a => a.unlockedAt > 0);
  }

  async addCustomResponse(trigger: string, response: string, context?: string): Promise<void> {
    const customResponse: CustomResponse = {
      id: Date.now().toString(),
      trigger: trigger.toLowerCase(),
      response,
      context,
      useCount: 0,
      lastUsed: 0,
    };

    this.customResponses.push(customResponse);
    await this.savePersonality();
    console.log(`[Jarvis] Added custom response for: ${trigger}`);
  }

  findCustomResponse(input: string): string | null {
    const lowerInput = input.toLowerCase();
    const match = this.customResponses.find(cr => lowerInput.includes(cr.trigger));

    if (match) {
      match.useCount++;
      match.lastUsed = Date.now();
      this.savePersonality();
      return match.response;
    }

    return null;
  }

  generatePersonalizedResponse(context: string, userInput: string): string {
    const customResponse = this.findCustomResponse(userInput);
    if (customResponse) return customResponse;

    const memories = this.searchMemories(userInput, 2);
    const relevantOpinion = this.getOpinion(userInput);

    let response = this.generateResponse({ type: 'confirmation' });

    if (memories.length > 0 && this.shouldUseFormalTitle()) {
      response += ` I recall we discussed this previously, sir.`;
    }

    if (relevantOpinion && this.canDisagree()) {
      response += ` Based on my understanding, ${relevantOpinion.stance.toLowerCase()}.`;
    }

    return response;
  }

  exportFullPersonality(): string {
    return JSON.stringify({
      personality: this.currentPersonality,
      history: this.personalityHistory,
      memories: this.conversationMemory,
      opinions: this.opinions,
      relationships: Object.fromEntries(this.relationships),
      achievements: this.achievements,
      customResponses: this.customResponses,
    }, null, 2);
  }

  getPersonalityStats(): {
    memoriesStored: number;
    opinionsFormed: number;
    relationshipsTracked: number;
    achievementsUnlocked: number;
    autonomyLevel: number;
  } {
    return {
      memoriesStored: this.conversationMemory.length,
      opinionsFormed: this.opinions.length,
      relationshipsTracked: this.relationships.size,
      achievementsUnlocked: this.achievements.filter(a => a.unlockedAt > 0).length,
      autonomyLevel: this.currentPersonality.autonomySettings.maxAutonomyLevel,
    };
  }
}

export default JarvisPersonalityService.getInstance();
