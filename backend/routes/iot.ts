import express, { Request, Response, Router } from 'express';
import IoTDeviceService from '../../services/IoTDeviceService';
import PhilipsHueController from '../../services/iot/PhilipsHueController';
import NestController from '../../services/iot/NestController';
import RingController from '../../services/iot/RingController';
import TPLinkKasaController from '../../services/iot/TPLinkKasaController';
import MQTTController from '../../services/iot/MQTTController';

const router: Router = express.Router();

/**
 * Real IoT Device Control API Routes
 * Supports Philips Hue, Nest, Ring, TP-Link Kasa, and MQTT devices
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

// ===== Nest Thermostat Routes =====

// GET /api/iot/nest/devices - Get all Nest devices
router.get('/nest/devices', async (req: Request, res: Response) => {
  try {
    const { accessToken, projectId } = req.query;
    
    if (!accessToken || !projectId) {
      return res.status(400).json({
        success: false,
        error: 'Access token and project ID are required',
      });
    }

    const devices = await NestController.listDevices(accessToken as string, projectId as string);
    
    res.json({
      success: true,
      data: devices,
      count: devices.length,
    });
  } catch (error) {
    console.error('[IoT] Nest list devices error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get Nest devices',
    });
  }
});

// POST /api/iot/nest/:deviceName/mode - Set thermostat mode
router.post('/nest/:deviceName/mode', async (req: Request, res: Response) => {
  try {
    const { deviceName } = req.params;
    const { accessToken, mode } = req.body;
    
    if (!accessToken || !mode) {
      return res.status(400).json({
        success: false,
        error: 'Access token and mode are required',
      });
    }

    await NestController.setThermostatMode(accessToken, deviceName, mode);
    
    res.json({
      success: true,
      message: `Thermostat mode set to ${mode}`,
    });
  } catch (error) {
    console.error('[IoT] Nest set mode error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to set thermostat mode',
    });
  }
});

// POST /api/iot/nest/:deviceName/temperature - Set temperature
router.post('/nest/:deviceName/temperature', async (req: Request, res: Response) => {
  try {
    const { deviceName } = req.params;
    const { accessToken, heatCelsius, coolCelsius } = req.body;
    
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: 'Access token is required',
      });
    }

    if (heatCelsius !== undefined && coolCelsius !== undefined) {
      await NestController.setTemperatureRange(accessToken, deviceName, heatCelsius, coolCelsius);
    } else if (heatCelsius !== undefined) {
      await NestController.setHeatTemperature(accessToken, deviceName, heatCelsius);
    } else if (coolCelsius !== undefined) {
      await NestController.setCoolTemperature(accessToken, deviceName, coolCelsius);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Either heatCelsius or coolCelsius is required',
      });
    }
    
    res.json({
      success: true,
      message: 'Temperature set successfully',
    });
  } catch (error) {
    console.error('[IoT] Nest set temperature error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to set temperature',
    });
  }
});

// ===== Ring Doorbell Routes =====

// POST /api/iot/ring/auth - Authenticate with Ring
router.post('/ring/auth', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    const tokens = await RingController.authenticate(email, password);
    
    res.json({
      success: true,
      data: tokens,
      message: 'Ring authentication successful',
    });
  } catch (error) {
    console.error('[IoT] Ring authentication error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to authenticate with Ring',
    });
  }
});

// GET /api/iot/ring/devices - Get all Ring devices
router.get('/ring/devices', async (req: Request, res: Response) => {
  try {
    const { accessToken } = req.query;
    
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: 'Access token is required',
      });
    }

    const devices = await RingController.getDevices(accessToken as string);
    
    res.json({
      success: true,
      data: devices,
    });
  } catch (error) {
    console.error('[IoT] Ring get devices error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get Ring devices',
    });
  }
});

// GET /api/iot/ring/:deviceId/events - Get device events
router.get('/ring/:deviceId/events', async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const { accessToken, limit } = req.query;
    
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: 'Access token is required',
      });
    }

    const events = await RingController.getDeviceEvents(
      accessToken as string,
      deviceId,
      limit ? parseInt(limit as string, 10) : 10
    );
    
    res.json({
      success: true,
      data: events,
      count: events.length,
    });
  } catch (error) {
    console.error('[IoT] Ring get events error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get Ring events',
    });
  }
});

// POST /api/iot/ring/:deviceId/motion - Toggle motion detection
router.post('/ring/:deviceId/motion', async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const { accessToken, enabled } = req.body;
    
    if (!accessToken || enabled === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Access token and enabled status are required',
      });
    }

    if (enabled) {
      await RingController.enableMotionDetection(accessToken, deviceId);
    } else {
      await RingController.disableMotionDetection(accessToken, deviceId);
    }
    
    res.json({
      success: true,
      message: `Motion detection ${enabled ? 'enabled' : 'disabled'}`,
    });
  } catch (error) {
    console.error('[IoT] Ring toggle motion error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle motion detection',
    });
  }
});

// ===== TP-Link Kasa Routes =====

// POST /api/iot/kasa/auth - Authenticate with Kasa
router.post('/kasa/auth', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    const result = await TPLinkKasaController.authenticate(email, password);
    
    res.json({
      success: true,
      data: result,
      message: 'TP-Link Kasa authentication successful',
    });
  } catch (error) {
    console.error('[IoT] Kasa authentication error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to authenticate with Kasa',
    });
  }
});

// GET /api/iot/kasa/devices - Get all Kasa devices
router.get('/kasa/devices', async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required',
      });
    }

    const devices = await TPLinkKasaController.getDeviceList(token as string);
    
    res.json({
      success: true,
      data: devices,
      count: devices.length,
    });
  } catch (error) {
    console.error('[IoT] Kasa get devices error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get Kasa devices',
    });
  }
});

// POST /api/iot/kasa/:deviceId/control - Control Kasa device
router.post('/kasa/:deviceId/control', async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const { token, action, value, device } = req.body;
    
    if (!token || !action || !device) {
      return res.status(400).json({
        success: false,
        error: 'Token, action, and device info are required',
      });
    }

    switch (action) {
      case 'turnOn':
        await TPLinkKasaController.turnOn(token, device);
        break;
      case 'turnOff':
        await TPLinkKasaController.turnOff(token, device);
        break;
      case 'setBrightness':
        if (value === undefined) {
          return res.status(400).json({ success: false, error: 'Brightness value required' });
        }
        await TPLinkKasaController.setBrightness(token, device, value);
        break;
      default:
        return res.status(400).json({ success: false, error: 'Unknown action' });
    }
    
    res.json({
      success: true,
      message: `Device ${action} successful`,
    });
  } catch (error) {
    console.error('[IoT] Kasa control error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to control Kasa device',
    });
  }
});

// ===== MQTT Routes =====

// POST /api/iot/mqtt/connect - Connect to MQTT broker
router.post('/mqtt/connect', async (req: Request, res: Response) => {
  try {
    const config = req.body;
    
    if (!config.broker) {
      return res.status(400).json({
        success: false,
        error: 'Broker URL is required',
      });
    }

    await MQTTController.connect(config);
    
    res.json({
      success: true,
      message: 'Connected to MQTT broker',
    });
  } catch (error) {
    console.error('[IoT] MQTT connect error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to connect to MQTT broker',
    });
  }
});

// POST /api/iot/mqtt/publish - Publish MQTT message
router.post('/mqtt/publish', async (req: Request, res: Response) => {
  try {
    const { topic, payload, qos, retain } = req.body;
    
    if (!topic || payload === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Topic and payload are required',
      });
    }

    await MQTTController.publish(topic, payload, { qos, retain });
    
    res.json({
      success: true,
      message: 'Message published successfully',
    });
  } catch (error) {
    console.error('[IoT] MQTT publish error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to publish message',
    });
  }
});

// POST /api/iot/mqtt/control - Control device via MQTT
router.post('/mqtt/control', async (req: Request, res: Response) => {
  try {
    const { deviceTopic, action, value } = req.body;
    
    if (!deviceTopic || !action) {
      return res.status(400).json({
        success: false,
        error: 'Device topic and action are required',
      });
    }

    switch (action) {
      case 'turnOn':
        await MQTTController.turnOn(deviceTopic);
        break;
      case 'turnOff':
        await MQTTController.turnOff(deviceTopic);
        break;
      case 'setBrightness':
        if (value === undefined) {
          return res.status(400).json({ success: false, error: 'Brightness value required' });
        }
        await MQTTController.setBrightness(deviceTopic, value);
        break;
      case 'setTemperature':
        if (value === undefined) {
          return res.status(400).json({ success: false, error: 'Temperature value required' });
        }
        await MQTTController.setTemperature(deviceTopic, value);
        break;
      default:
        return res.status(400).json({ success: false, error: 'Unknown action' });
    }
    
    res.json({
      success: true,
      message: `Device ${action} successful`,
    });
  } catch (error) {
    console.error('[IoT] MQTT control error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to control device via MQTT',
    });
  }
});

export default router;
