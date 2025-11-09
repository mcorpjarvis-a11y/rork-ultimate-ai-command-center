/**
 * Nest Thermostat Controller
 * Real integration with Google Nest API (Device Access)
 * Requires Google OAuth and Device Access project
 */

export interface NestDevice {
  name: string;
  type: string;
  traits: Record<string, any>;
  parentRelations?: Array<{
    parent: string;
    displayName: string;
  }>;
}

export interface NestThermostat extends NestDevice {
  traits: {
    'sdm.devices.traits.Info': {
      customName: string;
    };
    'sdm.devices.traits.Temperature': {
      ambientTemperatureCelsius: number;
    };
    'sdm.devices.traits.Humidity': {
      ambientHumidityPercent: number;
    };
    'sdm.devices.traits.ThermostatMode': {
      mode: 'OFF' | 'HEAT' | 'COOL' | 'HEATCOOL';
      availableModes: string[];
    };
    'sdm.devices.traits.ThermostatTemperatureSetpoint': {
      heatCelsius?: number;
      coolCelsius?: number;
    };
  };
}

class NestController {
  private readonly baseURL = 'https://smartdevicemanagement.googleapis.com/v1';

  /**
   * List all Nest devices
   */
  async listDevices(accessToken: string, projectId: string): Promise<NestDevice[]> {
    try {
      const response = await fetch(
        `${this.baseURL}/enterprises/${projectId}/devices`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to list Nest devices: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`[Nest] Retrieved ${data.devices?.length || 0} device(s)`);
      return data.devices || [];
    } catch (error) {
      console.error('[Nest] Failed to list devices:', error);
      throw error;
    }
  }

  /**
   * Get single device info
   */
  async getDevice(accessToken: string, deviceName: string): Promise<NestDevice> {
    try {
      const response = await fetch(`${this.baseURL}/${deviceName}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get Nest device: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[Nest] Failed to get device:', error);
      throw error;
    }
  }

  /**
   * Set thermostat mode
   */
  async setThermostatMode(
    accessToken: string,
    deviceName: string,
    mode: 'OFF' | 'HEAT' | 'COOL' | 'HEATCOOL'
  ): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/${deviceName}:executeCommand`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: 'sdm.devices.commands.ThermostatMode.SetMode',
          params: { mode },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to set thermostat mode: ${response.statusText}`);
      }

      console.log(`[Nest] Set mode to ${mode}`);
      return await response.json();
    } catch (error) {
      console.error('[Nest] Failed to set mode:', error);
      throw error;
    }
  }

  /**
   * Set heat temperature setpoint
   */
  async setHeatTemperature(
    accessToken: string,
    deviceName: string,
    temperatureCelsius: number
  ): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/${deviceName}:executeCommand`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: 'sdm.devices.commands.ThermostatTemperatureSetpoint.SetHeat',
          params: { heatCelsius: temperatureCelsius },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to set heat temperature: ${response.statusText}`);
      }

      console.log(`[Nest] Set heat to ${temperatureCelsius}°C`);
      return await response.json();
    } catch (error) {
      console.error('[Nest] Failed to set heat temperature:', error);
      throw error;
    }
  }

  /**
   * Set cool temperature setpoint
   */
  async setCoolTemperature(
    accessToken: string,
    deviceName: string,
    temperatureCelsius: number
  ): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/${deviceName}:executeCommand`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: 'sdm.devices.commands.ThermostatTemperatureSetpoint.SetCool',
          params: { coolCelsius: temperatureCelsius },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to set cool temperature: ${response.statusText}`);
      }

      console.log(`[Nest] Set cool to ${temperatureCelsius}°C`);
      return await response.json();
    } catch (error) {
      console.error('[Nest] Failed to set cool temperature:', error);
      throw error;
    }
  }

  /**
   * Set temperature range for heat/cool mode
   */
  async setTemperatureRange(
    accessToken: string,
    deviceName: string,
    heatCelsius: number,
    coolCelsius: number
  ): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/${deviceName}:executeCommand`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: 'sdm.devices.commands.ThermostatTemperatureSetpoint.SetRange',
          params: { heatCelsius, coolCelsius },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to set temperature range: ${response.statusText}`);
      }

      console.log(`[Nest] Set range to ${heatCelsius}°C - ${coolCelsius}°C`);
      return await response.json();
    } catch (error) {
      console.error('[Nest] Failed to set temperature range:', error);
      throw error;
    }
  }

  /**
   * Get camera live stream (for Nest Cam)
   */
  async generateCameraStream(
    accessToken: string,
    deviceName: string
  ): Promise<{ streamUrls: { rtspUrl: string } }> {
    try {
      const response = await fetch(`${this.baseURL}/${deviceName}:executeCommand`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command: 'sdm.devices.commands.CameraLiveStream.GenerateRtspStream',
          params: {},
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate camera stream: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[Nest] Generated camera stream');
      return data.results;
    } catch (error) {
      console.error('[Nest] Failed to generate camera stream:', error);
      throw error;
    }
  }
}

export default new NestController();
