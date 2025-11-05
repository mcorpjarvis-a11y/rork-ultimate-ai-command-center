const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const LOGS_DIR = path.join(__dirname, '../data/logs');
const LOGS_FILE = path.join(LOGS_DIR, 'system.log');

// Ensure logs directory exists
fs.mkdir(LOGS_DIR, { recursive: true }).catch(console.error);

// Add log entry
router.post('/', async (req, res) => {
  try {
    const { level, message, category, metadata } = req.body;

    const logEntry = {
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
    res.status(500).json({ error: error.message });
  }
});

// Get logs
router.get('/', async (req, res) => {
  try {
    const { limit = 100, level, category } = req.query;

    const exists = await fs.access(LOGS_FILE).then(() => true).catch(() => false);
    if (!exists) {
      return res.json({ logs: [] });
    }

    const content = await fs.readFile(LOGS_FILE, 'utf8');
    let logs = content
      .split('\n')
      .filter(line => line.trim())
      .map(line => JSON.parse(line));

    // Filter by level
    if (level) {
      logs = logs.filter(log => log.level === level);
    }

    // Filter by category
    if (category) {
      logs = logs.filter(log => log.category === category);
    }

    // Limit results
    logs = logs.slice(-parseInt(limit));

    res.json({ logs, count: logs.length });
  } catch (error) {
    console.error('[Logs] Get error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Clear logs
router.delete('/', async (req, res) => {
  try {
    await fs.writeFile(LOGS_FILE, '');
    res.json({ success: true, message: 'Logs cleared' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
