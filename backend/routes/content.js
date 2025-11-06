const express = require('express');
const router = express.Router();

// In-memory content storage
const contentStore = new Map();

// POST /api/content - Create content
router.post('/', (req, res) => {
  const content = req.body;
  const id = content.id || 'content_' + Date.now();
  
  const storedContent = {
    ...content,
    id,
    createdAt: content.createdAt || Date.now(),
    updatedAt: Date.now()
  };
  
  contentStore.set(id, storedContent);
  
  res.json(storedContent);
});

// GET /api/content/:id - Get content
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const content = contentStore.get(id);
  
  if (!content) {
    return res.status(404).json({ error: 'Content not found' });
  }
  
  res.json(content);
});

// PUT /api/content/:id - Update content
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const existing = contentStore.get(id);
  
  if (!existing) {
    return res.status(404).json({ error: 'Content not found' });
  }
  
  const updated = {
    ...existing,
    ...req.body,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: Date.now()
  };
  
  contentStore.set(id, updated);
  res.json(updated);
});

// DELETE /api/content/:id - Delete content
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  if (!contentStore.has(id)) {
    return res.status(404).json({ error: 'Content not found' });
  }
  
  contentStore.delete(id);
  res.json({ success: true, id });
});

// GET /api/content - List all content
router.get('/', (req, res) => {
  const { status, type, platform, limit = 50 } = req.query;
  
  let content = Array.from(contentStore.values());
  
  if (status) {
    content = content.filter(c => c.status === status);
  }
  if (type) {
    content = content.filter(c => c.type === type);
  }
  if (platform) {
    content = content.filter(c => c.platforms && c.platforms.includes(platform));
  }
  
  content = content.slice(0, parseInt(limit));
  
  res.json(content);
});

module.exports = router;
