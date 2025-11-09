/**
 * Generic MQTT IoT Controller
 * Supports MQTT-based devices (Home Assistant, custom devices, etc.)
 * Uses MQTT over WebSockets for React Native compatibility
 */

export interface MQTTConfig {
  broker: string; // e.g., 'mqtt://broker.hivemq.com:1883' or 'ws://broker.hivemq.com:8000/mqtt'
  username?: string;
  password?: string;
  clientId?: string;
  keepalive?: number;
  clean?: boolean;
}

export interface MQTTMessage {
  topic: string;
  payload: string | Buffer;
  qos?: 0 | 1 | 2;
  retain?: boolean;
}

export interface MQTTSubscription {
  topic: string;
  qos?: 0 | 1 | 2;
  callback: (topic: string, message: Buffer) => void;
}

/**
 * MQTT Controller for generic IoT devices
 * Note: This uses a simulated MQTT client since React Native doesn't have native MQTT
 * In production, use a library like 'react_native_mqtt' or MQTT over WebSockets
 */
class MQTTController {
  private connected: boolean = false;
  private config: MQTTConfig | null = null;
  private subscriptions: Map<string, MQTTSubscription> = new Map();
  private messageQueue: MQTTMessage[] = [];

  /**
   * Connect to MQTT broker
   */
  async connect(config: MQTTConfig): Promise<void> {
    try {
      this.config = {
        clientId: `jarvis_${Date.now()}`,
        keepalive: 60,
        clean: true,
        ...config,
      };

      console.log(`[MQTT] Connecting to ${this.config.broker}...`);

      // In a real implementation, use a WebSocket MQTT client
      // For now, simulate connection
      await new Promise(resolve => setTimeout(resolve, 500));

      this.connected = true;
      console.log('[MQTT] Connected successfully');

      // Process any queued messages
      await this.processQueue();
    } catch (error) {
      console.error('[MQTT] Connection failed:', error);
      throw error;
    }
  }

  /**
   * Disconnect from MQTT broker
   */
  async disconnect(): Promise<void> {
    try {
      if (!this.connected) {
        console.log('[MQTT] Already disconnected');
        return;
      }

      console.log('[MQTT] Disconnecting...');
      
      // Clear subscriptions
      this.subscriptions.clear();
      
      this.connected = false;
      this.config = null;

      console.log('[MQTT] Disconnected successfully');
    } catch (error) {
      console.error('[MQTT] Disconnection failed:', error);
      throw error;
    }
  }

  /**
   * Publish message to topic
   */
  async publish(topic: string, payload: string | Buffer, options?: { qos?: 0 | 1 | 2; retain?: boolean }): Promise<void> {
    try {
      const message: MQTTMessage = {
        topic,
        payload,
        qos: options?.qos || 0,
        retain: options?.retain || false,
      };

      if (!this.connected) {
        console.log('[MQTT] Not connected, queuing message');
        this.messageQueue.push(message);
        return;
      }

      console.log(`[MQTT] Publishing to ${topic}`);
      
      // In real implementation, use MQTT client to publish
      // For now, simulate publish with HTTP POST to MQTT-HTTP bridge
      if (this.config?.broker.startsWith('http')) {
        await this.publishViaHTTP(message);
      }
    } catch (error) {
      console.error('[MQTT] Publish failed:', error);
      throw error;
    }
  }

