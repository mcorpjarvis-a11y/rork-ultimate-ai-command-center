/**
 * Philips Hue Smart Light Controller
 * Real integration with Philips Hue Bridge API
 * No placeholders - full working implementation
 */

export interface HueBridge {
  id: string;
  ipAddress: string;
  username: string; // API key/token
  name: string;
  modelid: string;
  swversion: string;
}

export interface HueLight {
  id: string;
  name: string;
  state: {
    on: boolean;
    bri: number; // 0-254
    hue?: number; // 0-65535
    sat?: number; // 0-254
    ct?: number; // Color temperature
    xy?: [number, number]; // Color coordinates
    colormode?: 'hs' | 'xy' | 'ct';
    reachable: boolean;
  };
  type: string;
  modelid: string;
  swversion: string;
}

export interface HueLightCommand {
  on?: boolean;
  bri?: number; // Brightness 0-254
  hue?: number; // Hue 0-65535
  sat?: number; // Saturation 0-254
  ct?: number; // Color temperature 153-500
  xy?: [number, number]; // CIE color space coordinates
  transitiontime?: number; // In 100ms, so 10 = 1 second
}

class PhilipsHueController {
  /**
   * Discover Hue bridges on local network using HTTPS discovery
   */
  async discoverBridges(): Promise<HueBridge[]> {
    try {
      const response = await fetch('https://discovery.meethue.com/');
      if (!response.ok) {
        throw new Error('Failed to discover Hue bridges');
      }

      const bridges = await response.json();
      console.log(`[PhilipsHue] Discovered ${bridges.length} bridge(s)`);
      
      return bridges.map((bridge: any) => ({
        id: bridge.id,
        ipAddress: bridge.internalipaddress,
        username: '', // Needs to be generated via link button press
        name: '',
        modelid: '',
        swversion: '',
      }));
    } catch (error) {
      console.error('[PhilipsHue] Bridge discovery failed:', error);
      return [];
    }
  }

