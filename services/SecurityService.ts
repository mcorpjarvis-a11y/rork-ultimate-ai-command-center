import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

export interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'api_access' | 'data_export' | 'settings_change' | 'suspicious_activity';
  description: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AccessToken {
  id: string;
  name: string;
  token: string;
  permissions: string[];
  createdAt: number;
  lastUsed: number | null;
  expiresAt: number | null;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  ipWhitelist: string[];
  apiRateLimiting: boolean;
  dataEncryptionEnabled: boolean;
  auditLoggingEnabled: boolean;
  suspiciousActivityDetection: boolean;
}

class SecurityService {
  private readonly EVENTS_KEY = 'security_events';
  private readonly TOKENS_KEY = 'access_tokens';
  private readonly SETTINGS_KEY = 'security_settings';
  private readonly MAX_EVENTS = 1000;

  private defaultSettings: SecuritySettings = {
    twoFactorEnabled: false,
    sessionTimeout: 3600000,
    ipWhitelist: [],
    apiRateLimiting: true,
    dataEncryptionEnabled: true,
    auditLoggingEnabled: true,
    suspiciousActivityDetection: true,
  };

  async initialize() {
    const settings = await this.getSettings();
    if (!settings) {
      await this.saveSettings(this.defaultSettings);
    }
  }

  async logEvent(
    type: SecurityEvent['type'],
    description: string,
    severity: SecurityEvent['severity'] = 'low',
    category: string = 'System'
  ) {
    const settings = await this.getSettings();
    if (!settings?.auditLoggingEnabled) return;

    const event: SecurityEvent = {
      id: Date.now().toString(),
      type,
      description,
      timestamp: Date.now(),
      severity,
      category,
    };

    try {
      const stored = await AsyncStorage.getItem(this.EVENTS_KEY);
      const events: SecurityEvent[] = stored ? JSON.parse(stored) : [];
      events.unshift(event);
      
      if (events.length > this.MAX_EVENTS) {
        events.splice(this.MAX_EVENTS);
      }

      await AsyncStorage.setItem(this.EVENTS_KEY, JSON.stringify(events));
      
      if (severity === 'critical') {
        console.error('CRITICAL SECURITY EVENT:', description);
      }
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  async getEvents(limit?: number): Promise<SecurityEvent[]> {
    try {
      const stored = await AsyncStorage.getItem(this.EVENTS_KEY);
      if (!stored) return [];
      
      const events: SecurityEvent[] = JSON.parse(stored);
      return limit ? events.slice(0, limit) : events;
    } catch (error) {
      console.error('Failed to get security events:', error);
      return [];
    }
  }

  async generateAccessToken(name: string, permissions: string[]): Promise<AccessToken> {
    const token = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${Date.now()}-${Math.random()}-${name}`
    );

    const accessToken: AccessToken = {
      id: Date.now().toString(),
      name,
      token: `act_${token.substring(0, 32)}`,
      permissions,
      createdAt: Date.now(),
      lastUsed: null,
      expiresAt: null,
    };

    try {
      const stored = await AsyncStorage.getItem(this.TOKENS_KEY);
      const tokens: AccessToken[] = stored ? JSON.parse(stored) : [];
      tokens.push(accessToken);
      await AsyncStorage.setItem(this.TOKENS_KEY, JSON.stringify(tokens));
      
      await this.logEvent('api_access', `Access token created: ${name}`, 'medium');
      
      return accessToken;
    } catch (error) {
      console.error('Failed to generate access token:', error);
      throw error;
    }
  }

  async getAccessTokens(): Promise<AccessToken[]> {
    try {
      const stored = await AsyncStorage.getItem(this.TOKENS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get access tokens:', error);
      return [];
    }
  }

  async revokeAccessToken(id: string): Promise<boolean> {
    try {
      const tokens = await this.getAccessTokens();
      const filtered = tokens.filter(t => t.id !== id);
      await AsyncStorage.setItem(this.TOKENS_KEY, JSON.stringify(filtered));
      await this.logEvent('api_access', `Access token revoked`, 'medium');
      return true;
    } catch (error) {
      console.error('Failed to revoke access token:', error);
      return false;
    }
  }

  async validateToken(token: string): Promise<AccessToken | null> {
    const tokens = await this.getAccessTokens();
    const found = tokens.find(t => t.token === token);
    
    if (found && (!found.expiresAt || Date.now() < found.expiresAt)) {
      found.lastUsed = Date.now();
      const updated = tokens.map(t => t.id === found.id ? found : t);
      await AsyncStorage.setItem(this.TOKENS_KEY, JSON.stringify(updated));
      return found;
    }
    
    return null;
  }

  async encryptData(data: string, key: string): Promise<string> {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      key
    );
    
    const encrypted = Buffer.from(data).toString('base64');
    return `${hash.substring(0, 8)}:${encrypted}`;
  }

  async decryptData(encrypted: string, key: string): Promise<string> {
    const [hash, data] = encrypted.split(':');
    const expectedHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      key
    );
    
    if (hash !== expectedHash.substring(0, 8)) {
      throw new Error('Invalid decryption key');
    }
    
    return Buffer.from(data, 'base64').toString();
  }

  async getSettings(): Promise<SecuritySettings | null> {
    try {
      const stored = await AsyncStorage.getItem(this.SETTINGS_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to get security settings:', error);
      return null;
    }
  }

  async saveSettings(settings: SecuritySettings): Promise<boolean> {
    try {
      await AsyncStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
      await this.logEvent('settings_change', 'Security settings updated', 'medium');
      return true;
    } catch (error) {
      console.error('Failed to save security settings:', error);
      return false;
    }
  }

  async detectSuspiciousActivity(activity: string): Promise<boolean> {
    const settings = await this.getSettings();
    if (!settings?.suspiciousActivityDetection) return false;

    const suspiciousPatterns = [
      /multiple.*failed.*attempt/i,
      /unauthorized.*access/i,
      /brute.*force/i,
      /sql.*injection/i,
      /xss.*attack/i,
    ];

    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(activity));
    
    if (isSuspicious) {
      await this.logEvent('suspicious_activity', activity, 'critical');
      return true;
    }

    return false;
  }

  async clearAllData() {
    await AsyncStorage.removeItem(this.EVENTS_KEY);
    await AsyncStorage.removeItem(this.TOKENS_KEY);
    await this.logEvent('data_export', 'All security data cleared', 'high');
  }

  async exportSecurityReport(): Promise<string> {
    const events = await this.getEvents();
    const tokens = await this.getAccessTokens();
    const settings = await this.getSettings();

    const report = {
      generatedAt: Date.now(),
      events: events.slice(0, 100),
      activeTokens: tokens.length,
      settings,
      summary: {
        totalEvents: events.length,
        criticalEvents: events.filter(e => e.severity === 'critical').length,
        highSeverityEvents: events.filter(e => e.severity === 'high').length,
        recentActivity: events.slice(0, 10),
      },
    };

    await this.logEvent('data_export', 'Security report exported', 'medium');
    return JSON.stringify(report, null, 2);
  }
}

export default new SecurityService();