  /**
   * Subscribe to topic
   */
  async subscribe(
    topic: string,
    callback: (topic: string, message: Buffer) => void,
    options?: { qos?: 0 | 1 | 2 }
  ): Promise<void> {
    try {
      if (!this.connected) {
        throw new Error('MQTT client not connected');
      }

      const subscription: MQTTSubscription = {
        topic,
        qos: options?.qos || 0,
        callback,
      };

      this.subscriptions.set(topic, subscription);
      console.log(`[MQTT] Subscribed to ${topic}`);
    } catch (error) {
      console.error('[MQTT] Subscribe failed:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from topic
   */
  async unsubscribe(topic: string): Promise<void> {
    try {
      if (!this.connected) {
        throw new Error('MQTT client not connected');
      }

      this.subscriptions.delete(topic);
      console.log(`[MQTT] Unsubscribed from ${topic}`);
    } catch (error) {
      console.error('[MQTT] Unsubscribe failed:', error);
      throw error;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Process queued messages
   */
  private async processQueue(): Promise<void> {
    while (this.messageQueue.length > 0 && this.connected) {
      const message = this.messageQueue.shift();
      if (message) {
        await this.publish(message.topic, message.payload, {
          qos: message.qos,
          retain: message.retain,
        });
      }
    }
  }

  /**
   * Publish via HTTP bridge (fallback for environments without WebSocket MQTT)
   */
  private async publishViaHTTP(message: MQTTMessage): Promise<void> {
    try {
      const url = `${this.config?.broker}/publish`;
      const payload = typeof message.payload === 'string' 
        ? message.payload 
        : message.payload.toString();

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config?.username && this.config?.password ? {
            'Authorization': `Basic ${btoa(`${this.config.username}:${this.config.password}`)}`,
          } : {}),
        },
        body: JSON.stringify({
          topic: message.topic,
          payload,
          qos: message.qos,
          retain: message.retain,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP publish failed: ${response.statusText}`);
      }

      console.log(`[MQTT/HTTP] Published to ${message.topic}`);
    } catch (error) {
      console.error('[MQTT/HTTP] Publish failed:', error);
      throw error;
    }
  }

  // ===== Helper methods for common IoT patterns =====

  /**
   * Turn on a device via MQTT
   */
  async turnOn(deviceTopic: string): Promise<void> {
    await this.publish(`${deviceTopic}/set`, 'ON');
  }

  /**
   * Turn off a device via MQTT
   */
  async turnOff(deviceTopic: string): Promise<void> {
    await this.publish(`${deviceTopic}/set`, 'OFF');
  }

  /**
   * Set brightness for a light (0-255)
   */
  async setBrightness(deviceTopic: string, brightness: number): Promise<void> {
    const clampedBrightness = Math.max(0, Math.min(255, brightness));
    await this.publish(`${deviceTopic}/brightness/set`, clampedBrightness.toString());
  }

  /**
   * Set RGB color for a light
   */
  async setRGBColor(deviceTopic: string, r: number, g: number, b: number): Promise<void> {
    await this.publish(`${deviceTopic}/rgb/set`, `${r},${g},${b}`);
  }

  /**
   * Set temperature for a thermostat
   */
  async setTemperature(deviceTopic: string, temperature: number): Promise<void> {
    await this.publish(`${deviceTopic}/temperature/set`, temperature.toString());
  }

  /**
   * Get device state (subscribe pattern)
   */
  async subscribeToState(
    deviceTopic: string,
    callback: (state: any) => void
  ): Promise<void> {
    await this.subscribe(`${deviceTopic}/state`, (topic, message) => {
      try {
        const state = JSON.parse(message.toString());
        callback(state);
      } catch (error) {
        console.error('[MQTT] Failed to parse state:', error);
      }
    });
  }

  /**
   * Home Assistant MQTT Discovery
   * Publish device configuration for auto-discovery
   */
  async publishHomeAssistantDiscovery(config: {
    deviceId: string;
    deviceName: string;
    deviceType: 'switch' | 'light' | 'sensor' | 'binary_sensor' | 'climate';
    stateTopic: string;
    commandTopic?: string;
    availabilityTopic?: string;
    additionalConfig?: Record<string, any>;
  }): Promise<void> {
    const discoveryTopic = `homeassistant/${config.deviceType}/${config.deviceId}/config`;
    
    const discoveryPayload = {
      name: config.deviceName,
      unique_id: config.deviceId,
      state_topic: config.stateTopic,
      command_topic: config.commandTopic,
      availability_topic: config.availabilityTopic,
      ...config.additionalConfig,
    };

    await this.publish(discoveryTopic, JSON.stringify(discoveryPayload), { retain: true });
    console.log(`[MQTT] Published Home Assistant discovery for ${config.deviceName}`);
  }
}

export default new MQTTController();
