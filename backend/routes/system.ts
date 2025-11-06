import express, { Request, Response, Router } from 'express';
import os from 'os';

const router: Router = express.Router();

const startTime = Date.now();

// System status
router.get('/status', (req: Request, res: Response) => {
  const uptime = Date.now() - startTime;
  
  res.json({
    online: true,
    uptime: uptime,
    uptimeFormatted: formatUptime(uptime),
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    platform: os.platform(),
    nodeVersion: process.version
  });
});

// Health check
router.get('/health', (req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();
  
  res.json({
    status: 'healthy',
    memory: {
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
      external: Math.round(memoryUsage.external / 1024 / 1024) + ' MB'
    },
    cpu: {
      loadAverage: os.loadavg(),
      cores: os.cpus().length
    },
    uptime: Date.now() - startTime
  });
});

// API info
router.get('/info', (req: Request, res: Response) => {
  res.json({
    name: 'JARVIS Backend API',
    version: '1.0.0',
    description: 'Just A Rather Very Intelligent System - Backend Server',
    endpoints: {
      voice: '/api/voice',
      ask: '/api/ask',
      integrations: '/api/integrations',
      media: '/api/media',
      logs: '/api/logs',
      settings: '/api/settings',
      system: '/api/system'
    },
    documentation: 'See UNIFIED_STARTUP.md for full documentation'
  });
});

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export default router;
