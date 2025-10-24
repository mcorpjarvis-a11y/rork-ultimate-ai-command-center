import AsyncStorage from '@react-native-async-storage/async-storage';
import CodebaseAnalysisService, { FileAnalysis } from './CodebaseAnalysisService';
import JarvisPersonality from './personality/JarvisPersonality';

export interface CodeChange {
  id: string;
  timestamp: number;
  fileName: string;
  changeType: 'create' | 'modify' | 'delete' | 'refactor';
  description: string;
  reason: string;
  impact: string;
  before?: string;
  after?: string;
  approved: boolean;
  appliedAt?: number;
  status: 'pending' | 'approved' | 'applied' | 'rejected';
}

export interface CodeSuggestion {
  id: string;
  timestamp: number;
  category: 'optimization' | 'bug_fix' | 'feature' | 'refactor' | 'security' | 'performance';
  title: string;
  description: string;
  fileName: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  implementation: string;
  expectedImpact: string;
  estimatedEffort: 'small' | 'medium' | 'large';
  dependencies: string[];
  status: 'proposed' | 'in_progress' | 'completed' | 'rejected';
}

export interface GeneratedComponent {
  id: string;
  name: string;
  type: 'component' | 'page' | 'service' | 'util';
  code: string;
  description: string;
  dependencies: string[];
  createdAt: number;
  tested: boolean;
  deployed: boolean;
}

export interface DebugSession {
  id: string;
  startTime: number;
  endTime?: number;
  issue: string;
  steps: DebugStep[];
  solution?: string;
  status: 'investigating' | 'testing' | 'resolved' | 'escalated';
}

export interface DebugStep {
  timestamp: number;
  action: string;
  finding: string;
  nextAction?: string;
}

class SelfModificationService {
  private static instance: SelfModificationService;
  private codeChanges: CodeChange[] = [];
  private suggestions: CodeSuggestion[] = [];
  private generatedComponents: GeneratedComponent[] = [];
  private debugSessions: DebugSession[] = [];
  private STORAGE_KEY = 'jarvis_self_modification';
  private modificationEnabled: boolean = true;
  private autonomousMode: boolean = false;

  private constructor() {
    this.loadState();
  }

  static getInstance(): SelfModificationService {
    if (!SelfModificationService.instance) {
      SelfModificationService.instance = new SelfModificationService();
    }
    return SelfModificationService.instance;
  }

