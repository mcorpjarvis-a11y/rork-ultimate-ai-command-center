import AsyncStorage from '@react-native-async-storage/async-storage';
import { INTEGRATIONS, Integration } from '@/config/integrations.config';

const STORAGE_KEY = '@integrations';

export class IntegrationManager {
  private static instance: IntegrationManager;
  private integrations: Integration[] = [];

  private constructor() {
    this.integrations = [...INTEGRATIONS];
  }

  static getInstance(): IntegrationManager {
    if (!IntegrationManager.instance) {
      IntegrationManager.instance = new IntegrationManager();
    }
    return IntegrationManager.instance;
  }

  async loadIntegrations(): Promise<Integration[]> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.integrations = JSON.parse(stored);
      }
      return this.integrations;
    } catch (error) {
      console.error('Failed to load integrations:', error);
      return this.integrations;
    }
  }

  async saveIntegrations(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.integrations));
    } catch (error) {
      console.error('Failed to save integrations:', error);
    }
  }

  getIntegrations(): Integration[] {
    return this.integrations;
  }

  getIntegrationById(id: string): Integration | undefined {
    return this.integrations.find((integration) => integration.id === id);
  }

  getIntegrationsByCategory(category: string): Integration[] {
    return this.integrations.filter((integration) => integration.category === category);
  }

  getEnabledIntegrations(): Integration[] {
    return this.integrations.filter((integration) => integration.enabled);
  }

  getCriticalIntegrations(): Integration[] {
    return this.integrations.filter((integration) => integration.tier === 'critical');
  }

  async enableIntegration(id: string, credentials?: Record<string, string>): Promise<boolean> {
    const integration = this.getIntegrationById(id);
    if (!integration) return false;

    integration.enabled = true;
    if (credentials) {
      integration.credentials = { ...integration.credentials, ...credentials };
      integration.configured = this.validateCredentials(integration);
    }

    await this.saveIntegrations();
    return true;
  }

  async disableIntegration(id: string): Promise<boolean> {
    const integration = this.getIntegrationById(id);
    if (!integration) return false;

    integration.enabled = false;
    await this.saveIntegrations();
    return true;
  }

  async updateCredentials(id: string, credentials: Record<string, string>): Promise<boolean> {
    const integration = this.getIntegrationById(id);
    if (!integration) return false;

    integration.credentials = { ...integration.credentials, ...credentials };
    integration.configured = this.validateCredentials(integration);
    await this.saveIntegrations();
    return true;
  }

  private validateCredentials(integration: Integration): boolean {
    const requiredFields = Object.keys(integration.credentials);
    return requiredFields.every((field) => {
      const value = integration.credentials[field];
      return value && value.trim().length > 0;
    });
  }

  async testIntegration(id: string): Promise<{ success: boolean; message: string }> {
    const integration = this.getIntegrationById(id);
    if (!integration) {
      return { success: false, message: 'Integration not found' };
    }

    if (!integration.configured) {
      return { success: false, message: 'Please configure credentials first' };
    }

    console.log(`Testing integration: ${integration.name}`);
    return { success: true, message: `${integration.name} configured successfully` };
  }

  getIntegrationStats(): {
    total: number;
    enabled: number;
    configured: number;
    critical: number;
  } {
    return {
      total: this.integrations.length,
      enabled: this.integrations.filter((i) => i.enabled).length,
      configured: this.integrations.filter((i) => i.configured).length,
      critical: this.integrations.filter((i) => i.tier === 'critical').length,
    };
  }
}

export default IntegrationManager.getInstance();
