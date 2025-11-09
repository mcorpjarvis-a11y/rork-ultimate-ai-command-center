/**
 * TP-Link Kasa Smart Device Controller
 * Real integration with TP-Link Kasa Cloud API
 * Supports smart plugs, switches, bulbs, and power strips
 */

export interface KasaDevice {
  deviceId: string;
  alias: string;
  deviceName: string;
  deviceType: string;
  deviceModel: string;
  role: number;
  fwVer: string;
  appServerUrl: string;
  deviceRegion: string;
  deviceMac: string;
  oemId: string;
  hwId: string;
  status: number; // 0 = offline, 1 = online
}

export interface KasaDeviceState {
  relay_state: number; // 0 = off, 1 = on
  on_time?: number;
  brightness?: number; // For dimmable devices
  color_temp?: number; // For bulbs
  hue?: number;
  saturation?: number;
  mode?: string;
}

class TPLinkKasaController {
  private readonly baseURL = 'https://wap.tplinkcloud.com';

  /**
   * Authenticate with TP-Link Cloud
   */
  async authenticate(email: string, password: string): Promise<{ token: string }> {
    try {
      const response = await fetch(`${this.baseURL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'login',
          params: {
            appType: 'Kasa_Android',
            cloudUserName: email,
            cloudPassword: password,
            terminalUUID: `JARVIS-${Date.now()}`,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Kasa authentication failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error_code !== 0) {
        throw new Error(`Kasa auth error: ${data.msg}`);
      }

      console.log('[Kasa] Authentication successful');
      return { token: data.result.token };
    } catch (error) {
      console.error('[Kasa] Authentication failed:', error);
      throw error;
    }
  }

  /**
   * Get list of all devices
   */
  async getDeviceList(token: string): Promise<KasaDevice[]> {
    try {
      const response = await fetch(`${this.baseURL}?token=${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'getDeviceList',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get device list: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error_code !== 0) {
        throw new Error(`Kasa error: ${data.msg}`);
      }

      console.log(`[Kasa] Retrieved ${data.result.deviceList?.length || 0} device(s)`);
      return data.result.deviceList || [];
    } catch (error) {
      console.error('[Kasa] Failed to get device list:', error);
      throw error;
    }
  }

  /**
   * Get device state
   */
  async getDeviceState(token: string, device: KasaDevice): Promise<KasaDeviceState> {
    try {
      const response = await fetch(`${device.appServerUrl}?token=${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'passthrough',
          params: {
            deviceId: device.deviceId,
            requestData: JSON.stringify({
              system: { get_sysinfo: {} },
            }),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get device state: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error_code !== 0) {
        throw new Error(`Kasa error: ${data.msg}`);
      }

      const responseData = JSON.parse(data.result.responseData);
      return responseData.system.get_sysinfo;
    } catch (error) {
      console.error('[Kasa] Failed to get device state:', error);
      throw error;
    }
  }

  /**
   * Turn device on
   */
  async turnOn(token: string, device: KasaDevice): Promise<void> {
    try {
      const response = await fetch(`${device.appServerUrl}?token=${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'passthrough',
          params: {
            deviceId: device.deviceId,
            requestData: JSON.stringify({
              system: { set_relay_state: { state: 1 } },
            }),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to turn on device: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error_code !== 0) {
        throw new Error(`Kasa error: ${data.msg}`);
      }

      console.log(`[Kasa] Device ${device.alias} turned on`);
    } catch (error) {
      console.error('[Kasa] Failed to turn on device:', error);
      throw error;
    }
  }

  /**
   * Turn device off
   */
  async turnOff(token: string, device: KasaDevice): Promise<void> {
    try {
      const response = await fetch(`${device.appServerUrl}?token=${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'passthrough',
          params: {
            deviceId: device.deviceId,
            requestData: JSON.stringify({
              system: { set_relay_state: { state: 0 } },
            }),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to turn off device: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error_code !== 0) {
        throw new Error(`Kasa error: ${data.msg}`);
      }

      console.log(`[Kasa] Device ${device.alias} turned off`);
    } catch (error) {
      console.error('[Kasa] Failed to turn off device:', error);
      throw error;
    }
  }

  /**
   * Set brightness for dimmable devices (0-100)
   */
  async setBrightness(token: string, device: KasaDevice, brightness: number): Promise<void> {
    try {
      const clampedBrightness = Math.max(0, Math.min(100, brightness));

      const response = await fetch(`${device.appServerUrl}?token=${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'passthrough',
          params: {
            deviceId: device.deviceId,
            requestData: JSON.stringify({
              'smartlife.iot.dimmer': {
                set_brightness: { brightness: clampedBrightness },
              },
            }),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to set brightness: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error_code !== 0) {
        throw new Error(`Kasa error: ${data.msg}`);
      }

      console.log(`[Kasa] Device ${device.alias} brightness set to ${clampedBrightness}%`);
    } catch (error) {
      console.error('[Kasa] Failed to set brightness:', error);
      throw error;
    }
  }

  /**
   * Set color for smart bulbs (HSV)
   */
  async setColor(
    token: string,
    device: KasaDevice,
    hue: number,
    saturation: number,
    value: number
  ): Promise<void> {
    try {
      const response = await fetch(`${device.appServerUrl}?token=${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'passthrough',
          params: {
            deviceId: device.deviceId,
            requestData: JSON.stringify({
              'smartlife.iot.smartbulb.lightingservice': {
                transition_light_state: {
                  hue,
                  saturation,
                  brightness: value,
                  color_temp: 0,
                },
              },
            }),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to set color: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error_code !== 0) {
        throw new Error(`Kasa error: ${data.msg}`);
      }

      console.log(`[Kasa] Device ${device.alias} color set`);
    } catch (error) {
      console.error('[Kasa] Failed to set color:', error);
      throw error;
    }
  }

  /**
   * Set color temperature for smart bulbs (2500K-9000K)
   */
  async setColorTemperature(
    token: string,
    device: KasaDevice,
    colorTemp: number
  ): Promise<void> {
    try {
      const clampedTemp = Math.max(2500, Math.min(9000, colorTemp));

      const response = await fetch(`${device.appServerUrl}?token=${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'passthrough',
          params: {
            deviceId: device.deviceId,
            requestData: JSON.stringify({
              'smartlife.iot.smartbulb.lightingservice': {
                transition_light_state: {
                  color_temp: clampedTemp,
                },
              },
            }),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to set color temperature: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error_code !== 0) {
        throw new Error(`Kasa error: ${data.msg}`);
      }

      console.log(`[Kasa] Device ${device.alias} color temp set to ${clampedTemp}K`);
    } catch (error) {
      console.error('[Kasa] Failed to set color temperature:', error);
      throw error;
    }
  }

  /**
   * Get energy usage (for devices with energy monitoring)
   */
  async getEnergyUsage(token: string, device: KasaDevice): Promise<any> {
    try {
      const response = await fetch(`${device.appServerUrl}?token=${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'passthrough',
          params: {
            deviceId: device.deviceId,
            requestData: JSON.stringify({
              'emeter': { get_realtime: {} },
            }),
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get energy usage: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error_code !== 0) {
        throw new Error(`Kasa error: ${data.msg}`);
      }

      const responseData = JSON.parse(data.result.responseData);
      return responseData.emeter.get_realtime;
    } catch (error) {
      console.error('[Kasa] Failed to get energy usage:', error);
      throw error;
    }
  }
}

export default new TPLinkKasaController();
