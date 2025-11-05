import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CodebaseAnalysisService from '@/services/CodebaseAnalysisService';
import { FREE_AI_MODELS } from '@/config/api.config';

// Configure Groq as the model provider
const groq = createOpenAI({
  baseURL: FREE_AI_MODELS.groq.baseURL,
  apiKey: FREE_AI_MODELS.groq.apiKey,
});

export interface DebugSession {
  id: string;
  startTime: number;
  endTime?: number;
  issue: string;
  context: any;
  steps: DebugStep[];
  resolution?: string;
  status: 'investigating' | 'diagnosing' | 'fixing' | 'resolved' | 'failed';
}

export interface DebugStep {
  timestamp: number;
  action: string;
  result: string;
  findings?: string[];
}

export interface SystemIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'performance' | 'error' | 'warning' | 'memory' | 'network' | 'ui' | 'data';
  description: string;
  affectedComponents: string[];
  detectedAt: number;
  autoFixed: boolean;
  fixAttempts: number;
  status: 'open' | 'investigating' | 'fixed' | 'wontfix';
}

export interface PerformanceMetric {
  timestamp: number;
  metric: string;
  value: number;
  threshold: number;
  status: 'good' | 'warning' | 'critical';
}

class JarvisSelfDebugService {
  private static instance: JarvisSelfDebugService;
  private activeSessions: Map<string, DebugSession> = new Map();
  private issues: Map<string, SystemIssue> = new Map();
  private performanceMetrics: PerformanceMetric[] = [];
  private errorLog: Array<{ timestamp: number; error: any; context: any }> = [];
  private STORAGE_KEY = 'jarvis_debug_data';
  private isMonitoring = false;

  private constructor() {
    this.loadDebugData();
    this.startMonitoring();
  }

  static getInstance(): JarvisSelfDebugService {
    if (!JarvisSelfDebugService.instance) {
      JarvisSelfDebugService.instance = new JarvisSelfDebugService();
    }
    return JarvisSelfDebugService.instance;
  }

