import express, { Request, Response, Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileOperationsLimiter, writeLimiter } from '../middleware/rateLimiting';

const router: Router = express.Router();

const LOGS_DIR = path.join(__dirname, '../data/logs');
const LOGS_FILE = path.join(LOGS_DIR, 'system.log');

interface LogEntry {
  timestamp: string;
  level: string;
  category: string;
  message: string;
  metadata: Record<string, any>;
}

interface LogRequestBody {
  level?: string;
  message: string;
  category?: string;
  metadata?: Record<string, any>;
}

// Ensure logs directory exists
fs.mkdir(LOGS_DIR, { recursive: true }).catch(console.error);

// Add log entry
router.post('/', writeLimiter, async (req: Request<{}, {}, LogRequestBody>, res: Response) => {
  try {
    const { level, message, category, metadata } = req.body;

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: level || 'info',
      category: category || 'general',
      message,
      metadata: metadata || {}
    };

    const logLine = JSON.stringify(logEntry) + '\n';
    await fs.appendFile(LOGS_FILE, logLine);

    res.json({ success: true, log: logEntry });
  } catch (error) {
    console.error('[Logs] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

// Get logs
router.get('/', fileOperationsLimiter, async (req: Request, res: Response) => {
  try {
    const { limit = '100', level, category } = req.query;

    const exists = await fs.access(LOGS_FILE).then(() => true).catch(() => false);
    if (!exists) {
      return res.json({ logs: [] });
    }

    const content = await fs.readFile(LOGS_FILE, 'utf8');
    let logs: LogEntry[] = content
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line));

    // Filter by level
    if (level && typeof level === 'string') {
      logs = logs.filter(log => log.level === level);
    }

    // Filter by category
    if (category && typeof category === 'string') {
      logs = logs.filter(log => log.category === category);
    }

    // Limit results
    const limitNum = parseInt(typeof limit === 'string' ? limit : '100', 10);
    logs = logs.slice(-limitNum);

    res.json({ logs, count: logs.length });
  } catch (error) {
    console.error('[Logs] Get error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

// Clear logs
router.delete('/', writeLimiter, async (req: Request, res: Response) => {
  try {
    await fs.writeFile(LOGS_FILE, '');
    res.json({ success: true, message: 'Logs cleared' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
