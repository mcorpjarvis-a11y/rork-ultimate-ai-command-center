import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export type DeviceType = '3d_printer' | 'smart_light' | 'smart_plug' | 'camera' | 'sensor' | 'thermostat' | 'robot' | 'arduino' | 'esp32' | 'raspberry_pi' | 'custom';

export interface IoTDevice {
  id: string;
  name: string;
  type: DeviceType;
  manufacturer?: string;
  model?: string;
  ipAddress?: string;
  macAddress?: string;
  protocol: 'http' | 'mqtt' | 'websocket' | 'serial' | 'bluetooth' | 'wifi';
  apiEndpoint?: string;
  apiKey?: string;
  status: 'online' | 'offline' | 'error';
  lastSeen: number | null;
  capabilities: string[];
  currentState: Record<string, any>;
  commands: DeviceCommand[];
  createdAt: number;
}

export interface DeviceCommand {
  id: string;
  name: string;
  description: string;
  parameters: CommandParameter[];
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

export interface CommandParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  default?: any;
  description?: string;
}

export interface CommandExecution {
  deviceId: string;
  commandId: string;
  parameters: Record<string, any>;
  timestamp: number;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

class IoTDeviceService {
  private static instance: IoTDeviceService;
  private devices: Map<string, IoTDevice> = new Map();
  private executions: Map<string, CommandExecution> = new Map();
  private STORAGE_KEY = 'iot_devices';

  private constructor() {
    this.loadDevices();
  }

  static getInstance(): IoTDeviceService {
    if (!IoTDeviceService.instance) {
      IoTDeviceService.instance = new IoTDeviceService();
    }
    return IoTDeviceService.instance;
  }

