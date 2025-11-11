/**
 * JarvisLoggerService
 * 
 * Centralized logging service for JARVIS with formatted output
 * Provides consistent log formatting across all services
 */

export class JarvisLogger {
  /**
   * Log a general message with JARVIS prefix
   */
  static log(...args: any[]): void {
    console.log('[JARVIS]', ...args);
  }

  /**
   * Log a success message with checkmark
   */
  static success(msg: string, ...args: any[]): void {
    console.log(`✅ ${msg}`, ...args);
  }

  /**
   * Log a warning message
   */
  static warn(msg: string, ...args: any[]): void {
    console.warn(`⚠️  ${msg}`, ...args);
  }

  /**
   * Log an error message
   */
  static error(msg: string, ...args: any[]): void {
    console.error(`❌ ${msg}`, ...args);
  }

  /**
   * Log an info message with icon
   */
  static info(msg: string, ...args: any[]): void {
    console.log(`ℹ️  ${msg}`, ...args);
  }

  /**
   * Log a debug message (only in development)
   */
  static debug(msg: string, ...args: any[]): void {
    if (__DEV__) {
      console.log(`🐛 ${msg}`, ...args);
    }
  }

  /**
   * Log a startup stage
   */
  static stage(stageName: string, ...args: any[]): void {
    console.log(`🚀 [${stageName}]`, ...args);
  }

  /**
   * Log a system status
   */
  static status(statusType: 'online' | 'offline' | 'ready' | 'busy', service: string, ...args: any[]): void {
    const icons = {
      online: '🟢',
      offline: '🔴',
      ready: '✅',
      busy: '🔄'
    };
    console.log(`${icons[statusType]} ${service}`, ...args);
  }
}

export default JarvisLogger;
