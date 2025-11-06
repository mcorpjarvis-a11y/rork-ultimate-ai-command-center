import { SystemLog } from '@/types/models.types';
import StorageManager from '@/services/storage/StorageManager';

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

class MonitoringService {
  private logs: SystemLog[] = [];
  private maxLogs: number = 10000;
  private listeners: Map<string, ((log: SystemLog) => void)[]>;

  constructor() {
    this.listeners = new Map();
    this.loadLogs();
  }

  private async loadLogs(): Promise<void> {
    try {
      const logs = await StorageManager.get<SystemLog[]>('system_logs', []);
      if (logs) {
        this.logs = logs.slice(-this.maxLogs);
        console.log(`[MonitoringService] Loaded ${logs.length} logs`);
      }
    } catch (error) {
      console.error('[MonitoringService] Failed to load logs:', error);
    }
  }

  private async saveLogs(): Promise<void> {
    try {
      await StorageManager.set('system_logs', this.logs.slice(-this.maxLogs));
    } catch (error) {
      console.error('[MonitoringService] Failed to save logs:', error);
    }
  }

  log(
    level: LogLevel,
    category: string,
    message: string,
    details?: any,
    userId?: string
  ): void {
    const log: SystemLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      level,
      category,
      message,
      details,
      userId,
      timestamp: Date.now(),
      source: 'app',
    };

    this.logs.push(log);

    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    if (level === 'error' || level === 'critical') {
      console.error(`[${category}] ${message}`, details);
    } else if (level === 'warn') {
      console.warn(`[${category}] ${message}`, details);
    } else {
      console.log(`[${category}] ${message}`, details);
    }

    this.notifyListeners(log);

    if (this.logs.length % 100 === 0) {
      this.saveLogs();
    }
  }

  debug(category: string, message: string, details?: any): void {
    this.log('debug', category, message, details);
  }

  info(category: string, message: string, details?: any): void {
    this.log('info', category, message, details);
  }

  warn(category: string, message: string, details?: any): void {
    this.log('warn', category, message, details);
  }

  error(category: string, message: string, details?: any): void {
    this.log('error', category, message, details);
  }

  critical(category: string, message: string, details?: any): void {
    this.log('critical', category, message, details);
  }

  getLogs(
    filter?: {
      level?: LogLevel[];
      category?: string[];
      startTime?: number;
      endTime?: number;
      limit?: number;
    }
  ): SystemLog[] {
    let filtered = [...this.logs];

    if (filter?.level) {
      filtered = filtered.filter(log => filter.level!.includes(log.level));
    }

    if (filter?.category) {
      filtered = filtered.filter(log => filter.category!.includes(log.category));
    }

    if (filter?.startTime) {
      filtered = filtered.filter(log => log.timestamp >= filter.startTime!);
    }

    if (filter?.endTime) {
      filtered = filtered.filter(log => log.timestamp <= filter.endTime!);
    }

    filtered.sort((a, b) => b.timestamp - a.timestamp);

    if (filter?.limit) {
      filtered = filtered.slice(0, filter.limit);
    }

    return filtered;
  }

  getLogsByCategory(category: string, limit: number = 100): SystemLog[] {
    return this.getLogs({ category: [category], limit });
  }

  getErrorLogs(limit: number = 100): SystemLog[] {
    return this.getLogs({ level: ['error', 'critical'], limit });
  }

  clearLogs(): void {
    this.logs = [];
    this.saveLogs();
    console.log('[MonitoringService] Logs cleared');
  }

  subscribe(id: string, callback: (log: SystemLog) => void): () => void {
    if (!this.listeners.has(id)) {
      this.listeners.set(id, []);
    }
    this.listeners.get(id)!.push(callback);

    return () => this.unsubscribe(id, callback);
  }

  unsubscribe(id: string, callback: (log: SystemLog) => void): void {
    const callbacks = this.listeners.get(id);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private notifyListeners(log: SystemLog): void {
    this.listeners.forEach(callbacks => {
      callbacks.forEach(callback => {
        try {
          callback(log);
        } catch (error) {
          console.error('[MonitoringService] Listener error:', error);
        }
      });
    });
  }

  getStats(): {
    total: number;
    byLevel: Record<LogLevel, number>;
    byCategory: Record<string, number>;
    recentErrors: number;
  } {
    const byLevel: Record<string, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      critical: 0,
    };

    const byCategory: Record<string, number> = {};

    this.logs.forEach(log => {
      byLevel[log.level]++;
      byCategory[log.category] = (byCategory[log.category] || 0) + 1;
    });

    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentErrors = this.logs.filter(
      log => (log.level === 'error' || log.level === 'critical') && log.timestamp > oneHourAgo
    ).length;

    return {
      total: this.logs.length,
      byLevel: byLevel as Record<LogLevel, number>,
      byCategory,
      recentErrors,
    };
  }

  async exportLogs(format: 'json' | 'csv' = 'json'): Promise<string> {
    if (format === 'json') {
      return JSON.stringify(this.logs, null, 2);
    }

    const headers = ['timestamp', 'level', 'category', 'message', 'source'];
    const rows = this.logs.map(log => [
      new Date(log.timestamp).toISOString(),
      log.level,
      log.category,
      log.message.replace(/,/g, ';'),
      log.source,
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }

  // Monitoring lifecycle methods
  startMonitoring(): void {
    console.log('[MonitoringService] Monitoring started');
    this.info('Monitoring', 'System monitoring started');
    // Future: Add performance monitoring, error tracking, etc.
  }

  stopMonitoring(): void {
    console.log('[MonitoringService] Monitoring stopped');
    this.info('Monitoring', 'System monitoring stopped');
    this.saveLogs();
  }
}

export default new MonitoringService();