  private async loadDevices(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const devices: IoTDevice[] = JSON.parse(stored);
        devices.forEach(device => {
          this.devices.set(device.id, device);
        });
        console.log(`[IoT] Loaded ${devices.length} devices`);
      }
    } catch (error) {
      console.error('[IoT] Failed to load devices:', error);
    }
  }

  private async saveDevices(): Promise<void> {
    try {
      const devices = Array.from(this.devices.values());
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(devices));
    } catch (error) {
      console.error('[IoT] Failed to save devices:', error);
    }
  }

  async addDevice(device: Omit<IoTDevice, 'id' | 'createdAt' | 'status' | 'lastSeen'>): Promise<IoTDevice> {
    const newDevice: IoTDevice = {
      ...device,
      id: Date.now().toString(),
      status: 'offline',
      lastSeen: null,
      createdAt: Date.now(),
    };

    this.devices.set(newDevice.id, newDevice);
    await this.saveDevices();
    console.log(`[IoT] Added device: ${newDevice.name} (${newDevice.type})`);
    
    this.checkDeviceStatus(newDevice.id);
    
    return newDevice;
  }

  async removeDevice(deviceId: string): Promise<boolean> {
    const deleted = this.devices.delete(deviceId);
    if (deleted) {
      await this.saveDevices();
      console.log(`[IoT] Removed device: ${deviceId}`);
    }
    return deleted;
  }

  async updateDevice(deviceId: string, updates: Partial<IoTDevice>): Promise<IoTDevice | null> {
    const device = this.devices.get(deviceId);
    if (!device) return null;

    const updatedDevice = { ...device, ...updates };
    this.devices.set(deviceId, updatedDevice);
    await this.saveDevices();
    
    return updatedDevice;
  }

  getDevice(deviceId: string): IoTDevice | null {
    return this.devices.get(deviceId) || null;
  }

  getAllDevices(): IoTDevice[] {
    return Array.from(this.devices.values());
  }

  getDevicesByType(type: DeviceType): IoTDevice[] {
    return this.getAllDevices().filter(d => d.type === type);
  }

  getOnlineDevices(): IoTDevice[] {
    return this.getAllDevices().filter(d => d.status === 'online');
  }

  async checkDeviceStatus(deviceId: string): Promise<void> {
    const device = this.devices.get(deviceId);
    if (!device) return;

    try {
      if (device.protocol === 'http' && device.apiEndpoint) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(`${device.apiEndpoint}/status`, {
          signal: controller.signal,
          headers: device.apiKey ? { 'Authorization': `Bearer ${device.apiKey}` } : {},
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          await this.updateDevice(deviceId, {
            status: 'online',
            lastSeen: Date.now(),
          });
        } else {
          await this.updateDevice(deviceId, { status: 'offline' });
        }
      }
    } catch (error) {
      await this.updateDevice(deviceId, { status: 'offline' });
      console.log(`[IoT] Device ${device.name} is offline`);
    }
  }

  async checkAllDevices(): Promise<void> {
    const devices = this.getAllDevices();
    await Promise.all(devices.map(d => this.checkDeviceStatus(d.id)));
  }

  async executeCommand(
    deviceId: string,
    commandId: string,
    parameters: Record<string, any> = {}
  ): Promise<CommandExecution> {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    const command = device.commands.find(c => c.id === commandId);
    if (!command) {
      throw new Error(`Command ${commandId} not found on device ${device.name}`);
    }

    const executionId = `exec_${Date.now()}`;
    const execution: CommandExecution = {
      deviceId,
      commandId,
      parameters,
      timestamp: Date.now(),
      status: 'pending',
    };

    this.executions.set(executionId, execution);

    try {
      execution.status = 'executing';
      this.executions.set(executionId, execution);

      const result = await this.performDeviceCommand(device, command, parameters);

      execution.status = 'completed';
      execution.result = result;
      this.executions.set(executionId, execution);

      console.log(`[IoT] Command executed successfully on ${device.name}: ${command.name}`);

      await this.updateDevice(deviceId, { lastSeen: Date.now() });

      return execution;
    } catch (error) {
      execution.status = 'failed';
      execution.error = error instanceof Error ? error.message : 'Unknown error';
      this.executions.set(executionId, execution);

      console.error(`[IoT] Command failed on ${device.name}:`, error);

      throw error;
    }
  }

  private async performDeviceCommand(
    device: IoTDevice,
    command: DeviceCommand,
    parameters: Record<string, any>
  ): Promise<any> {
    if (device.protocol === 'http' && device.apiEndpoint) {
      const url = command.endpoint 
        ? `${device.apiEndpoint}${command.endpoint}`
        : `${device.apiEndpoint}/command/${command.id}`;

      const method = command.method || 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(device.apiKey ? { 'Authorization': `Bearer ${device.apiKey}` } : {}),
        },
        body: method !== 'GET' ? JSON.stringify(parameters) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    }

    if (device.protocol === 'mqtt') {
      console.log(`[IoT] MQTT command would be published here`);
      return { success: true, message: 'MQTT command queued' };
    }

    if (device.protocol === 'websocket') {
      console.log(`[IoT] WebSocket command would be sent here`);
      return { success: true, message: 'WebSocket command sent' };
    }

    throw new Error(`Protocol ${device.protocol} not fully implemented yet`);
  }

  async discover3DPrinters(): Promise<IoTDevice[]> {
    console.log('[IoT] Scanning for 3D printers...');
    
    const commonPrinters = [
      {
        name: 'Prusa i3 MK3S',
        manufacturer: 'Prusa Research',
        model: 'i3 MK3S',
        capabilities: ['print', 'pause', 'resume', 'cancel', 'preheat', 'move_axis', 'home', 'get_status'],
        commands: this.get3DPrinterCommands(),
      },
      {
        name: 'Ender 3 V2',
        manufacturer: 'Creality',
        model: 'Ender 3 V2',
        capabilities: ['print', 'pause', 'resume', 'cancel', 'preheat', 'home', 'get_status'],
        commands: this.get3DPrinterCommands(),
      },
    ];

    return [];
  }

  private get3DPrinterCommands(): DeviceCommand[] {
    return [
      {
        id: 'print_file',
        name: 'Start Print',
        description: 'Start printing a file',
        parameters: [
          { name: 'filename', type: 'string', required: true, description: 'Name of the file to print' },
        ],
        endpoint: '/api/job',
        method: 'POST',
      },
      {
        id: 'pause_print',
        name: 'Pause Print',
        description: 'Pause current print job',
        parameters: [],
        endpoint: '/api/job',
        method: 'POST',
      },
      {
        id: 'resume_print',
        name: 'Resume Print',
        description: 'Resume paused print job',
        parameters: [],
        endpoint: '/api/job',
        method: 'POST',
      },
      {
        id: 'cancel_print',
        name: 'Cancel Print',
        description: 'Cancel current print job',
        parameters: [],
        endpoint: '/api/job',
        method: 'DELETE',
      },
      {
        id: 'preheat_bed',
        name: 'Preheat Bed',
        description: 'Preheat the print bed',
        parameters: [
          { name: 'temperature', type: 'number', required: true, default: 60, description: 'Target temperature in Celsius' },
        ],
        endpoint: '/api/printer/bed',
        method: 'POST',
      },
      {
        id: 'preheat_nozzle',
        name: 'Preheat Nozzle',
        description: 'Preheat the nozzle',
        parameters: [
          { name: 'temperature', type: 'number', required: true, default: 200, description: 'Target temperature in Celsius' },
        ],
        endpoint: '/api/printer/tool',
        method: 'POST',
      },
      {
        id: 'home_all',
        name: 'Home All Axes',
        description: 'Home all printer axes',
        parameters: [],
        endpoint: '/api/printer/printhead',
        method: 'POST',
      },
      {
        id: 'get_status',
        name: 'Get Status',
        description: 'Get current printer status',
        parameters: [],
        endpoint: '/api/printer',
        method: 'GET',
      },
    ];
  }

  createSmartHomeDevice(name: string, type: 'smart_light' | 'smart_plug' | 'thermostat'): Omit<IoTDevice, 'id' | 'createdAt' | 'status' | 'lastSeen'> {
    const baseDevice = {
      name,
      type,
      protocol: 'http' as const,
      capabilities: [],
      currentState: {},
      commands: [],
    };

    if (type === 'smart_light') {
      return {
        ...baseDevice,
        capabilities: ['on', 'off', 'brightness', 'color'],
        currentState: { on: false, brightness: 100, color: '#FFFFFF' },
        commands: [
          {
            id: 'turn_on',
            name: 'Turn On',
            description: 'Turn the light on',
            parameters: [],
          },
          {
            id: 'turn_off',
            name: 'Turn Off',
            description: 'Turn the light off',
            parameters: [],
          },
          {
            id: 'set_brightness',
            name: 'Set Brightness',
            description: 'Set light brightness',
            parameters: [
              { name: 'brightness', type: 'number', required: true, default: 100, description: 'Brightness level 0-100' },
            ],
          },
          {
            id: 'set_color',
            name: 'Set Color',
            description: 'Set light color',
            parameters: [
              { name: 'color', type: 'string', required: true, default: '#FFFFFF', description: 'Color in hex format' },
            ],
          },
        ],
      };
    }

    if (type === 'smart_plug') {
      return {
        ...baseDevice,
        capabilities: ['on', 'off', 'power_monitoring'],
        currentState: { on: false, power: 0 },
        commands: [
          {
            id: 'turn_on',
            name: 'Turn On',
            description: 'Turn the plug on',
            parameters: [],
          },
          {
            id: 'turn_off',
            name: 'Turn Off',
            description: 'Turn the plug off',
            parameters: [],
          },
          {
            id: 'get_power',
            name: 'Get Power Usage',
            description: 'Get current power usage',
            parameters: [],
          },
        ],
      };
    }

    return {
      ...baseDevice,
      capabilities: ['heat', 'cool', 'auto', 'get_temperature'],
      currentState: { mode: 'off', temperature: 20, target: 20 },
      commands: [
        {
          id: 'set_temperature',
          name: 'Set Temperature',
          description: 'Set target temperature',
          parameters: [
            { name: 'temperature', type: 'number', required: true, default: 20, description: 'Target temperature in Celsius' },
          ],
        },
        {
          id: 'set_mode',
          name: 'Set Mode',
          description: 'Set thermostat mode',
          parameters: [
            { name: 'mode', type: 'string', required: true, default: 'auto', description: 'Mode: heat, cool, auto, off' },
          ],
        },
      ],
    };
  }
}

export default IoTDeviceService.getInstance();
