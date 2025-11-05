const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const MEDIA_DIR = path.join(__dirname, '../data/media');

// Ensure media directory exists
fs.mkdir(MEDIA_DIR, { recursive: true }).catch(console.error);

// Upload media
router.post('/upload', async (req, res) => {
  try {
    const { filename, data, type } = req.body;

    if (!filename || !data) {
      return res.status(400).json({ error: 'Filename and data required' });
    }

    const filepath = path.join(MEDIA_DIR, filename);
    const buffer = Buffer.from(data, 'base64');

    await fs.writeFile(filepath, buffer);

    res.json({
      success: true,
      filename,
      path: `/api/media/file/${filename}`,
      size: buffer.length,
      type
    });
  } catch (error) {
    console.error('[Media] Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get media file
router.get('/file/:filename', async (req, res) => {
  try {
    const filepath = path.join(MEDIA_DIR, req.params.filename);
    const exists = await fs.access(filepath).then(() => true).catch(() => false);

    if (!exists) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.sendFile(filepath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List media files
router.get('/list', async (req, res) => {
  try {
    const files = await fs.readdir(MEDIA_DIR);
    const fileStats = await Promise.all(
      files.map(async (file) => {
        const stats = await fs.stat(path.join(MEDIA_DIR, file));
        return {
          filename: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        };
      })
    );

    res.json({ files: fileStats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete media file
router.delete('/file/:filename', async (req, res) => {
  try {
    const filepath = path.join(MEDIA_DIR, req.params.filename);
    await fs.unlink(filepath);

    res.json({ success: true, message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
