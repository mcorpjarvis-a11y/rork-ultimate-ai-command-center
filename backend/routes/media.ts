import express, { Request, Response, Router } from 'express';
import fs from 'fs/promises';
import path from 'path';

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

// Ensure media directory exists
fs.mkdir(MEDIA_DIR, { recursive: true }).catch(console.error);

// Upload media
router.post('/upload', async (req: Request<{}, {}, UploadRequestBody>, res: Response) => {
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

// Get media file
router.get('/file/:filename', async (req: Request<{ filename: string }>, res: Response) => {
  try {
    const filepath = path.join(MEDIA_DIR, req.params.filename);
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
router.get('/list', async (req: Request, res: Response) => {
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
router.delete('/file/:filename', async (req: Request<{ filename: string }>, res: Response) => {
  try {
    const filepath = path.join(MEDIA_DIR, req.params.filename);
    await fs.unlink(filepath);

    res.json({ success: true, message: 'File deleted' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
