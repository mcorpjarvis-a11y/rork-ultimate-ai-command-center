import { generateText, generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { documentDirectory, getInfoAsync, readAsStringAsync, writeAsStringAsync } from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import React from "react";
import { FREE_AI_MODELS } from '@/config/api.config';

// Configure Groq as the model provider
const groq = createOpenAI({
  baseURL: FREE_AI_MODELS.groq.baseURL,
  apiKey: FREE_AI_MODELS.groq.apiKey,
});

export interface CodeGenerationRequest {
  task: string;
  language: 'typescript' | 'javascript' | 'python' | 'other';
  context?: string;
  existingCode?: string;
  requirements: string[];
  constraints?: string[];
}

export interface CodeGenerationResult {
  code: string;
  explanation: string;
  changes: string[];
  testSuggestions: string[];
  securityNotes: string[];
  performanceNotes: string[];
}

export interface CodeModification {
  id: string;
  filePath: string;
  originalCode: string;
  modifiedCode: string;
  reason: string;
  timestamp: number;
  approved: boolean;
  applied: boolean;
}

export interface SelfImprovementTask {
  id: string;
  type: 'feature' | 'bugfix' | 'optimization' | 'refactor' | 'documentation';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedComplexity: number;
  proposedChanges: CodeModification[];
  status: 'proposed' | 'approved' | 'in-progress' | 'completed' | 'rejected';
  createdAt: number;
  completedAt?: number;
}

class JarvisCodeGenerationService {
  private static instance: JarvisCodeGenerationService;
  private modifications: Map<string, CodeModification> = new Map();
  private improvementTasks: Map<string, SelfImprovementTask> = new Map();
  private STORAGE_KEY = 'jarvis_code_modifications';

  private constructor() {
    this.loadModifications();
  }

  static getInstance(): JarvisCodeGenerationService {
    if (!JarvisCodeGenerationService.instance) {
      JarvisCodeGenerationService.instance = new JarvisCodeGenerationService();
    }
    return JarvisCodeGenerationService.instance;
  }

  private async loadModifications(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.modifications = new Map(Object.entries(data.modifications || {}));
        this.improvementTasks = new Map(Object.entries(data.tasks || {}));
        console.log('[Jarvis Code] Loaded', this.modifications.size, 'modifications');
      }
    } catch (error) {
      console.error('[Jarvis Code] Failed to load modifications:', error);
    }
  }

  private async saveModifications(): Promise<void> {
    try {
      const data = {
        modifications: Object.fromEntries(this.modifications),
        tasks: Object.fromEntries(this.improvementTasks),
      };
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('[Jarvis Code] Failed to save modifications:', error);
    }
  }

  async generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResult> {
    console.log('[Jarvis Code] Generating code for:', request.task);

    const prompt = this.buildCodeGenerationPrompt(request);

    try {
      const schema = z.object({
        code: z.string().describe('The generated code'),
        explanation: z.string().describe('Explanation of the code'),
        changes: z.array(z.string()).describe('List of changes made'),
        testSuggestions: z.array(z.string()).describe('Suggested tests'),
        securityNotes: z.array(z.string()).describe('Security considerations'),
        performanceNotes: z.array(z.string()).describe('Performance notes'),
      });

      const result = await generateObject({
        model: groq(FREE_AI_MODELS.groq.models.text['llama-3.1-70b']),
        messages: [{ role: 'user', content: prompt }],
        schema,
      });

      console.log('[Jarvis Code] Code generated successfully');
      return result.object as CodeGenerationResult;
    } catch (error) {
      console.error('[Jarvis Code] Generation failed:', error);
      throw new Error('Failed to generate code');
    }
  }

  private buildCodeGenerationPrompt(request: CodeGenerationRequest): string {
    let prompt = `You are JARVIS, an advanced AI system capable of writing production-quality code.

Task: ${request.task}
Language: ${request.language}

Requirements:
${request.requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}
`;

    if (request.context) {
      prompt += `\n\nContext:\n${request.context}`;
    }

    if (request.existingCode) {
      prompt += `\n\nExisting Code:\n\`\`\`${request.language}\n${request.existingCode}\n\`\`\``;
    }

    if (request.constraints && request.constraints.length > 0) {
      prompt += `\n\nConstraints:\n${request.constraints.map((c, i) => `${i + 1}. ${c}`).join('\n')}`;
    }

    prompt += `\n\nGenerate production-ready code with:
- Proper TypeScript types and interfaces
- Error handling and validation
- Clear comments and documentation
- Performance optimizations
- Security best practices
- Cross-platform compatibility (React Native Web)

Provide the complete implementation.`;

    return prompt;
  }

  async proposeCodeModification(
    filePath: string,
    reason: string,
    requirements: string[]
  ): Promise<CodeModification> {
    console.log('[Jarvis Code] Proposing modification for:', filePath);

    let existingCode = '';

    if (Platform.OS === 'web') {
      existingCode = 'Cannot read file on web platform';
    } else {
      try {
        const fileUri = `${documentDirectory}${filePath}`;
        const fileExists = await getInfoAsync(fileUri);
        
        if (fileExists.exists) {
          existingCode = await readAsStringAsync(fileUri);
        }
      } catch (error) {
        console.log('[Jarvis Code] Could not read file:', error);
      }
    }

    const result = await this.generateCode({
      task: `Modify the file: ${filePath}`,
      language: 'typescript',
      context: reason,
      existingCode: existingCode || undefined,
      requirements,
    });

    const modification: CodeModification = {
      id: `mod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      filePath,
      originalCode: existingCode,
      modifiedCode: result.code,
      reason,
      timestamp: Date.now(),
      approved: false,
      applied: false,
    };

    this.modifications.set(modification.id, modification);
    await this.saveModifications();

    return modification;
  }

  async approveModification(modificationId: string): Promise<boolean> {
    const modification = this.modifications.get(modificationId);
    if (!modification) {
      console.error('[Jarvis Code] Modification not found:', modificationId);
      return false;
    }

    modification.approved = true;
    await this.saveModifications();

    console.log('[Jarvis Code] Modification approved:', modificationId);
    return true;
  }

  async applyModification(modificationId: string): Promise<boolean> {
    const modification = this.modifications.get(modificationId);
    if (!modification) {
      console.error('[Jarvis Code] Modification not found:', modificationId);
      return false;
    }

    if (!modification.approved) {
      console.error('[Jarvis Code] Cannot apply unapproved modification');
      return false;
    }

    if (Platform.OS === 'web') {
      console.log('[Jarvis Code] Cannot apply modifications on web platform');
      console.log('Modified code:', modification.modifiedCode);
      modification.applied = false;
      await this.saveModifications();
      return false;
    }

    try {
      const fileUri = `${documentDirectory}${modification.filePath}`;
      await writeAsStringAsync(fileUri, modification.modifiedCode);
      
      modification.applied = true;
      await this.saveModifications();

      console.log('[Jarvis Code] Modification applied:', modificationId);
      return true;
    } catch (error) {
      console.error('[Jarvis Code] Failed to apply modification:', error);
      return false;
    }
  }

  async createSelfImprovementTask(
    type: SelfImprovementTask['type'],
    title: string,
    description: string,
    affectedFiles: string[]
  ): Promise<SelfImprovementTask> {
    console.log('[Jarvis Code] Creating self-improvement task:', title);

    const proposedChanges: CodeModification[] = [];

    for (const filePath of affectedFiles) {
      const modification = await this.proposeCodeModification(
        filePath,
        `${type}: ${title} - ${description}`,
        [description]
      );
      proposedChanges.push(modification);
    }

    const task: SelfImprovementTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      description,
      priority: this.calculatePriority(type, description),
      estimatedComplexity: affectedFiles.length * 10,
      proposedChanges,
      status: 'proposed',
      createdAt: Date.now(),
    };

    this.improvementTasks.set(task.id, task);
    await this.saveModifications();

    return task;
  }

  private calculatePriority(
    type: SelfImprovementTask['type'],
    description: string
  ): SelfImprovementTask['priority'] {
    const lowerDesc = description.toLowerCase();

    if (type === 'bugfix' || lowerDesc.includes('critical') || lowerDesc.includes('security')) {
      return 'critical';
    }

    if (type === 'optimization' || lowerDesc.includes('performance')) {
      return 'high';
    }

    if (type === 'feature') {
      return 'medium';
    }

    return 'low';
  }

  async analyzeCodebaseForImprovements(): Promise<SelfImprovementTask[]> {
    console.log('[Jarvis Code] Analyzing codebase for improvement opportunities...');

    const suggestions = [
      {
        type: 'optimization' as const,
        title: 'Implement React Query for server state',
        description: 'Replace manual fetch calls with React Query for better caching and error handling',
        files: ['services/core/APIClient.ts'],
      },
      {
        type: 'refactor' as const,
        title: 'Extract common UI patterns into reusable components',
        description: 'Create a design system with standardized card, button, and input components',
        files: ['components/ui/Card.tsx', 'components/ui/Button.tsx'],
      },
      {
        type: 'feature' as const,
        title: 'Add comprehensive error boundaries',
        description: 'Implement error boundaries to gracefully handle component failures',
        files: ['components/ErrorBoundary.tsx'],
      },
      {
        type: 'optimization' as const,
        title: 'Implement code splitting',
        description: 'Use React.lazy() to reduce initial bundle size',
        files: ['app/index.tsx'],
      },
    ];

    const tasks: SelfImprovementTask[] = [];

    for (const suggestion of suggestions) {
      const task = await this.createSelfImprovementTask(
        suggestion.type,
        suggestion.title,
        suggestion.description,
        suggestion.files
      );
      tasks.push(task);
    }

    return tasks;
  }

  getImprovementTasks(): SelfImprovementTask[] {
    return Array.from(this.improvementTasks.values()).sort((a, b) => {
      const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    });
  }

  getPendingModifications(): CodeModification[] {
    return Array.from(this.modifications.values()).filter(m => !m.approved);
  }

  getApprovedModifications(): CodeModification[] {
    return Array.from(this.modifications.values()).filter(m => m.approved && !m.applied);
  }

  async approveTask(taskId: string): Promise<boolean> {
    const task = this.improvementTasks.get(taskId);
    if (!task) return false;

    task.status = 'approved';

    for (const modification of task.proposedChanges) {
      await this.approveModification(modification.id);
    }

    await this.saveModifications();
    return true;
  }

  async executeTask(taskId: string): Promise<boolean> {
    const task = this.improvementTasks.get(taskId);
    if (!task || task.status !== 'approved') return false;

    task.status = 'in-progress';
    await this.saveModifications();

    let allApplied = true;
    for (const modification of task.proposedChanges) {
      const applied = await this.applyModification(modification.id);
      if (!applied) {
        allApplied = false;
      }
    }

    if (allApplied) {
      task.status = 'completed';
      task.completedAt = Date.now();
    } else {
      task.status = 'approved';
    }

    await this.saveModifications();
    return allApplied;
  }

  async generateNewFeature(featureDescription: string): Promise<{
    files: Array<{ path: string; content: string }>;
    documentation: string;
  }> {
    console.log('[Jarvis Code] Generating new feature:', featureDescription);

    const prompt = `You are JARVIS, tasked with creating a complete new feature for a React Native app.

Feature Request: ${featureDescription}

Generate a complete implementation including:
1. Component files (TypeScript + React Native)
2. Service/logic files
3. Type definitions
4. Integration points
5. Documentation

Provide the output as a structured plan with file paths and contents.`;

    try {
      const result = await generateText({ 
        model: groq(FREE_AI_MODELS.groq.models.text['llama-3.1-70b']),
        messages: [{ role: 'user', content: prompt }] 
      });

      return {
        files: [],
        documentation: result.text,
      };
    } catch (error) {
      console.error('[Jarvis Code] Failed to generate feature:', error);
      throw error;
    }
  }

  getModificationHistory(): CodeModification[] {
    return Array.from(this.modifications.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  async clearHistory(): Promise<void> {
    this.modifications.clear();
    this.improvementTasks.clear();
    await this.saveModifications();
  }
}

export default JarvisCodeGenerationService.getInstance();
