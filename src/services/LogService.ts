/**
 * LogService - Centralized logging service for tracking app events
 */

export enum LogLevel {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  category: string;
  message: string;
}

class LogService {
  private logs: LogEntry[] = [];
  private maxLogs = 500; // Keep last 500 logs
  private listeners: ((logs: LogEntry[]) => void)[] = [];

  // Add a log entry
  log(level: LogLevel, category: string, message: string): void {
    const entry: LogEntry = {
      id: Date.now().toString() + Math.random(),
      timestamp: new Date(),
      level,
      category,
      message,
    };

    this.logs.unshift(entry); // Add to beginning
    
    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Notify listeners
    this.notifyListeners();

    // Also log to console
    const consoleMsg = `[${category}] ${message}`;
    switch (level) {
      case LogLevel.ERROR:
        console.error(consoleMsg);
        break;
      case LogLevel.WARNING:
        console.warn(consoleMsg);
        break;
      default:
        console.log(consoleMsg);
    }
  }

  info(category: string, message: string): void {
    this.log(LogLevel.INFO, category, message);
  }

  success(category: string, message: string): void {
    this.log(LogLevel.SUCCESS, category, message);
  }

  warning(category: string, message: string): void {
    this.log(LogLevel.WARNING, category, message);
  }

  error(category: string, message: string): void {
    this.log(LogLevel.ERROR, category, message);
  }

  // Get all logs
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Subscribe to log updates
  subscribe(listener: (logs: LogEntry[]) => void): () => void {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.logs]));
  }

  // Clear all logs
  clear(): void {
    this.logs = [];
    this.notifyListeners();
  }

  // Export logs as text
  exportAsText(): string {
    return this.logs.map(log => {
      const time = log.timestamp.toLocaleString('zh-TW');
      return `[${time}] [${log.level}] [${log.category}] ${log.message}`;
    }).join('\n');
  }
}

export default new LogService();
