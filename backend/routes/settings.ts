import express, { Request, Response, Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileOperationsLimiter, writeLimiter } from '../middleware/rateLimiting';

const router: Router = express.Router();

const DATA_DIR = path.join(__dirname, '../data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

interface Settings {
  voice?: { enabled: boolean; autoSpeak: boolean; rate: number; pitch: number };
  ai?: { defaultModel: string; temperature: number; maxTokens: number };
  integrations?: { autoConnect: boolean };
  ui?: { theme: string; animations: boolean };
  [key: string]: any;
}

// Ensure data directory exists
fs.mkdir(DATA_DIR, { recursive: true }).catch(console.error);

// Get all settings
router.get('/', fileOperationsLimiter, async (req: Request, res: Response) => {
  try {
    const exists = await fs.access(SETTINGS_FILE).then(() => true).catch(() => false);
    
    if (!exists) {
      // Return default settings
      return res.json({
        voice: { enabled: true, autoSpeak: true, rate: 1.1, pitch: 0.9 },
        ai: { defaultModel: 'groq', temperature: 0.7, maxTokens: 500 },
        integrations: { autoConnect: true },
        ui: { theme: 'dark', animations: true }
      });
    }

    const content = await fs.readFile(SETTINGS_FILE, 'utf8');
    const settings: Settings = JSON.parse(content);

    res.json(settings);
  } catch (error) {
    console.error('[Settings] Get error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

// Update settings
router.post('/', writeLimiter, async (req: Request<{}, {}, Settings>, res: Response) => {
  try {
    const settings = req.body;

    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));

    res.json({ success: true, settings });
  } catch (error) {
    console.error('[Settings] Update error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

// Get specific setting
router.get('/:key', fileOperationsLimiter, async (req: Request<{ key: string }>, res: Response) => {
  try {
    const exists = await fs.access(SETTINGS_FILE).then(() => true).catch(() => false);
    
    if (!exists) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    const content = await fs.readFile(SETTINGS_FILE, 'utf8');
    const settings: Settings = JSON.parse(content);
    const value = settings[req.params.key];

    if (value === undefined) {
      return res.status(404).json({ error: 'Setting key not found' });
    }

    res.json({ key: req.params.key, value });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

// Update specific setting
router.put('/:key', writeLimiter, async (req: Request<{ key: string }, {}, { value: any }>, res: Response) => {
  try {
    const exists = await fs.access(SETTINGS_FILE).then(() => true).catch(() => false);
    let settings: Settings = {};

    if (exists) {
      const content = await fs.readFile(SETTINGS_FILE, 'utf8');
      settings = JSON.parse(content);
    }

    settings[req.params.key] = req.body.value;

    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));

    res.json({ success: true, key: req.params.key, value: req.body.value });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
