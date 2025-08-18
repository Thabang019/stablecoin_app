import { config } from './config';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: any;
  userId?: string;
}

class Logger {
  private level: LogLevel;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  constructor() {
    this.level = config.debugMode ? LogLevel.DEBUG : LogLevel.INFO;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.level;
  }

  private createLogEntry(level: LogLevel, message: string, context?: any): LogEntry {
    const userId = this.getCurrentUserId();
    return {
      level,
      message,
      timestamp: new Date(),
      context,
      userId,
    };
  }

  private getCurrentUserId(): string | undefined {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const parsed = JSON.parse(user);
        return parsed.user?.id;
      }
    } catch {
      // Ignore errors
    }
    return undefined;
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = LogLevel[entry.level];
    const userId = entry.userId ? ` [${entry.userId.slice(-6)}]` : '';
    return `[${timestamp}] ${level}${userId}: ${entry.message}`;
  }

  error(message: string, context?: any): void {
    const entry = this.createLogEntry(LogLevel.ERROR, message, context);
    this.addLog(entry);
    
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage(entry), context);
    }

    // Send to external service in production
    if (config.enableAnalytics && !config.debugMode) {
      this.sendToExternalService(entry);
    }
  }

  warn(message: string, context?: any): void {
    const entry = this.createLogEntry(LogLevel.WARN, message, context);
    this.addLog(entry);
    
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(entry), context);
    }
  }

  info(message: string, context?: any): void {
    const entry = this.createLogEntry(LogLevel.INFO, message, context);
    this.addLog(entry);
    
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage(entry), context);
    }
  }

  debug(message: string, context?: any): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context);
    this.addLog(entry);
    
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage(entry), context);
    }
  }

  // Get recent logs for debugging
  getRecentLogs(count = 50): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
  }

  // Export logs for debugging
  exportLogs(): string {
    return this.logs.map(entry => this.formatMessage(entry)).join('\n');
  }

  private async sendToExternalService(entry: LogEntry): Promise<void> {
    try {
      // TODO: Implement external logging service
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(entry)
      // });
    } catch (error) {
      console.error('Failed to send log to external service:', error);
    }
  }
}

// Export singleton logger
export const logger = new Logger();

// Convenience functions
export const logError = (message: string, context?: any) => logger.error(message, context);
export const logWarn = (message: string, context?: any) => logger.warn(message, context);
export const logInfo = (message: string, context?: any) => logger.info(message, context);
export const logDebug = (message: string, context?: any) => logger.debug(message, context);