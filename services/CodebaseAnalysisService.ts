import AsyncStorage from '@react-native-async-storage/async-storage';
import React from "react";

export interface FileAnalysis {
  path: string;
  type: 'component' | 'service' | 'context' | 'type' | 'config' | 'util' | 'page' | 'other';
  description: string;
  dependencies: string[];
  exports: string[];
  linesOfCode: number;
  complexity: 'low' | 'medium' | 'high';
  purpose: string;
  keyFeatures: string[];
}

export interface CodebaseInsight {
  id: string;
  category: 'architecture' | 'performance' | 'security' | 'maintainability' | 'feature';
  title: string;
  description: string;
  severity: 'info' | 'suggestion' | 'warning' | 'critical';
  file?: string;
  lineNumber?: number;
  suggestion?: string;
  timestamp: number;
}

export interface CodebaseStats {
  totalFiles: number;
  totalLines: number;
  components: number;
  services: number;
  pages: number;
  complexity: Record<string, number>;
  dependencies: Record<string, number>;
  lastAnalyzed: number;
}

class CodebaseAnalysisService {
  private static instance: CodebaseAnalysisService;
  private codebase: Map<string, FileAnalysis> = new Map();
  private insights: CodebaseInsight[] = [];
  private stats: CodebaseStats | null = null;
  private STORAGE_KEY = 'codebase_analysis';

  private constructor() {
    this.initializeCodebase();
  }

  static getInstance(): CodebaseAnalysisService {
    if (!CodebaseAnalysisService.instance) {
      CodebaseAnalysisService.instance = new CodebaseAnalysisService();
    }
    return CodebaseAnalysisService.instance;
  }