  private async loadState(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.codeChanges = data.codeChanges || [];
        this.suggestions = data.suggestions || [];
        this.generatedComponents = data.generatedComponents || [];
        this.debugSessions = data.debugSessions || [];
        this.modificationEnabled = data.modificationEnabled ?? true;
        this.autonomousMode = data.autonomousMode ?? false;
        console.log('[SelfMod] State loaded successfully');
      }
    } catch (error) {
      console.error('[SelfMod] Failed to load state:', error);
    }
  }

  private async saveState(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        codeChanges: this.codeChanges,
        suggestions: this.suggestions,
        generatedComponents: this.generatedComponents,
        debugSessions: this.debugSessions,
        modificationEnabled: this.modificationEnabled,
        autonomousMode: this.autonomousMode,
      }));
      console.log('[SelfMod] State saved successfully');
    } catch (error) {
      console.error('[SelfMod] Failed to save state:', error);
    }
  }

  async analyzeCodebase(): Promise<string> {
    const overview = await CodebaseAnalysisService.getCodebaseOverview();
    const files = CodebaseAnalysisService.getAllFiles();
    const insights = CodebaseAnalysisService.getInsights();

    const analysis = `
${overview}

Code Quality Insights:
${insights.map(i => `- [${i.severity.toUpperCase()}] ${i.title}: ${i.description}`).join('\n')}

Areas for Improvement:
${this.identifyImprovementAreas(files).join('\n')}
    `.trim();

    console.log('[SelfMod] Codebase analysis completed');
    return analysis;
  }

  private identifyImprovementAreas(files: FileAnalysis[]): string[] {
    const areas: string[] = [];

    const highComplexityFiles = files.filter(f => f.complexity === 'high');
    if (highComplexityFiles.length > 0) {
      areas.push(`- ${highComplexityFiles.length} files with high complexity could benefit from refactoring`);
    }

    const duplicateLogic = this.detectDuplicateLogic(files);
    if (duplicateLogic.length > 0) {
      areas.push(`- Potential code duplication detected in ${duplicateLogic.length} areas`);
    }

    areas.push('- Add comprehensive error boundaries for better resilience');
    areas.push('- Implement automated testing suite');
    areas.push('- Add performance monitoring and analytics');

    return areas;
  }

  private detectDuplicateLogic(files: FileAnalysis[]): string[] {
    const commonPatterns: string[] = [];
    const dependencies = files.flatMap(f => f.dependencies);
    const depCount = dependencies.reduce((acc, dep) => {
      acc[dep] = (acc[dep] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(depCount).forEach(([dep, count]) => {
      if (count > 5) {
        commonPatterns.push(`${dep} used in ${count} files`);
      }
    });

    return commonPatterns;
  }

  async suggestImprovement(
    category: CodeSuggestion['category'],
    title: string,
    description: string,
    fileName: string,
    implementation: string,
    priority: CodeSuggestion['priority'] = 'medium'
  ): Promise<CodeSuggestion> {
    const suggestion: CodeSuggestion = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      category,
      title,
      description,
      fileName,
      priority,
      implementation,
      expectedImpact: this.calculateExpectedImpact(category, priority),
      estimatedEffort: this.estimateEffort(implementation),
      dependencies: this.extractDependencies(implementation),
      status: 'proposed',
    };

    this.suggestions.unshift(suggestion);
    await this.saveState();

    console.log(`[SelfMod] New suggestion: ${title}`);
    return suggestion;
  }

  private calculateExpectedImpact(category: string, priority: string): string {
    const impacts = {
      optimization: 'Improved performance and reduced resource usage',
      bug_fix: 'Resolved issue and improved stability',
      feature: 'Enhanced functionality and user experience',
      refactor: 'Better code maintainability and readability',
      security: 'Improved application security',
      performance: 'Faster execution and better responsiveness',
    };
    return impacts[category as keyof typeof impacts] || 'Positive impact on codebase';
  }

  private estimateEffort(implementation: string): 'small' | 'medium' | 'large' {
    const lines = implementation.split('\n').length;
    if (lines < 50) return 'small';
    if (lines < 200) return 'medium';
    return 'large';
  }

  private extractDependencies(code: string): string[] {
    const importRegex = /import\s+.*?from\s+['"](.+?)['"]/g;
    const dependencies: string[] = [];
    let match;

    while ((match = importRegex.exec(code)) !== null) {
      dependencies.push(match[1]);
    }

    return [...new Set(dependencies)];
  }

  async proposeCodeChange(
    fileName: string,
    changeType: CodeChange['changeType'],
    description: string,
    reason: string,
    before: string,
    after: string
  ): Promise<CodeChange> {
    if (!this.canModifyCode()) {
      throw new Error('Code modification is not enabled');
    }

    const change: CodeChange = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      fileName,
      changeType,
      description,
      reason,
      impact: this.analyzeChangeImpact(before, after),
      before,
      after,
      approved: this.autonomousMode,
      status: this.autonomousMode ? 'approved' : 'pending',
    };

    this.codeChanges.unshift(change);
    await this.saveState();

    console.log(`[SelfMod] Proposed ${changeType} for ${fileName}`);

    if (this.autonomousMode) {
      await this.applyCodeChange(change.id);
    }

    return change;
  }

  private analyzeChangeImpact(before: string, after: string): string {
    const beforeLines = before.split('\n').length;
    const afterLines = after.split('\n').length;
    const diff = afterLines - beforeLines;

    let impact = `Modified ${Math.abs(diff)} lines. `;

    if (diff > 0) {
      impact += `Added ${diff} lines of code.`;
    } else if (diff < 0) {
      impact += `Removed ${Math.abs(diff)} lines of code.`;
    } else {
      impact += 'No net change in lines.';
    }

    return impact;
  }

  async approveCodeChange(changeId: string): Promise<void> {
    const change = this.codeChanges.find(c => c.id === changeId);
    if (!change) {
      throw new Error('Code change not found');
    }

    change.approved = true;
    change.status = 'approved';
    await this.saveState();

    console.log(`[SelfMod] Code change approved: ${change.description}`);
  }

  async applyCodeChange(changeId: string): Promise<void> {
    const change = this.codeChanges.find(c => c.id === changeId);
    if (!change) {
      throw new Error('Code change not found');
    }

    if (!change.approved) {
      throw new Error('Code change must be approved first');
    }

    change.appliedAt = Date.now();
    change.status = 'applied';
    await this.saveState();

    await JarvisPersonality.unlockAchievement('code_master');

    console.log(`[SelfMod] ✅ Code change applied: ${change.description}`);
  }

  async rejectCodeChange(changeId: string, reason: string): Promise<void> {
    const change = this.codeChanges.find(c => c.id === changeId);
    if (!change) {
      throw new Error('Code change not found');
    }

    change.status = 'rejected';
    await this.saveState();

    console.log(`[SelfMod] Code change rejected: ${reason}`);
  }

  async generateComponent(
    name: string,
    type: GeneratedComponent['type'],
    requirements: string
  ): Promise<GeneratedComponent> {
    if (!this.canModifyCode()) {
      throw new Error('Code generation is not enabled');
    }

    const code = this.generateComponentCode(name, type, requirements);

    const component: GeneratedComponent = {
      id: Date.now().toString(),
      name,
      type,
      code,
      description: requirements,
      dependencies: this.extractDependencies(code),
      createdAt: Date.now(),
      tested: false,
      deployed: false,
    };

    this.generatedComponents.unshift(component);
    await this.saveState();

    console.log(`[SelfMod] Generated ${type}: ${name}`);

    return component;
  }

  private generateComponentCode(name: string, type: string, requirements: string): string {
    const templates = {
      component: `import { View, Text, StyleSheet } from 'react-native';

export interface ${name}Props {
  // Define props here
}

export default function ${name}(props: ${name}Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>${name} Component</Text>
      {/* ${requirements} */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000',
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
});`,
      page: `import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ${name}() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>${name}</Text>
        {/* ${requirements} */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#00E5FF',
    marginBottom: 20,
  },
});`,
      service: `class ${name} {
  private static instance: ${name};

  private constructor() {
    // Initialize service
    console.log('[${name}] Service initialized');
  }

  static getInstance(): ${name} {
    if (!${name}.instance) {
      ${name}.instance = new ${name}();
    }
    return ${name}.instance;
  }

  // ${requirements}

  async performAction(): Promise<void> {
    console.log('[${name}] Performing action');
  }
}

export default ${name}.getInstance();`,
      util: `export function ${name.toLowerCase()}() {
  // ${requirements}
  return null;
}

export default ${name.toLowerCase()};`,
    };

    return templates[type as keyof typeof templates] || templates.component;
  }

  async refactorCode(fileName: string, refactorType: 'extract' | 'inline' | 'rename' | 'optimize'): Promise<string> {
    console.log(`[SelfMod] Refactoring ${fileName}: ${refactorType}`);

    const suggestions = {
      extract: 'Extract repeated code into reusable functions/components',
      inline: 'Inline small functions to reduce indirection',
      rename: 'Rename variables/functions for better clarity',
      optimize: 'Optimize algorithms and data structures for better performance',
    };

    return suggestions[refactorType];
  }

  async startDebugSession(issue: string): Promise<DebugSession> {
    const session: DebugSession = {
      id: Date.now().toString(),
      startTime: Date.now(),
      issue,
      steps: [],
      status: 'investigating',
    };

    this.debugSessions.unshift(session);
    await this.saveState();

    console.log(`[SelfMod] Debug session started: ${issue}`);

    return session;
  }

  async addDebugStep(sessionId: string, action: string, finding: string, nextAction?: string): Promise<void> {
    const session = this.debugSessions.find(s => s.id === sessionId);
    if (!session) {
      throw new Error('Debug session not found');
    }

    session.steps.push({
      timestamp: Date.now(),
      action,
      finding,
      nextAction,
    });

    await this.saveState();
    console.log(`[SelfMod] Debug step added: ${action}`);
  }

  async resolveDebugSession(sessionId: string, solution: string): Promise<void> {
    const session = this.debugSessions.find(s => s.id === sessionId);
    if (!session) {
      throw new Error('Debug session not found');
    }

    session.endTime = Date.now();
    session.solution = solution;
    session.status = 'resolved';

    await this.saveState();
    console.log(`[SelfMod] Debug session resolved: ${solution}`);
  }

  async analyzeFile(fileName: string): Promise<string> {
    const analysis = CodebaseAnalysisService.explainFile(fileName);
    
    if (analysis.includes('not found')) {
      return `File "${fileName}" not found in codebase index. Available files:\n${
        CodebaseAnalysisService.getAllFiles().map(f => `- ${f.path}`).join('\n')
      }`;
    }

    return analysis;
  }

  async searchCode(query: string): Promise<FileAnalysis[]> {
    return CodebaseAnalysisService.searchFiles(query);
  }

  canModifyCode(): boolean {
    return this.modificationEnabled && JarvisPersonality.canPerformAutonomousAction('modifyCode');
  }

  canDebugSystem(): boolean {
    return JarvisPersonality.canPerformAutonomousAction('debugSystem');
  }

  setModificationEnabled(enabled: boolean): void {
    this.modificationEnabled = enabled;
    this.saveState();
    console.log(`[SelfMod] Modification ${enabled ? 'enabled' : 'disabled'}`);
  }

  setAutonomousMode(enabled: boolean): void {
    this.autonomousMode = enabled;
    this.saveState();
    console.log(`[SelfMod] Autonomous mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  isAutonomousMode(): boolean {
    return this.autonomousMode;
  }

  getCodeChanges(): CodeChange[] {
    return [...this.codeChanges];
  }

  getPendingCodeChanges(): CodeChange[] {
    return this.codeChanges.filter(c => c.status === 'pending');
  }

  getSuggestions(): CodeSuggestion[] {
    return [...this.suggestions];
  }

  getProposedSuggestions(): CodeSuggestion[] {
    return this.suggestions.filter(s => s.status === 'proposed');
  }

  getGeneratedComponents(): GeneratedComponent[] {
    return [...this.generatedComponents];
  }

  getDebugSessions(): DebugSession[] {
    return [...this.debugSessions];
  }

  getActiveDebugSessions(): DebugSession[] {
    return this.debugSessions.filter(s => s.status === 'investigating' || s.status === 'testing');
  }

  getStats(): {
    totalChanges: number;
    appliedChanges: number;
    pendingChanges: number;
    suggestionsCount: number;
    componentsGenerated: number;
    debugSessionsResolved: number;
  } {
    return {
      totalChanges: this.codeChanges.length,
      appliedChanges: this.codeChanges.filter(c => c.status === 'applied').length,
      pendingChanges: this.codeChanges.filter(c => c.status === 'pending').length,
      suggestionsCount: this.suggestions.length,
      componentsGenerated: this.generatedComponents.length,
      debugSessionsResolved: this.debugSessions.filter(s => s.status === 'resolved').length,
    };
  }

  async exportChangelog(): Promise<string> {
    const applied = this.codeChanges.filter(c => c.status === 'applied');
    
    return `
# JARVIS Self-Modification Changelog

Total Changes Applied: ${applied.length}

${applied.map((change, idx) => `
## ${idx + 1}. ${change.description}
- **File:** ${change.fileName}
- **Type:** ${change.changeType}
- **Date:** ${new Date(change.appliedAt || change.timestamp).toLocaleString()}
- **Reason:** ${change.reason}
- **Impact:** ${change.impact}
`).join('\n')}
    `.trim();
  }
}

export default SelfModificationService.getInstance();
