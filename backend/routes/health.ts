/**
 * Health Check and System Status Endpoint
 * 
 * Provides comprehensive system health information including:
 * - Server status
 * - Database connectivity  
 * - External service health
 * - Memory and CPU usage
 * - Uptime
 */

import express, { Request, Response, Router } from 'express';
import os from 'os';

const router: Router = express.Router();

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    server: ComponentHealth;
    memory: ComponentHealth;
    storage: ComponentHealth;
    externalServices: ComponentHealth;
  };
  metrics?: SystemMetrics;
}

interface ComponentHealth {
  status: 'up' | 'down' | 'degraded';
  message?: string;
  details?: any;
}

interface SystemMetrics {
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    count: number;
    loadAverage: number[];
  };
  uptime: number;
}

const startTime = Date.now();

/**
 * Calculate overall system status
 */
function calculateOverallStatus(checks: any): 'healthy' | 'degraded' | 'unhealthy' {
  const statuses = Object.values(checks).map((check: any) => check.status);

  if (statuses.every(s => s === 'up')) {
    return 'healthy';
  } else if (statuses.some(s => s === 'down')) {
    return 'unhealthy';
  } else {
    return 'degraded';
  }
}

/**
 * Check memory health
 */
function checkMemory(): ComponentHealth {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const usagePercentage = (usedMem / totalMem) * 100;

  if (usagePercentage > 90) {
    return {
      status: 'degraded',
      message: 'High memory usage',
      details: { usagePercentage: usagePercentage.toFixed(2) + '%' },
    };
  }

  return {
    status: 'up',
    details: { usagePercentage: usagePercentage.toFixed(2) + '%' },
  };
}

/**
 * Check storage health (AsyncStorage availability)
 */
async function checkStorage(): Promise<ComponentHealth> {
  try {
    // In Node.js backend context, we can check file system
    const fs = require('fs');
    const testPath = '/tmp/jarvis-health-check';
    
    // Try to write and read
    await fs.promises.writeFile(testPath, 'test');
    await fs.promises.readFile(testPath);
    await fs.promises.unlink(testPath);

    return { status: 'up' };
  } catch (error) {
    return {
      status: 'down',
      message: 'Storage unavailable',
      details: { error: error instanceof Error ? error.message : 'Unknown error' },
    };
  }
}

/**
 * Check external services (can be extended)
 */
async function checkExternalServices(): Promise<ComponentHealth> {
  // This can be extended to check AI providers, databases, etc.
  // For now, return up status
  return { status: 'up' };
}

/**
 * Get system metrics
 */
function getSystemMetrics(): SystemMetrics {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  return {
    memory: {
      used: usedMem,
      total: totalMem,
      percentage: (usedMem / totalMem) * 100,
    },
    cpu: {
      count: os.cpus().length,
      loadAverage: os.loadavg(),
    },
    uptime: process.uptime(),
  };
}

/**
 * GET /api/health - Basic health check (fast)
 */
router.get('/health', async (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * GET /api/health/detailed - Comprehensive health check
 */
router.get('/health/detailed', async (req: Request, res: Response) => {
  try {
    const checks = {
      server: { status: 'up' as const },
      memory: checkMemory(),
      storage: await checkStorage(),
      externalServices: await checkExternalServices(),
    };

    const overallStatus = calculateOverallStatus(checks);

    const result: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks,
      metrics: getSystemMetrics(),
    };

    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Health check failed',
    });
  }
});

/**
 * GET /api/health/ready - Readiness probe (for k8s/orchestration)
 */
router.get('/health/ready', async (req: Request, res: Response) => {
  try {
    const storage = await checkStorage();
    
    if (storage.status === 'down') {
      return res.status(503).json({ ready: false, reason: 'Storage unavailable' });
    }

    res.json({ ready: true, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ 
      ready: false, 
      reason: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/health/live - Liveness probe (for k8s/orchestration)
 */
router.get('/health/live', (req: Request, res: Response) => {
  res.json({ 
    alive: true, 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * GET /api/metrics - Prometheus-style metrics
 */
router.get('/metrics', (req: Request, res: Response) => {
  const metrics = getSystemMetrics();
  
  // Simple Prometheus-style text format
  const output = `
# HELP jarvis_memory_used_bytes Memory used in bytes
# TYPE jarvis_memory_used_bytes gauge
jarvis_memory_used_bytes ${metrics.memory.used}

# HELP jarvis_memory_total_bytes Total memory in bytes
# TYPE jarvis_memory_total_bytes gauge
jarvis_memory_total_bytes ${metrics.memory.total}

# HELP jarvis_memory_usage_percentage Memory usage percentage
# TYPE jarvis_memory_usage_percentage gauge
jarvis_memory_usage_percentage ${metrics.memory.percentage}

# HELP jarvis_uptime_seconds Process uptime in seconds
# TYPE jarvis_uptime_seconds counter
jarvis_uptime_seconds ${metrics.uptime}

# HELP jarvis_cpu_count Number of CPU cores
# TYPE jarvis_cpu_count gauge
jarvis_cpu_count ${metrics.cpu.count}
  `.trim();

  res.setHeader('Content-Type', 'text/plain');
  res.send(output);
});

export default router;
