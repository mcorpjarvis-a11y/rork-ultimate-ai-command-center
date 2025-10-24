import APIClient from '@/services/core/APIClient';
import StorageManager from '@/services/storage/StorageManager';
import { Workflow, WorkflowTrigger, WorkflowCondition, WorkflowAction } from '@/types/models.types';

export interface WorkflowExecutionResult {
  workflowId: string;
  success: boolean;
  executedActions: string[];
  errors: string[];
  startedAt: number;
  completedAt: number;
  duration: number;
}

class WorkflowService {
  private workflows: Map<string, Workflow>;
  private activeExecutions: Map<string, Promise<WorkflowExecutionResult>>;

  constructor() {
    this.workflows = new Map();
    this.activeExecutions = new Map();
    this.loadWorkflows();
  }

  private async loadWorkflows(): Promise<void> {
    try {
      const workflows = await StorageManager.get<Workflow[]>('workflows', []);
      if (workflows) {
        workflows.forEach(wf => this.workflows.set(wf.id, wf));
        console.log(`[WorkflowService] Loaded ${workflows.length} workflows`);
        this.startActiveWorkflows();
      }
    } catch (error) {
      console.error('[WorkflowService] Failed to load workflows:', error);
    }
  }

  private async saveWorkflows(): Promise<void> {
    try {
      const workflows = Array.from(this.workflows.values());
      await StorageManager.set('workflows', workflows);
    } catch (error) {
      console.error('[WorkflowService] Failed to save workflows:', error);
    }
  }

