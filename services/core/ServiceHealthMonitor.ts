/**
 * Service Health Monitor
 * 
 * Monitors the health and status of all JARVIS services
 */

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  lastCheck: number;
  uptime?: number;
  message?: string;
  error?: string;
}

export interface ServiceHealthReport {
  timestamp: number;
  overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  services: ServiceHealth[];
}

class ServiceHealthMonitor {
  private static instance: ServiceHealthMonitor;
  private healthChecks: Map<string, ServiceHealth> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): ServiceHealthMonitor {
    if (!ServiceHealthMonitor.instance) {
      ServiceHealthMonitor.instance = new ServiceHealthMonitor();
    }
    return ServiceHealthMonitor.instance;
  }

  /**
   * Register a service for health monitoring
   */
  registerService(
    name: string,
    checkFn?: () => Promise<ServiceHealth>
  ): void {
    if (!this.healthChecks.has(name)) {
      this.healthChecks.set(name, {
        name,
        status: 'unknown',
        lastCheck: Date.now(),
      });
    }
  }

  /**
   * Update service health status
   */
  updateServiceHealth(name: string, health: Partial<ServiceHealth>): void {
    const existing = this.healthChecks.get(name) || {
      name,
      status: 'unknown' as const,
      lastCheck: Date.now(),
    };

    this.healthChecks.set(name, {
      ...existing,
      ...health,
      lastCheck: Date.now(),
    });
  }

  /**
   * Get health status for a specific service
   */
  getServiceHealth(name: string): ServiceHealth | undefined {
    return this.healthChecks.get(name);
  }

  /**
   * Get overall health report
   */
  getHealthReport(): ServiceHealthReport {
    const services = Array.from(this.healthChecks.values());
    
    // Determine overall status
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    const unhealthyCount = services.filter(s => s.status === 'unhealthy').length;
    const degradedCount = services.filter(s => s.status === 'degraded').length;

    if (unhealthyCount > 0) {
      overallStatus = 'unhealthy';
    } else if (degradedCount > 0) {
      overallStatus = 'degraded';
    }

    return {
      timestamp: Date.now(),
      overallStatus,
      services,
    };
  }

  /**
   * Start periodic health monitoring
   */
  startMonitoring(intervalMs: number = 30000): void {
    if (this.monitoringInterval) {
      return;
    }

    this.monitoringInterval = setInterval(() => {
      this.performHealthChecks();
    }, intervalMs);

    // Perform initial check
    this.performHealthChecks();
  }

  /**
   * Stop health monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Perform health checks on all registered services
   */
  private performHealthChecks(): void {
    const report = this.getHealthReport();
    
    // Log health status
    const unhealthy = report.services.filter(s => s.status === 'unhealthy');
    const degraded = report.services.filter(s => s.status === 'degraded');

    if (unhealthy.length > 0) {
      console.warn('[ServiceHealthMonitor] Unhealthy services:', 
        unhealthy.map(s => s.name).join(', '));
    }
    
    if (degraded.length > 0) {
      console.warn('[ServiceHealthMonitor] Degraded services:', 
        degraded.map(s => s.name).join(', '));
    }
  }

  /**
   * Clear all health checks
   */
  clear(): void {
    this.healthChecks.clear();
    this.stopMonitoring();
  }
}

export default ServiceHealthMonitor.getInstance();
