import express, { Request, Response, Router } from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileOperationsLimiter, writeLimiter } from '../middleware/rateLimiting';

const router: Router = express.Router();

const MEDIA_DIR = path.join(__dirname, '../data/media');

interface UploadRequestBody {
  filename: string;
  data: string;
  type?: string;
}

interface FileStats {
  filename: string;
  size: number;
  created: Date;
  modified: Date;
}

// Helper function to sanitize filename and prevent path traversal
function sanitizeFilename(filename: string): string {
  // Remove any path components and keep only the filename
  const basename = path.basename(filename);
  // Remove any non-alphanumeric characters except dots, dashes, and underscores
  return basename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

// Ensure media directory exists
fs.mkdir(MEDIA_DIR, { recursive: true }).catch(console.error);

// Upload media
router.post('/upload', writeLimiter, async (req: Request<{}, {}, UploadRequestBody>, res: Response) => {
  try {
    const { filename, data, type } = req.body;

    if (!filename || !data) {
      return res.status(400).json({ error: 'Filename and data required' });
    }

    // Sanitize filename to prevent path traversal
    const sanitizedFilename = sanitizeFilename(filename);
    const filepath = path.join(MEDIA_DIR, sanitizedFilename);
    
    // Verify the resolved path is still within MEDIA_DIR
    if (!filepath.startsWith(MEDIA_DIR)) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const buffer = Buffer.from(data, 'base64');

    await fs.writeFile(filepath, buffer);

    res.json({
      success: true,
      filename: sanitizedFilename,
      path: `/api/media/file/${sanitizedFilename}`,
      size: buffer.length,
      type
    });
  } catch (error) {
    console.error('[Media] Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

// Get media file
router.get('/file/:filename', fileOperationsLimiter, async (req: Request<{ filename: string }>, res: Response) => {
  try {
    // Sanitize filename to prevent path traversal
    const sanitizedFilename = sanitizeFilename(req.params.filename);
    const filepath = path.join(MEDIA_DIR, sanitizedFilename);
    
    // Verify the resolved path is still within MEDIA_DIR
    if (!filepath.startsWith(MEDIA_DIR)) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const exists = await fs.access(filepath).then(() => true).catch(() => false);

    if (!exists) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.sendFile(filepath);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

// List media files
router.get('/list', fileOperationsLimiter, async (req: Request, res: Response) => {
  try {
    const files = await fs.readdir(MEDIA_DIR);
    const fileStats: FileStats[] = await Promise.all(
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

// Delete media file
router.delete('/file/:filename', writeLimiter, async (req: Request<{ filename: string }>, res: Response) => {
  try {
    // Sanitize filename to prevent path traversal
    const sanitizedFilename = sanitizeFilename(req.params.filename);
    const filepath = path.join(MEDIA_DIR, sanitizedFilename);
    
    // Verify the resolved path is still within MEDIA_DIR
    if (!filepath.startsWith(MEDIA_DIR)) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    await fs.unlink(filepath);

    res.json({ success: true, message: 'File deleted' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