  async createWorkflow(
    name: string,
    description: string,
    trigger: WorkflowTrigger,
    conditions: WorkflowCondition[],
    actions: WorkflowAction[]
  ): Promise<Workflow> {
    console.log(`[WorkflowService] Creating workflow: ${name}`);

    const workflow: Workflow = {
      id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      trigger,
      conditions,
      actions,
      isActive: true,
      runCount: 0,
      successCount: 0,
      failureCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.workflows.set(workflow.id, workflow);
    await this.saveWorkflows();

    if (workflow.isActive) {
      this.activateWorkflow(workflow.id);
    }

    return workflow;
  }

  async updateWorkflow(
    id: string,
    updates: Partial<Workflow>
  ): Promise<Workflow> {
    console.log(`[WorkflowService] Updating workflow: ${id}`);

    const existing = this.workflows.get(id);
    if (!existing) {
      throw new Error('Workflow not found');
    }

    const updated: Workflow = {
      ...existing,
      ...updates,
      id: existing.id,
      updatedAt: Date.now(),
    };

    this.workflows.set(id, updated);
    await this.saveWorkflows();

    if (updated.isActive !== existing.isActive) {
      if (updated.isActive) {
        this.activateWorkflow(id);
      } else {
        this.deactivateWorkflow(id);
      }
    }

    return updated;
  }

  async deleteWorkflow(id: string): Promise<void> {
    console.log(`[WorkflowService] Deleting workflow: ${id}`);

    this.deactivateWorkflow(id);
    this.workflows.delete(id);
    await this.saveWorkflows();
  }

  async executeWorkflow(
    id: string,
    context: Record<string, any> = {}
  ): Promise<WorkflowExecutionResult> {
    const workflow = this.workflows.get(id);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    if (this.activeExecutions.has(id)) {
      console.log(`[WorkflowService] Workflow ${id} already executing`);
      return this.activeExecutions.get(id)!;
    }

    console.log(`[WorkflowService] Executing workflow: ${workflow.name}`);

    const executionPromise = this.runWorkflow(workflow, context);
    this.activeExecutions.set(id, executionPromise);

    executionPromise.finally(() => {
      this.activeExecutions.delete(id);
    });

    return executionPromise;
  }

  private async runWorkflow(
    workflow: Workflow,
    context: Record<string, any>
  ): Promise<WorkflowExecutionResult> {
    const startedAt = Date.now();
    const executedActions: string[] = [];
    const errors: string[] = [];

    try {
      workflow.runCount++;
      workflow.lastRun = startedAt;

      const conditionsMet = this.evaluateConditions(workflow.conditions, context);

      if (!conditionsMet) {
        console.log(`[WorkflowService] Conditions not met for workflow ${workflow.id}`);
        return {
          workflowId: workflow.id,
          success: false,
          executedActions: [],
          errors: ['Conditions not met'],
          startedAt,
          completedAt: Date.now(),
          duration: Date.now() - startedAt,
        };
      }

      const sortedActions = [...workflow.actions].sort((a, b) => a.order - b.order);

      for (const action of sortedActions) {
        try {
          await this.executeAction(action, context);
          executedActions.push(action.type);
        } catch (error: any) {
          console.error(`[WorkflowService] Action ${action.type} failed:`, error);
          errors.push(`${action.type}: ${error.message}`);
        }
      }

      const success = errors.length === 0;
      if (success) {
        workflow.successCount++;
      } else {
        workflow.failureCount++;
      }

      await this.saveWorkflows();

      return {
        workflowId: workflow.id,
        success,
        executedActions,
        errors,
        startedAt,
        completedAt: Date.now(),
        duration: Date.now() - startedAt,
      };
    } catch (error: any) {
      workflow.failureCount++;
      await this.saveWorkflows();

      return {
        workflowId: workflow.id,
        success: false,
        executedActions,
        errors: [error.message],
        startedAt,
        completedAt: Date.now(),
        duration: Date.now() - startedAt,
      };
    }
  }

  private evaluateConditions(
    conditions: WorkflowCondition[],
    context: Record<string, any>
  ): boolean {
    if (conditions.length === 0) return true;

    return conditions.every(condition => {
      const value = this.getNestedValue(context, condition.field);

      switch (condition.operator) {
        case 'equals':
          return value === condition.value;
        case 'contains':
          return String(value).includes(String(condition.value));
        case 'greater':
          return Number(value) > Number(condition.value);
        case 'less':
          return Number(value) < Number(condition.value);
        case 'between':
          if (Array.isArray(condition.value) && condition.value.length === 2) {
            return Number(value) >= condition.value[0] && Number(value) <= condition.value[1];
          }
          return false;
        default:
          return false;
      }
    });
  }

  private async executeAction(
    action: WorkflowAction,
    context: Record<string, any>
  ): Promise<void> {
    console.log(`[WorkflowService] Executing action: ${action.type}`);

    try {
      const response = await APIClient.post('/workflows/actions/execute', {
        type: action.type,
        config: action.config,
        context,
      });

      if (!response.success) {
        throw new Error(`Action execution failed: ${response.error?.message}`);
      }
    } catch (error) {
      console.error(`[WorkflowService] Action ${action.type} execution error:`, error);
      throw error;
    }
  }

  private activateWorkflow(id: string): void {
    const workflow = this.workflows.get(id);
    if (!workflow) return;

    console.log(`[WorkflowService] Activating workflow: ${workflow.name}`);

    if (workflow.trigger.type === 'schedule') {
      this.scheduleWorkflow(workflow);
    }
  }

  private deactivateWorkflow(id: string): void {
    console.log(`[WorkflowService] Deactivating workflow: ${id}`);
  }

  private scheduleWorkflow(workflow: Workflow): void {
    if (workflow.trigger.type !== 'schedule') return;

    const interval = workflow.trigger.config.interval as number;
    if (!interval) return;

    setInterval(() => {
      if (workflow.isActive) {
        this.executeWorkflow(workflow.id);
      }
    }, interval);
  }

  private startActiveWorkflows(): void {
    const activeWorkflows = Array.from(this.workflows.values()).filter(wf => wf.isActive);
    console.log(`[WorkflowService] Starting ${activeWorkflows.length} active workflows`);

    activeWorkflows.forEach(workflow => {
      if (workflow.trigger.type === 'schedule') {
        this.scheduleWorkflow(workflow);
      }
    });
  }

  private getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  getWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  getWorkflow(id: string): Workflow | undefined {
    return this.workflows.get(id);
  }

  getActiveWorkflows(): Workflow[] {
    return this.getWorkflows().filter(wf => wf.isActive);
  }

  async testWorkflow(id: string, testContext: Record<string, any> = {}): Promise<{
    conditionsPassed: boolean;
    estimatedActions: string[];
    warnings: string[];
  }> {
    const workflow = this.workflows.get(id);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    console.log(`[WorkflowService] Testing workflow: ${workflow.name}`);

    const conditionsPassed = this.evaluateConditions(workflow.conditions, testContext);
    const estimatedActions = workflow.actions
      .sort((a, b) => a.order - b.order)
      .map(a => a.type);

    const warnings: string[] = [];

    if (!conditionsPassed) {
      warnings.push('Conditions would not be met with provided test context');
    }

    if (workflow.actions.length === 0) {
      warnings.push('No actions configured');
    }

    return {
      conditionsPassed,
      estimatedActions,
      warnings,
    };
  }
}

export default new WorkflowService();