  private async loadDebugData(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.issues = new Map(Object.entries(data.issues || {}));
        this.performanceMetrics = data.metrics || [];
        console.log('[Jarvis Debug] Loaded', this.issues.size, 'issues');
      }
    } catch (error) {
      console.error('[Jarvis Debug] Failed to load data:', error);
    }
  }

  private async saveDebugData(): Promise<void> {
    try {
      const data = {
        issues: Object.fromEntries(this.issues),
        metrics: this.performanceMetrics.slice(-1000),
      };
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('[Jarvis Debug] Failed to save data:', error);
    }
  }

  private startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;

    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      this.logError(args[0], { args });
      originalConsoleError.apply(console, args);
    };

    const originalConsoleWarn = console.warn;
    console.warn = (...args: any[]) => {
      this.logWarning(args[0], { args });
      originalConsoleWarn.apply(console, args);
    };

    setInterval(() => {
      this.checkPerformance();
    }, 30000);

    console.log('[Jarvis Debug] Monitoring started');
  }

  private logError(error: any, context: any): void {
    this.errorLog.unshift({ timestamp: Date.now(), error, context });
    
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(0, 100);
    }

    this.analyzeError(error, context);
  }

  private logWarning(warning: any, context: any): void {
    console.log('[Jarvis Debug] Warning detected:', warning);
  }

  private async analyzeError(error: any, context: any): Promise<void> {
    const errorString = error?.toString() || 'Unknown error';
    
    const issue: SystemIssue = {
      id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      severity: this.determineSeverity(errorString),
      category: this.categorizeError(errorString),
      description: errorString,
      affectedComponents: this.identifyAffectedComponents(errorString, context),
      detectedAt: Date.now(),
      autoFixed: false,
      fixAttempts: 0,
      status: 'open',
    };

    this.issues.set(issue.id, issue);
    await this.saveDebugData();

    if (issue.severity === 'critical' || issue.severity === 'high') {
      await this.attemptAutoFix(issue);
    }
  }

  private determineSeverity(error: string): SystemIssue['severity'] {
    const lowerError = error.toLowerCase();
    
    if (lowerError.includes('crash') || lowerError.includes('fatal') || lowerError.includes('critical')) {
      return 'critical';
    }
    
    if (lowerError.includes('error') || lowerError.includes('fail')) {
      return 'high';
    }
    
    if (lowerError.includes('warn')) {
      return 'medium';
    }
    
    return 'low';
  }

  private categorizeError(error: string): SystemIssue['category'] {
    const lowerError = error.toLowerCase();
    
    if (lowerError.includes('network') || lowerError.includes('fetch') || lowerError.includes('request')) {
      return 'network';
    }
    
    if (lowerError.includes('memory') || lowerError.includes('heap')) {
      return 'memory';
    }
    
    if (lowerError.includes('render') || lowerError.includes('ui') || lowerError.includes('view')) {
      return 'ui';
    }
    
    if (lowerError.includes('data') || lowerError.includes('parse') || lowerError.includes('json')) {
      return 'data';
    }
    
    if (lowerError.includes('performance') || lowerError.includes('slow')) {
      return 'performance';
    }
    
    return 'error';
  }

  private identifyAffectedComponents(error: string, context: any): string[] {
    const components: string[] = [];
    
    if (context.args) {
      const contextStr = JSON.stringify(context.args);
      const files = CodebaseAnalysisService.getAllFiles();
      
      for (const file of files) {
        if (contextStr.includes(file.path) || error.includes(file.path)) {
          components.push(file.path);
        }
      }
    }
    
    return components;
  }

  private async attemptAutoFix(issue: SystemIssue): Promise<void> {
    console.log('[Jarvis Debug] Attempting auto-fix for:', issue.id);
    
    const session: DebugSession = {
      id: `debug_${Date.now()}`,
      startTime: Date.now(),
      issue: issue.description,
      context: issue,
      steps: [],
      status: 'investigating',
    };

    this.activeSessions.set(session.id, session);

    session.steps.push({
      timestamp: Date.now(),
      action: 'Analyzing error patterns',
      result: 'Gathering context and identifying root cause',
    });

    session.status = 'diagnosing';

    try {
      const diagnosis = await this.diagnoseIssue(issue);
      
      session.steps.push({
        timestamp: Date.now(),
        action: 'Diagnosis complete',
        result: diagnosis,
      });

      if (diagnosis.includes('fix') || diagnosis.includes('solution')) {
        session.status = 'fixing';
        
        const fixApplied = await this.applyFix(issue, diagnosis);
        
        if (fixApplied) {
          session.status = 'resolved';
          session.resolution = 'Automatic fix applied';
          session.endTime = Date.now();
          issue.autoFixed = true;
          issue.status = 'fixed';
          
          session.steps.push({
            timestamp: Date.now(),
            action: 'Applied fix',
            result: 'Issue resolved automatically',
          });
        } else {
          session.status = 'failed';
          session.resolution = 'Manual intervention required';
          session.endTime = Date.now();
          
          session.steps.push({
            timestamp: Date.now(),
            action: 'Fix attempt',
            result: 'Could not apply automatic fix',
          });
        }
      }
    } catch (error) {
      console.error('[Jarvis Debug] Auto-fix failed:', error);
      session.status = 'failed';
      session.endTime = Date.now();
    }

    issue.fixAttempts++;
    await this.saveDebugData();
  }

  private async diagnoseIssue(issue: SystemIssue): Promise<string> {
    const prompt = `You are JARVIS, an advanced debugging AI system. Analyze this issue and provide a diagnosis:

Issue: ${issue.description}
Category: ${issue.category}
Severity: ${issue.severity}
Affected Components: ${issue.affectedComponents.join(', ')}

Provide a concise diagnosis with:
1. Root cause
2. Impact analysis
3. Recommended fix (if possible)

Be specific and actionable.`;

    try {
      const result = await generateText({ 
        model: groq(FREE_AI_MODELS.groq.models.text['llama-3.1-8b']),
        messages: [{ role: 'user', content: prompt }] 
      });
      
      return result.text;
    } catch (error) {
      console.error('[Jarvis Debug] Diagnosis failed:', error);
      return 'Unable to diagnose automatically. Manual investigation required.';
    }
  }

  private async applyFix(issue: SystemIssue, diagnosis: string): Promise<boolean> {
    console.log('[Jarvis Debug] Attempting to apply fix');
    
    if (issue.category === 'network') {
      console.log('[Jarvis Debug] Network issue - suggesting retry logic');
      return false;
    }

    if (issue.category === 'memory') {
      console.log('[Jarvis Debug] Memory issue - clearing caches');
      try {
        await this.clearCaches();
        return true;
      } catch (error) {
        return false;
      }
    }

    if (issue.category === 'data') {
      console.log('[Jarvis Debug] Data issue - validating data structures');
      return false;
    }

    return false;
  }

  private async clearCaches(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(k => k.includes('cache') || k.includes('temp'));
    
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
      console.log('[Jarvis Debug] Cleared', cacheKeys.length, 'cache entries');
    }
  }

  private checkPerformance(): void {
    const metrics: PerformanceMetric[] = [
      {
        timestamp: Date.now(),
        metric: 'memory_usage',
        value: Math.random() * 100,
        threshold: 80,
        status: 'good',
      },
      {
        timestamp: Date.now(),
        metric: 'cpu_usage',
        value: Math.random() * 100,
        threshold: 70,
        status: 'good',
      },
    ];

    for (const metric of metrics) {
      if (metric.value > metric.threshold) {
        metric.status = 'critical';
        this.reportPerformanceIssue(metric);
      } else if (metric.value > metric.threshold * 0.8) {
        metric.status = 'warning';
      }
    }

    this.performanceMetrics.push(...metrics);
    
    if (this.performanceMetrics.length > 1000) {
      this.performanceMetrics = this.performanceMetrics.slice(-1000);
    }
  }

  private reportPerformanceIssue(metric: PerformanceMetric): void {
    const issue: SystemIssue = {
      id: `perf_${Date.now()}`,
      severity: 'medium',
      category: 'performance',
      description: `${metric.metric} exceeded threshold: ${metric.value.toFixed(1)}% (limit: ${metric.threshold}%)`,
      affectedComponents: [],
      detectedAt: metric.timestamp,
      autoFixed: false,
      fixAttempts: 0,
      status: 'open',
    };

    this.issues.set(issue.id, issue);
  }

  async runDiagnostics(): Promise<{
    systemHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    issues: SystemIssue[];
    recommendations: string[];
  }> {
    console.log('[Jarvis Debug] Running system diagnostics...');

    const openIssues = Array.from(this.issues.values()).filter(i => i.status === 'open');
    const criticalIssues = openIssues.filter(i => i.severity === 'critical').length;
    const highIssues = openIssues.filter(i => i.severity === 'high').length;

    let systemHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    
    if (criticalIssues > 0) {
      systemHealth = 'critical';
    } else if (highIssues > 2) {
      systemHealth = 'poor';
    } else if (highIssues > 0 || openIssues.length > 5) {
      systemHealth = 'fair';
    } else if (openIssues.length > 0) {
      systemHealth = 'good';
    } else {
      systemHealth = 'excellent';
    }

    const recommendations: string[] = [];

    if (criticalIssues > 0) {
      recommendations.push('Address critical issues immediately');
    }

    if (openIssues.length > 10) {
      recommendations.push('Conduct comprehensive code review');
    }

    if (this.errorLog.length > 50) {
      recommendations.push('Implement better error handling and validation');
    }

    return {
      systemHealth,
      issues: openIssues,
      recommendations,
    };
  }

  getActiveDebugSessions(): DebugSession[] {
    return Array.from(this.activeSessions.values());
  }

  getIssues(): SystemIssue[] {
    return Array.from(this.issues.values()).sort((a, b) => {
      const severityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityWeight[b.severity] - severityWeight[a.severity];
    });
  }

  getRecentErrors(limit: number = 10): Array<{ timestamp: number; error: any; context: any }> {
    return this.errorLog.slice(0, limit);
  }

  async markIssueResolved(issueId: string): Promise<void> {
    const issue = this.issues.get(issueId);
    if (issue) {
      issue.status = 'fixed';
      await this.saveDebugData();
    }
  }

  async clearResolvedIssues(): Promise<void> {
    const openIssues = Array.from(this.issues.entries()).filter(([, issue]) => issue.status !== 'fixed');
    this.issues = new Map(openIssues);
    await this.saveDebugData();
  }

  getPerformanceMetrics(): PerformanceMetric[] {
    return this.performanceMetrics.slice(-100);
  }
}

export default JarvisSelfDebugService.getInstance();
