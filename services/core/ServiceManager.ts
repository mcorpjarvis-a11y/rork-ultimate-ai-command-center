/**
 * Service Manager
 * 
 * Central orchestration for JARVIS services with dependency resolution,
 * health monitoring, and graceful degradation
 */

import ServiceHealthMonitor from './ServiceHealthMonitor';

export interface ServiceConfig {
  name: string;
  dependencies?: string[];
  required: boolean;
  initFn: () => Promise<void>;
  stopFn?: () => Promise<void>;
  healthCheckFn?: () => Promise<boolean>;
}

export interface ServiceStatus {
  name: string;
  status: 'pending' | 'starting' | 'running' | 'stopped' | 'error' | 'degraded';
  startTime?: number;
  error?: string;
  required: boolean;
}

class ServiceManager {
  private static instance: ServiceManager;
  private services: Map<string, ServiceConfig> = new Map();
  private serviceStatuses: Map<string, ServiceStatus> = new Map();

  private constructor() {}

  static getInstance(): ServiceManager {
    if (!ServiceManager.instance) {
      ServiceManager.instance = new ServiceManager();
    }
    return ServiceManager.instance;
  }

  /**
   * Register a service for management
   */
  registerService(config: ServiceConfig): void {
    this.services.set(config.name, config);
    this.serviceStatuses.set(config.name, {
      name: config.name,
      status: 'pending',
      required: config.required,
    });

    // Register with health monitor
    ServiceHealthMonitor.registerService(config.name);
  }

  /**
   * Start all registered services in dependency order
   */
  async startAll(): Promise<void> {
    console.log('[ServiceManager] Starting all services...');

    const startOrder = this.resolveDependencyOrder();
    
    for (const serviceName of startOrder) {
      await this.startService(serviceName);
    }

    console.log('[ServiceManager] All services started');
  }

  /**
   * Start a specific service
   */
  async startService(name: string): Promise<void> {
    const config = this.services.get(name);
    const status = this.serviceStatuses.get(name);

    if (!config || !status) {
      console.error(`[ServiceManager] Service not found: ${name}`);
      return;
    }

    // Skip if already running
    if (status.status === 'running') {
      return;
    }

    // Check dependencies
    if (config.dependencies) {
      for (const dep of config.dependencies) {
        const depStatus = this.serviceStatuses.get(dep);
        if (!depStatus || depStatus.status !== 'running') {
          if (config.required) {
            throw new Error(
              `Cannot start ${name}: dependency ${dep} is not running`
            );
          } else {
            console.warn(
              `[ServiceManager] Starting ${name} with missing dependency: ${dep}`
            );
            status.status = 'degraded';
            ServiceHealthMonitor.updateServiceHealth(name, {
              status: 'degraded',
              message: `Missing dependency: ${dep}`,
            });
          }
        }
      }
    }

    try {
      console.log(`[ServiceManager] Starting service: ${name}`);
      status.status = 'starting';

      await config.initFn();

      status.status = 'running';
      status.startTime = Date.now();

      ServiceHealthMonitor.updateServiceHealth(name, {
        status: 'healthy',
        message: 'Service started successfully',
        uptime: 0,
      });

      console.log(`[ServiceManager] ✅ Service started: ${name}`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      status.status = 'error';
      status.error = errorMsg;

      ServiceHealthMonitor.updateServiceHealth(name, {
        status: config.required ? 'unhealthy' : 'degraded',
        error: errorMsg,
        message: config.required 
          ? 'Critical service failed to start'
          : 'Non-critical service failed (gracefully degraded)',
      });

      if (config.required) {
        console.error(`[ServiceManager] ❌ Critical service failed: ${name}`, error);
        throw error;
      } else {
        console.warn(`[ServiceManager] ⚠️ Non-critical service failed: ${name}`, error);
      }
    }
  }

  /**
   * Stop a specific service
   */
  async stopService(name: string): Promise<void> {
    const config = this.services.get(name);
    const status = this.serviceStatuses.get(name);

    if (!config || !status) {
      return;
    }

    try {
      if (config.stopFn) {
        await config.stopFn();
      }
      status.status = 'stopped';
      ServiceHealthMonitor.updateServiceHealth(name, {
        status: 'unknown',
        message: 'Service stopped',
      });
    } catch (error) {
      console.error(`[ServiceManager] Error stopping service: ${name}`, error);
    }
  }

  /**
   * Stop all services
   */
  async stopAll(): Promise<void> {
    console.log('[ServiceManager] Stopping all services...');

    // Stop in reverse order
    const stopOrder = this.resolveDependencyOrder().reverse();

    for (const serviceName of stopOrder) {
      await this.stopService(serviceName);
    }

    console.log('[ServiceManager] All services stopped');
  }

  /**
   * Get status of all services
   */
  getServiceStatuses(): ServiceStatus[] {
    return Array.from(this.serviceStatuses.values());
  }

  /**
   * Get status of a specific service
   */
  getServiceStatus(name: string): ServiceStatus | undefined {
    return this.serviceStatuses.get(name);
  }

  /**
   * Resolve dependency order using topological sort
   */
  private resolveDependencyOrder(): string[] {
    const visited = new Set<string>();
    const order: string[] = [];

    const visit = (serviceName: string) => {
      if (visited.has(serviceName)) {
        return;
      }

      visited.add(serviceName);

      const config = this.services.get(serviceName);
      if (config?.dependencies) {
        for (const dep of config.dependencies) {
          if (this.services.has(dep)) {
            visit(dep);
          }
        }
      }

      order.push(serviceName);
    };

    for (const serviceName of this.services.keys()) {
      visit(serviceName);
    }

    return order;
  }

  /**
   * Clear all services
   */
  clear(): void {
    this.services.clear();
    this.serviceStatuses.clear();
  }
}

export default ServiceManager.getInstance();
