/**
 * Ring Doorbell/Camera Controller
 * Real integration with Ring API (unofficial but stable)
 * Supports doorbells, cameras, and security devices
 */

export interface RingLocation {
  location_id: string;
  name: string;
  address: string;
  geo_coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface RingDevice {
  id: number;
  description: string;
  device_id: string;
  kind: string;
  latitude: number;
  longitude: number;
  address: string;
  settings: Record<string, any>;
  features: Record<string, any>;
  battery_life?: number;
  firmware_version: string;
}

export interface RingEvent {
  id: number;
  created_at: string;
  kind: 'motion' | 'ding' | 'on_demand';
  answered: boolean;
  recording: {
    status: string;
  };
}

class RingController {
  private readonly baseURL = 'https://api.ring.com';
  private readonly authURL = 'https://oauth.ring.com/oauth/token';

  /**
   * Authenticate with Ring (using email/password)
   * Returns refresh token for future use
   */
  async authenticate(email: string, password: string): Promise<{ refresh_token: string; access_token: string }> {
    try {
      const response = await fetch(this.authURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'password',
          username: email,
          password: password,
          client_id: 'ring_official_android',
          scope: 'client',
        }),
      });

      if (!response.ok) {
        throw new Error(`Ring authentication failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[Ring] Authentication successful');
      return {
        refresh_token: data.refresh_token,
        access_token: data.access_token,
      };
    } catch (error) {
      console.error('[Ring] Authentication failed:', error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    try {
      const response = await fetch(this.authURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: 'ring_official_android',
          scope: 'client',
        }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`);
      }

      const data = await response.json();
      return { access_token: data.access_token };
    } catch (error) {
      console.error('[Ring] Token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Get all Ring locations (homes)
   */
  async getLocations(accessToken: string): Promise<RingLocation[]> {
    try {
      const response = await fetch(`${this.baseURL}/clients_api/ring_devices`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get Ring locations: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`[Ring] Retrieved ${data.user_locations?.length || 0} location(s)`);
      return data.user_locations || [];
    } catch (error) {
      console.error('[Ring] Failed to get locations:', error);
      throw error;
    }
  }

  /**
   * Get all devices for a location
   */
  async getDevices(accessToken: string): Promise<{
    doorbots: RingDevice[];
    stickup_cams: RingDevice[];
    chimes: RingDevice[];
  }> {
    try {
      const response = await fetch(`${this.baseURL}/clients_api/ring_devices`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get Ring devices: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`[Ring] Retrieved devices`);
      return {
        doorbots: data.doorbots || [],
        stickup_cams: data.stickup_cams || [],
        chimes: data.chimes || [],
      };
    } catch (error) {
      console.error('[Ring] Failed to get devices:', error);
      throw error;
    }
  }

  /**
   * Get device health
   */
  async getDeviceHealth(accessToken: string, deviceId: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseURL}/clients_api/doorbots/${deviceId}/health`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get device health: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[Ring] Failed to get device health:', error);
      throw error;
    }
  }

  /**
   * Get recent events for a device
   */
  async getDeviceEvents(
    accessToken: string,
    deviceId: string,
    limit: number = 10
  ): Promise<RingEvent[]> {
    try {
      const response = await fetch(
        `${this.baseURL}/clients_api/doorbots/${deviceId}/history?limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get device events: ${response.statusText}`);
      }

      const events = await response.json();
      console.log(`[Ring] Retrieved ${events.length} event(s)`);
      return events;
    } catch (error) {
      console.error('[Ring] Failed to get device events:', error);
      throw error;
    }
  }

  /**
   * Get recording URL for an event
   */
  async getRecordingUrl(accessToken: string, eventId: number): Promise<string> {
    try {
      const response = await fetch(
        `${this.baseURL}/clients_api/dings/${eventId}/recording`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get recording URL: ${response.statusText}`);
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('[Ring] Failed to get recording URL:', error);
      throw error;
    }
  }

  /**
   * Turn on motion detection
   */
  async enableMotionDetection(accessToken: string, deviceId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseURL}/clients_api/doorbots/${deviceId}/motion_settings`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            doorbot: {
              settings: {
                motion_detection_enabled: true,
              },
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to enable motion detection: ${response.statusText}`);
      }

      console.log('[Ring] Motion detection enabled');
    } catch (error) {
      console.error('[Ring] Failed to enable motion detection:', error);
      throw error;
    }
  }

  /**
   * Turn off motion detection
   */
  async disableMotionDetection(accessToken: string, deviceId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseURL}/clients_api/doorbots/${deviceId}/motion_settings`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            doorbot: {
              settings: {
                motion_detection_enabled: false,
              },
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to disable motion detection: ${response.statusText}`);
      }

      console.log('[Ring] Motion detection disabled');
    } catch (error) {
      console.error('[Ring] Failed to disable motion detection:', error);
      throw error;
    }
  }

  /**
   * Trigger siren (for Ring Alarm)
   */
  async triggerSiren(accessToken: string, deviceId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseURL}/clients_api/doorbots/${deviceId}/siren_on`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to trigger siren: ${response.statusText}`);
      }

      console.log('[Ring] Siren triggered');
    } catch (error) {
      console.error('[Ring] Failed to trigger siren:', error);
      throw error;
    }
  }

  /**
   * Turn off siren
   */
  async turnOffSiren(accessToken: string, deviceId: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseURL}/clients_api/doorbots/${deviceId}/siren_off`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to turn off siren: ${response.statusText}`);
      }

      console.log('[Ring] Siren turned off');
    } catch (error) {
      console.error('[Ring] Failed to turn off siren:', error);
      throw error;
    }
  }
}

export default new RingController();