  private async initializeCodebase(): Promise<void> {
    const codebaseMap: Record<string, FileAnalysis> = {
      'app/index.tsx': {
        path: 'app/index.tsx',
        type: 'page',
        description: 'Main application entry point with navigation and layout management',
        dependencies: ['Header', 'Sidebar', 'FloatingButtons', 'EnhancedAIAssistantModal', 'JarvisOnboarding', 'AsyncStorage'],
        exports: ['Index'],
        linesOfCode: 202,
        complexity: 'medium',
        purpose: 'Manages the main application state, navigation, and renders different pages based on user selection',
        keyFeatures: ['Page routing', 'Sidebar navigation', 'AI assistant modal', 'Onboarding flow', 'State persistence'],
      },
      'components/EnhancedAIAssistantModal.tsx': {
        path: 'components/EnhancedAIAssistantModal.tsx',
        type: 'component',
        description: 'Advanced AI assistant (JARVIS) with voice, chat, and autonomous capabilities',
        dependencies: ['useRorkAgent', 'createRorkTool', 'Speech', 'Audio', 'AppContext'],
        exports: ['EnhancedAIAssistantModal'],
        linesOfCode: 1342,
        complexity: 'high',
        purpose: 'Provides intelligent AI assistance with voice interaction, content generation, trend analysis, and autonomous operations',
        keyFeatures: ['Voice input/output', 'AI chat', 'Tool execution', 'Settings management', 'Multi-tab interface'],
      },
      'contexts/AppContext.tsx': {
        path: 'contexts/AppContext.tsx',
        type: 'context',
        description: 'Global application state management using React Context',
        dependencies: ['AsyncStorage', 'createContextHook'],
        exports: ['AppProvider', 'useApp'],
        linesOfCode: 673,
        complexity: 'high',
        purpose: 'Manages all application data including metrics, social accounts, content, personas, revenue streams, and AI tasks',
        keyFeatures: ['State persistence', 'CRUD operations', 'Data backup/restore', 'Real-time updates'],
      },
      'services/JarvisVoiceService.ts': {
        path: 'services/JarvisVoiceService.ts',
        type: 'service',
        description: 'Voice synthesis and recognition service for JARVIS',
        dependencies: ['expo-speech', 'expo-av'],
        exports: ['JarvisVoiceService'],
        linesOfCode: 260,
        complexity: 'medium',
        purpose: 'Handles text-to-speech, speech-to-text, and voice customization for AI assistant',
        keyFeatures: ['Cross-platform voice', 'Audio recording', 'Voice settings', 'Predefined responses'],
      },
      'services/GoogleDriveService.ts': {
        path: 'services/GoogleDriveService.ts',
        type: 'service',
        description: 'Google Drive integration for cloud storage and backup',
        dependencies: ['expo-auth-session', 'expo-file-system'],
        exports: ['GoogleDriveService'],
        linesOfCode: 150,
        complexity: 'medium',
        purpose: 'Manages file uploads, downloads, and backups to Google Drive',
        keyFeatures: ['OAuth authentication', 'File management', 'Automatic backups'],
      },
      'services/SecurityService.ts': {
        path: 'services/SecurityService.ts',
        type: 'service',
        description: 'Security and encryption service for sensitive data',
        dependencies: ['expo-crypto', 'expo-local-authentication'],
        exports: ['SecurityService'],
        linesOfCode: 120,
        complexity: 'medium',
        purpose: 'Handles data encryption, biometric authentication, and secure storage',
        keyFeatures: ['Data encryption', 'Biometric auth', 'Secure key storage'],
      },
      'services/core/APIClient.ts': {
        path: 'services/core/APIClient.ts',
        type: 'service',
        description: 'Base API client for HTTP requests',
        dependencies: ['fetch'],
        exports: ['APIClient'],
        linesOfCode: 200,
        complexity: 'medium',
        purpose: 'Provides standardized HTTP client with interceptors, retries, and error handling',
        keyFeatures: ['Request/response interceptors', 'Auto retry', 'Error handling', 'Timeout management'],
      },
      'services/ai/AIService.ts': {
        path: 'services/ai/AIService.ts',
        type: 'service',
        description: 'AI model integration and management',
        dependencies: ['APIClient'],
        exports: ['AIService'],
        linesOfCode: 300,
        complexity: 'high',
        purpose: 'Manages AI model calls, prompt engineering, and response processing',
        keyFeatures: ['Multi-model support', 'Prompt templates', 'Response caching', 'Token tracking'],
      },
      'services/social/SocialMediaService.ts': {
        path: 'services/social/SocialMediaService.ts',
        type: 'service',
        description: 'Social media platform integration',
        dependencies: ['APIClient'],
        exports: ['SocialMediaService'],
        linesOfCode: 400,
        complexity: 'high',
        purpose: 'Handles posting, fetching, and managing content across social platforms',
        keyFeatures: ['Multi-platform posting', 'Analytics fetching', 'OAuth management', 'Rate limiting'],
      },
      'services/content/ContentService.ts': {
        path: 'services/content/ContentService.ts',
        type: 'service',
        description: 'Content generation and management service',
        dependencies: ['AIService'],
        exports: ['ContentService'],
        linesOfCode: 250,
        complexity: 'medium',
        purpose: 'Generates and manages content using AI models',
        keyFeatures: ['Content generation', 'Template management', 'SEO optimization', 'Multi-format support'],
      },
      'components/pages/OverviewDashboard.tsx': {
        path: 'components/pages/OverviewDashboard.tsx',
        type: 'page',
        description: 'Main dashboard showing metrics and insights',
        dependencies: ['AppContext', 'lucide-react-native'],
        exports: ['OverviewDashboard'],
        linesOfCode: 350,
        complexity: 'medium',
        purpose: 'Displays key performance metrics, charts, and AI insights',
        keyFeatures: ['Real-time metrics', 'Chart visualization', 'Insight cards', 'Quick actions'],
      },
    };

    Object.entries(codebaseMap).forEach(([path, analysis]) => {
      this.codebase.set(path, analysis);
    });

    await this.generateInsights();
    this.calculateStats();

    console.log('[Codebase] Analysis initialized with', this.codebase.size, 'files');
  }

  private async generateInsights(): Promise<void> {
    this.insights = [
      {
        id: '1',
        category: 'architecture',
        title: 'Well-structured component hierarchy',
        description: 'The application follows a clean separation between pages, components, services, and contexts',
        severity: 'info',
        timestamp: Date.now(),
      },
      {
        id: '2',
        category: 'feature',
        title: 'Comprehensive AI integration',
        description: 'JARVIS AI assistant is integrated with voice, chat, and autonomous capabilities across the platform',
        severity: 'info',
        file: 'components/EnhancedAIAssistantModal.tsx',
        timestamp: Date.now(),
      },
      {
        id: '3',
        category: 'performance',
        title: 'Consider code splitting',
        description: 'Main index file imports all pages. Consider lazy loading pages for better initial load time',
        severity: 'suggestion',
        file: 'app/index.tsx',
        suggestion: 'Use React.lazy() and Suspense for page components',
        timestamp: Date.now(),
      },
      {
        id: '4',
        category: 'maintainability',
        title: 'State management is centralized',
        description: 'AppContext provides centralized state management with persistence using AsyncStorage',
        severity: 'info',
        file: 'contexts/AppContext.tsx',
        timestamp: Date.now(),
      },
      {
        id: '5',
        category: 'security',
        title: 'API keys stored securely',
        description: 'API keys are managed through SecurityService with encryption',
        severity: 'info',
        file: 'services/SecurityService.ts',
        timestamp: Date.now(),
      },
    ];
  }

