const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Ensure data directory exists
fs.mkdir(DATA_DIR, { recursive: true }).catch(console.error);

// Get all settings
router.get('/', async (req, res) => {
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
    const settings = JSON.parse(content);

    res.json(settings);
  } catch (error) {
    console.error('[Settings] Get error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update settings
router.post('/', async (req, res) => {
  try {
    const settings = req.body;

    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));

    res.json({ success: true, settings });
  } catch (error) {
    console.error('[Settings] Update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific setting
router.get('/:key', async (req, res) => {
  try {
    const exists = await fs.access(SETTINGS_FILE).then(() => true).catch(() => false);
    
    if (!exists) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    const content = await fs.readFile(SETTINGS_FILE, 'utf8');
    const settings = JSON.parse(content);
    const value = settings[req.params.key];

    if (value === undefined) {
      return res.status(404).json({ error: 'Setting key not found' });
    }

    res.json({ key: req.params.key, value });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update specific setting
router.put('/:key', async (req, res) => {
  try {
    const exists = await fs.access(SETTINGS_FILE).then(() => true).catch(() => false);
    let settings = {};

    if (exists) {
      const content = await fs.readFile(SETTINGS_FILE, 'utf8');
      settings = JSON.parse(content);
    }

    settings[req.params.key] = req.body.value;

    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));

    res.json({ success: true, key: req.params.key, value: req.body.value });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
