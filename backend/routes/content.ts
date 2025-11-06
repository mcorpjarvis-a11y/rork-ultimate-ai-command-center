import express, { Request, Response, Router } from 'express';

const router: Router = express.Router();

interface Content {
  id: string;
  createdAt: number;
  updatedAt: number;
  status?: string;
  type?: string;
  platforms?: string[];
  [key: string]: any;
}

// In-memory content storage
const contentStore = new Map<string, Content>();

// POST /api/content - Create content
router.post('/', (req: Request<{}, {}, Partial<Content>>, res: Response) => {
  const content = req.body;
  const id = content.id || 'content_' + Date.now();
  
  const storedContent: Content = {
    ...content,
    id,
    createdAt: content.createdAt || Date.now(),
    updatedAt: Date.now()
  };
  
  contentStore.set(id, storedContent);
  
  res.json(storedContent);
});

// GET /api/content/:id - Get content
router.get('/:id', (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  const content = contentStore.get(id);
  
  if (!content) {
    return res.status(404).json({ error: 'Content not found' });
  }
  
  res.json(content);
});

// PUT /api/content/:id - Update content
router.put('/:id', (req: Request<{ id: string }, {}, Partial<Content>>, res: Response) => {
  const { id } = req.params;
  const existing = contentStore.get(id);
  
  if (!existing) {
    return res.status(404).json({ error: 'Content not found' });
  }
  
  const updated: Content = {
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
router.delete('/:id', (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  
  if (!contentStore.has(id)) {
    return res.status(404).json({ error: 'Content not found' });
  }
  
  contentStore.delete(id);
  res.json({ success: true, id });
});

// GET /api/content - List all content
router.get('/', (req: Request, res: Response) => {
  const { status, type, platform, limit = '50' } = req.query;
  
  let content = Array.from(contentStore.values());
  
  if (status && typeof status === 'string') {
    content = content.filter(c => c.status === status);
  }
  if (type && typeof type === 'string') {
    content = content.filter(c => c.type === type);
  }
  if (platform && typeof platform === 'string') {
    content = content.filter(c => c.platforms && c.platforms.includes(platform));
  }
  
  const limitNum = parseInt(typeof limit === 'string' ? limit : '50', 10);
  content = content.slice(0, limitNum);
  
  res.json(content);
});

export default router;
