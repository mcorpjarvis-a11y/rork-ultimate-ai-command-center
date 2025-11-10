/**
 * Service Status API Routes
 * 
 * Provides endpoints for monitoring service health and status
 */

import { Router } from 'express';

const router = Router();

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  uptime?: number;
  lastCheck?: number;
  message?: string;
}

interface SystemStatus {
  status: 'online' | 'degraded' | 'offline';
  timestamp: number;
  services: ServiceStatus[];
  version: string;
}

// In-memory service status tracking
const serviceStatuses = new Map<string, ServiceStatus>();

// Initialize default services
const defaultServices = [
  'backend',
  'frontend',
  'websocket',
  'speech-recognition',
  'always-listening',
];

defaultServices.forEach(service => {
  serviceStatuses.set(service, {
    name: service,
    status: 'online',
    lastCheck: Date.now(),
  });
});

// Mark backend as online
serviceStatuses.set('backend', {
  name: 'backend',
  status: 'online',
  uptime: process.uptime(),
  lastCheck: Date.now(),
  message: 'Backend server running',
});

/**
 * GET /api/services/status
 * Get overall system status
 */
router.get('/status', (req, res) => {
  const services = Array.from(serviceStatuses.values());
  
  // Determine overall status
  const offlineCount = services.filter(s => s.status === 'offline').length;
  const degradedCount = services.filter(s => s.status === 'degraded').length;
  
  let overallStatus: 'online' | 'degraded' | 'offline' = 'online';
  if (offlineCount > services.length / 2) {
    overallStatus = 'offline';
  } else if (offlineCount > 0 || degradedCount > 0) {
    overallStatus = 'degraded';
  }

  const status: SystemStatus = {
    status: overallStatus,
    timestamp: Date.now(),
    services,
    version: process.env.npm_package_version || '1.0.0',
  };

  res.json(status);
});

/**
 * GET /api/services/:serviceName
 * Get status of a specific service
 */
router.get('/:serviceName', (req, res) => {
  const { serviceName } = req.params;
  const service = serviceStatuses.get(serviceName);

  if (!service) {
    return res.status(404).json({
      error: 'Service not found',
      serviceName,
    });
  }

  res.json(service);
});

/**
 * POST /api/services/:serviceName/status
 * Update status of a specific service
 */
router.post('/:serviceName/status', (req, res) => {
  const { serviceName } = req.params;
  const { status, message } = req.body;

  if (!['online', 'offline', 'degraded'].includes(status)) {
    return res.status(400).json({
      error: 'Invalid status value',
      validValues: ['online', 'offline', 'degraded'],
    });
  }

  const existingService = serviceStatuses.get(serviceName) || {
    name: serviceName,
    status: 'offline' as const,
  };

  const updatedService: ServiceStatus = {
    ...existingService,
    status,
    message,
    lastCheck: Date.now(),
  };

  serviceStatuses.set(serviceName, updatedService);

  res.json(updatedService);
});

/**
 * GET /api/services/health/check
 * Perform health check on all services
 */
router.get('/health/check', async (req, res) => {
  // Update backend status
  serviceStatuses.set('backend', {
    name: 'backend',
    status: 'online',
    uptime: process.uptime(),
    lastCheck: Date.now(),
    message: 'Backend server healthy',
  });

  const services = Array.from(serviceStatuses.values());
  const healthyCount = services.filter(s => s.status === 'online').length;
  const totalCount = services.length;

  res.json({
    healthy: healthyCount === totalCount,
    healthyCount,
    totalCount,
    services,
    timestamp: Date.now(),
  });
});

/**
 * DELETE /api/services/:serviceName
 * Remove a service from monitoring
 */
router.delete('/:serviceName', (req, res) => {
  const { serviceName } = req.params;
  
  if (serviceStatuses.has(serviceName)) {
    serviceStatuses.delete(serviceName);
    res.json({ message: 'Service removed', serviceName });
  } else {
    res.status(404).json({ error: 'Service not found', serviceName });
  }
});

export default router;