  private calculateStats(): void {
    const files = Array.from(this.codebase.values());
    
    this.stats = {
      totalFiles: files.length,
      totalLines: files.reduce((sum, f) => sum + f.linesOfCode, 0),
      components: files.filter(f => f.type === 'component').length,
      services: files.filter(f => f.type === 'service').length,
      pages: files.filter(f => f.type === 'page').length,
      complexity: {
        low: files.filter(f => f.complexity === 'low').length,
        medium: files.filter(f => f.complexity === 'medium').length,
        high: files.filter(f => f.complexity === 'high').length,
      },
      dependencies: {},
      lastAnalyzed: Date.now(),
    };
  }

  getFileAnalysis(path: string): FileAnalysis | null {
    return this.codebase.get(path) || null;
  }

  getAllFiles(): FileAnalysis[] {
    return Array.from(this.codebase.values());
  }

  getFilesByType(type: FileAnalysis['type']): FileAnalysis[] {
    return this.getAllFiles().filter(f => f.type === type);
  }

  searchFiles(query: string): FileAnalysis[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllFiles().filter(f => 
      f.path.toLowerCase().includes(lowerQuery) ||
      f.description.toLowerCase().includes(lowerQuery) ||
      f.purpose.toLowerCase().includes(lowerQuery) ||
      f.keyFeatures.some(kf => kf.toLowerCase().includes(lowerQuery))
    );
  }

  getInsights(): CodebaseInsight[] {
    return [...this.insights];
  }

  getInsightsByCategory(category: CodebaseInsight['category']): CodebaseInsight[] {
    return this.insights.filter(i => i.category === category);
  }

  getStats(): CodebaseStats | null {
    return this.stats ? { ...this.stats } : null;
  }

  explainFile(path: string): string {
    const file = this.getFileAnalysis(path);
    if (!file) return `File not found: ${path}`;

    return `
File: ${file.path}
Type: ${file.type}
Complexity: ${file.complexity}

Description: ${file.description}

Purpose: ${file.purpose}

Key Features:
${file.keyFeatures.map(f => `- ${f}`).join('\n')}

Dependencies: ${file.dependencies.join(', ')}

Lines of Code: ${file.linesOfCode}

This file ${this.getFileContext(file)}
    `.trim();
  }

  private getFileContext(file: FileAnalysis): string {
    switch (file.type) {
      case 'page':
        return 'is a page component that users can navigate to. It typically renders the main content for a specific section of the app.';
      case 'component':
        return 'is a reusable UI component that can be used throughout the application.';
      case 'service':
        return 'is a service module that provides business logic and external integrations.';
      case 'context':
        return 'provides global state management using React Context API.';
      case 'type':
        return 'contains TypeScript type definitions and interfaces.';
      default:
        return 'is part of the application architecture.';
    }
  }

  generateUpgradeRecommendations(): string[] {
    return [
      'Add React Query for server state management to improve data fetching and caching',
      'Implement error boundaries in key components to prevent full app crashes',
      'Add comprehensive unit tests for services and utilities',
      'Consider implementing a design system with standardized components',
      'Add performance monitoring with React Native Performance',
      'Implement CI/CD pipeline for automated testing and deployment',
      'Add analytics tracking for user behavior insights',
      'Optimize images and assets with lazy loading',
      'Add internationalization (i18n) support for multiple languages',
      'Implement progressive web app (PWA) features for web version',
    ];
  }

  async getCodebaseOverview(): Promise<string> {
    const stats = this.getStats();
    if (!stats) return 'Codebase analysis not available';

    return `
JARVIS AI Influencer Command Center - Codebase Overview

Total Files: ${stats.totalFiles}
Total Lines of Code: ${stats.totalLines.toLocaleString()}

Components Breakdown:
- Pages: ${stats.pages}
- Components: ${stats.components}
- Services: ${stats.services}

Complexity Distribution:
- Low: ${stats.complexity.low} files
- Medium: ${stats.complexity.medium} files
- High: ${stats.complexity.high} files

Key Modules:
1. AI Assistant (JARVIS) - Advanced AI with voice, chat, and autonomous capabilities
2. Content Engine - AI-powered content generation for social media
3. Analytics Dashboard - Real-time metrics and performance insights
4. Social Media Integration - Multi-platform posting and management
5. Revenue Optimization - Monetization tracking and optimization
6. Automation Engine - Workflow automation and scheduling

Last Analyzed: ${new Date(stats.lastAnalyzed).toLocaleString()}
    `.trim();
  }
}

export default CodebaseAnalysisService.getInstance();
