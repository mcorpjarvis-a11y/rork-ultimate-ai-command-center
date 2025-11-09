import express, { Request, Response, Router } from 'express';
import MonetizationService, { RevenueStreamCreate, RevenueStreamUpdate } from '../../services/monetization/MonetizationService';

const router: Router = express.Router();

/**
 * Real Monetization API Routes
 * Full CRUD operations for revenue streams
 */

// POST /api/monetization/add - Add new revenue stream
router.post('/add', async (req: Request<{}, {}, RevenueStreamCreate>, res: Response) => {
  try {
    const stream = await MonetizationService.addStream(req.body);
    res.json({
      success: true,
      data: stream,
      message: 'Revenue stream added successfully',
    });
  } catch (error) {
    console.error('[Monetization] Add stream error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add revenue stream',
    });
  }
});

// PUT /api/monetization/update/:id - Update revenue stream
router.put('/update/:id', async (req: Request<{ id: string }, {}, RevenueStreamUpdate>, res: Response) => {
  try {
    const { id } = req.params;
    const stream = await MonetizationService.updateStream(id, req.body);
    res.json({
      success: true,
      data: stream,
      message: 'Revenue stream updated successfully',
    });
  } catch (error) {
    console.error('[Monetization] Update stream error:', error);
    res.status(error instanceof Error && error.message.includes('not found') ? 404 : 400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update revenue stream',
    });
  }
});

// DELETE /api/monetization/delete/:id - Delete revenue stream
router.delete('/delete/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    await MonetizationService.deleteStream(id);
    res.json({
      success: true,
      message: 'Revenue stream deleted successfully',
    });
  } catch (error) {
    console.error('[Monetization] Delete stream error:', error);
    res.status(error instanceof Error && error.message.includes('not found') ? 404 : 400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete revenue stream',
    });
  }
});

// GET /api/monetization/list - List all revenue streams with optional filters
router.get('/list', async (req: Request, res: Response) => {
  try {
    const { type, platform, isActive, startDate, endDate } = req.query;
    
    const filters: any = {};
    if (type) filters.type = type as string;
    if (platform) filters.platform = platform as string;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (startDate) filters.startDate = parseInt(startDate as string, 10);
    if (endDate) filters.endDate = parseInt(endDate as string, 10);

    const streams = await MonetizationService.listStreams(filters);
    
    res.json({
      success: true,
      data: streams,
      count: streams.length,
    });
  } catch (error) {
    console.error('[Monetization] List streams error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list revenue streams',
    });
  }
});

// GET /api/monetization/:id - Get single revenue stream
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { id } = req.params;
    const stream = await MonetizationService.getStream(id);
    
    if (!stream) {
      return res.status(404).json({
        success: false,
        error: 'Revenue stream not found',
      });
    }

    res.json({
      success: true,
      data: stream,
    });
  } catch (error) {
    console.error('[Monetization] Get stream error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get revenue stream',
    });
  }
});

// GET /api/monetization/analytics - Get revenue analytics
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Default to last 30 days if not specified
    const end = endDate ? parseInt(endDate as string, 10) : Date.now();
    const start = startDate ? parseInt(startDate as string, 10) : end - (30 * 24 * 60 * 60 * 1000);

    const analytics = await MonetizationService.getAnalytics(start, end);
    
    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('[Monetization] Get analytics error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get analytics',
    });
  }
});

export default router;