  /**
   * Create new user (API key) by pressing link button on bridge
   * Returns username (API token) to use for subsequent requests
   */
  async createUser(bridgeIp: string, deviceType: string = 'jarvis_ai'): Promise<string> {
    try {
      const response = await fetch(`http://${bridgeIp}/api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          devicetype: `${deviceType}#${Date.now()}`,
        }),
      });

      const data = await response.json();
      
      if (data[0]?.error) {
        if (data[0].error.type === 101) {
          throw new Error('Link button not pressed. Please press the link button on your Hue bridge and try again.');
        }
        throw new Error(data[0].error.description);
      }

      if (data[0]?.success) {
        const username = data[0].success.username;
        console.log('[PhilipsHue] Successfully authenticated with bridge');
        return username;
      }

      throw new Error('Unexpected response from bridge');
    } catch (error) {
      console.error('[PhilipsHue] Authentication failed:', error);
      throw error;
    }
  }

  /**
   * Get bridge configuration and details
   */
  async getBridgeConfig(bridgeIp: string, username: string): Promise<any> {
    try {
      const response = await fetch(`http://${bridgeIp}/api/${username}/config`);
      if (!response.ok) {
        throw new Error('Failed to get bridge config');
      }

      return await response.json();
    } catch (error) {
      console.error('[PhilipsHue] Failed to get bridge config:', error);
      throw error;
    }
  }

  /**
   * Get all lights connected to bridge
   */
  async getLights(bridgeIp: string, username: string): Promise<Record<string, HueLight>> {
    try {
      const response = await fetch(`http://${bridgeIp}/api/${username}/lights`);
      if (!response.ok) {
        throw new Error('Failed to get lights');
      }

      const lights = await response.json();
      
      if (lights[0]?.error) {
        throw new Error(lights[0].error.description);
      }

      console.log(`[PhilipsHue] Retrieved ${Object.keys(lights).length} light(s)`);
      return lights;
    } catch (error) {
      console.error('[PhilipsHue] Failed to get lights:', error);
      throw error;
    }
  }

  /**
   * Get single light state
   */
  async getLight(bridgeIp: string, username: string, lightId: string): Promise<HueLight> {
    try {
      const response = await fetch(`http://${bridgeIp}/api/${username}/lights/${lightId}`);
      if (!response.ok) {
        throw new Error(`Failed to get light ${lightId}`);
      }

      const light = await response.json();
      
      if (light.error) {
        throw new Error(light.error.description);
      }

      return { id: lightId, ...light };
    } catch (error) {
      console.error(`[PhilipsHue] Failed to get light ${lightId}:`, error);
      throw error;
    }
  }

  /**
   * Set light state (on/off, brightness, color, etc.)
   */
  async setLightState(
    bridgeIp: string,
    username: string,
    lightId: string,
    command: HueLightCommand
  ): Promise<any> {
    try {
      const response = await fetch(`http://${bridgeIp}/api/${username}/lights/${lightId}/state`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
      });

      const result = await response.json();
      
      if (result[0]?.error) {
        throw new Error(result[0].error.description);
      }

      console.log(`[PhilipsHue] Light ${lightId} state updated`);
      return result;
    } catch (error) {
      console.error(`[PhilipsHue] Failed to set light ${lightId} state:`, error);
      throw error;
    }
  }

  /**
   * Turn light on
   */
  async turnOn(bridgeIp: string, username: string, lightId: string, transitionTime?: number): Promise<any> {
    const command: HueLightCommand = { on: true };
    if (transitionTime !== undefined) {
      command.transitiontime = transitionTime;
    }
    return this.setLightState(bridgeIp, username, lightId, command);
  }

  /**
   * Turn light off
   */
  async turnOff(bridgeIp: string, username: string, lightId: string, transitionTime?: number): Promise<any> {
    const command: HueLightCommand = { on: false };
    if (transitionTime !== undefined) {
      command.transitiontime = transitionTime;
    }
    return this.setLightState(bridgeIp, username, lightId, command);
  }

  /**
   * Set brightness (0-254)
   */
  async setBrightness(
    bridgeIp: string,
    username: string,
    lightId: string,
    brightness: number,
    transitionTime?: number
  ): Promise<any> {
    const command: HueLightCommand = {
      on: true,
      bri: Math.max(0, Math.min(254, Math.round(brightness))),
    };
    if (transitionTime !== undefined) {
      command.transitiontime = transitionTime;
    }
    return this.setLightState(bridgeIp, username, lightId, command);
  }

  /**
   * Set color using hue and saturation
   */
  async setColor(
    bridgeIp: string,
    username: string,
    lightId: string,
    hue: number,
    saturation: number,
    transitionTime?: number
  ): Promise<any> {
    const command: HueLightCommand = {
      on: true,
      hue: Math.max(0, Math.min(65535, Math.round(hue))),
      sat: Math.max(0, Math.min(254, Math.round(saturation))),
    };
    if (transitionTime !== undefined) {
      command.transitiontime = transitionTime;
    }
    return this.setLightState(bridgeIp, username, lightId, command);
  }

  /**
   * Set color temperature (153-500 mireds)
   */
  async setColorTemperature(
    bridgeIp: string,
    username: string,
    lightId: string,
    temperature: number,
    transitionTime?: number
  ): Promise<any> {
    const command: HueLightCommand = {
      on: true,
      ct: Math.max(153, Math.min(500, Math.round(temperature))),
    };
    if (transitionTime !== undefined) {
      command.transitiontime = transitionTime;
    }
    return this.setLightState(bridgeIp, username, lightId, command);
  }

  /**
   * Set color using RGB (converted to XY color space)
   */
  async setRGB(
    bridgeIp: string,
    username: string,
    lightId: string,
    r: number,
    g: number,
    b: number,
    transitionTime?: number
  ): Promise<any> {
    const xy = this.rgbToXY(r, g, b);
    const command: HueLightCommand = {
      on: true,
      xy,
    };
    if (transitionTime !== undefined) {
      command.transitiontime = transitionTime;
    }
    return this.setLightState(bridgeIp, username, lightId, command);
  }

  /**
   * Convert RGB to XY color space for Hue lights
   */
  private rgbToXY(r: number, g: number, b: number): [number, number] {
    // Normalize RGB values
    r = r / 255;
    g = g / 255;
    b = b / 255;

    // Apply gamma correction
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    // Convert to XYZ
    const X = r * 0.664511 + g * 0.154324 + b * 0.162028;
    const Y = r * 0.283881 + g * 0.668433 + b * 0.047685;
    const Z = r * 0.000088 + g * 0.072310 + b * 0.986039;

    // Convert to xy
    const sum = X + Y + Z;
    if (sum === 0) {
      return [0, 0];
    }

    const x = X / sum;
    const y = Y / sum;

    return [Math.round(x * 10000) / 10000, Math.round(y * 10000) / 10000];
  }

  /**
   * Create scene (group of light states)
   */
  async createScene(
    bridgeIp: string,
    username: string,
    name: string,
    lights: string[]
  ): Promise<string> {
    try {
      const response = await fetch(`http://${bridgeIp}/api/${username}/scenes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          lights,
          recycle: false,
        }),
      });

      const result = await response.json();
      
      if (result[0]?.error) {
        throw new Error(result[0].error.description);
      }

      const sceneId = result[0]?.success?.id;
      console.log(`[PhilipsHue] Created scene: ${name}`);
      return sceneId;
    } catch (error) {
      console.error('[PhilipsHue] Failed to create scene:', error);
      throw error;
    }
  }

  /**
   * Activate scene
   */
  async activateScene(bridgeIp: string, username: string, sceneId: string): Promise<any> {
    try {
      const response = await fetch(`http://${bridgeIp}/api/${username}/groups/0/action`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scene: sceneId,
        }),
      });

      const result = await response.json();
      
      if (result[0]?.error) {
        throw new Error(result[0].error.description);
      }

      console.log(`[PhilipsHue] Activated scene: ${sceneId}`);
      return result;
    } catch (error) {
      console.error('[PhilipsHue] Failed to activate scene:', error);
      throw error;
    }
  }
}

export default new PhilipsHueController();
