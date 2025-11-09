import express, { Request, Response, Router } from 'express';
import IoTDeviceService from '../../services/IoTDeviceService';
import PhilipsHueController from '../../services/iot/PhilipsHueController';

const router: Router = express.Router();

/**
 * Real IoT Device Control API Routes
 * Supports Philips Hue and generic devices
 */

// GET /api/iot/devices - List all devices
router.get('/devices', async (req: Request, res: Response) => {
  try {
    const devices = IoTDeviceService.getAllDevices();
    res.json({
      success: true,
      data: devices,
      count: devices.length,
    });
  } catch (error) {
    console.error('[IoT] List devices error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list devices',
    });
  }
});

// POST /api/iot/devices - Add new device
router.post('/devices', async (req: Request, res: Response) => {
  try {
    const device = await IoTDeviceService.addDevice(req.body);
    res.json({
      success: true,
      data: device,
      message: 'Device added successfully',
    });
  } catch (error) {
    console.error('[IoT] Add device error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add device',
    });
  }
});

// GET /api/iot/devices/:id - Get single device
router.get('/devices/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const device = IoTDeviceService.getDevice(id);
    
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found',
      });
    }

    res.json({
      success: true,
      data: device,
    });
  } catch (error) {
    console.error('[IoT] Get device error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get device',
    });
  }
});

// PUT /api/iot/devices/:id - Update device
router.put('/devices/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const device = await IoTDeviceService.updateDevice(id, req.body);
    
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found',
      });
    }

    res.json({
      success: true,
      data: device,
      message: 'Device updated successfully',
    });
  } catch (error) {
    console.error('[IoT] Update device error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update device',
    });
  }
});

// DELETE /api/iot/devices/:id - Remove device
router.delete('/devices/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await IoTDeviceService.removeDevice(id);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Device not found',
      });
    }

    res.json({
      success: true,
      message: 'Device removed successfully',
    });
  } catch (error) {
    console.error('[IoT] Remove device error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to remove device',
    });
  }
});

// POST /api/iot/devices/:id/execute - Execute device command
router.post('/devices/:id/execute', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { commandId, parameters } = req.body;

    const execution = await IoTDeviceService.executeCommand(id, commandId, parameters);

    res.json({
      success: true,
      data: execution,
      message: 'Command executed successfully',
    });
  } catch (error) {
    console.error('[IoT] Execute command error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to execute command',
    });
  }
});

// GET /api/iot/devices/:id/status - Check device status
router.get('/devices/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await IoTDeviceService.checkDeviceStatus(id);
    
    const device = IoTDeviceService.getDevice(id);
    
    if (!device) {
      return res.status(404).json({
        success: false,
        error: 'Device not found',
      });
    }

    res.json({
      success: true,
      data: {
        id: device.id,
        name: device.name,
        status: device.status,
        lastSeen: device.lastSeen,
      },
    });
  } catch (error) {
    console.error('[IoT] Check status error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check device status',
    });
  }
});

// POST /api/iot/hue/discover - Discover Philips Hue bridges
router.post('/hue/discover', async (req: Request, res: Response) => {
  try {
    const bridges = await PhilipsHueController.discoverBridges();
    
    res.json({
      success: true,
      data: bridges,
      count: bridges.length,
      message: `Discovered ${bridges.length} Hue bridge(s)`,
    });
  } catch (error) {
    console.error('[IoT] Hue discovery error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to discover Hue bridges',
    });
  }
});

// POST /api/iot/hue/authenticate - Authenticate with Hue bridge
router.post('/hue/authenticate', async (req: Request, res: Response) => {
  try {
    const { bridgeIp } = req.body;
    
    if (!bridgeIp) {
      return res.status(400).json({
        success: false,
        error: 'Bridge IP address is required',
      });
    }

    const username = await PhilipsHueController.createUser(bridgeIp);
    
    res.json({
      success: true,
      data: { username, bridgeIp },
      message: 'Successfully authenticated with Hue bridge',
    });
  } catch (error) {
    console.error('[IoT] Hue authentication error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to authenticate with Hue bridge',
    });
  }
});

// GET /api/iot/hue/lights - Get all Hue lights
router.get('/hue/lights', async (req: Request, res: Response) => {
  try {
    const { bridgeIp, username } = req.query;
    
    if (!bridgeIp || !username) {
      return res.status(400).json({
        success: false,
        error: 'Bridge IP and username are required',
      });
    }

    const lights = await PhilipsHueController.getLights(bridgeIp as string, username as string);
    
    res.json({
      success: true,
      data: lights,
    });
  } catch (error) {
    console.error('[IoT] Get Hue lights error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get Hue lights',
    });
  }
});

// POST /api/iot/hue/lights/:id/state - Control Hue light
router.post('/hue/lights/:id/state', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { bridgeIp, username, command } = req.body;
    
    if (!bridgeIp || !username || !command) {
      return res.status(400).json({
        success: false,
        error: 'Bridge IP, username, and command are required',
      });
    }

    const result = await PhilipsHueController.setLightState(bridgeIp, username, id, command);
    
    res.json({
      success: true,
      data: result,
      message: 'Light state updated successfully',
    });
  } catch (error) {
    console.error('[IoT] Set Hue light state error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to control Hue light',
    });
  }
});

export default router;
