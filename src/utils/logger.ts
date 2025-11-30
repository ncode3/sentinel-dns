/**
 * Simple logger utility for the DNS Sentinel application.
 * Provides structured logging with timestamps and log levels.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

/**
 * Formats a log entry for console output
 */
const formatLogEntry = (entry: LogEntry): string => {
  const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
  return `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}${contextStr}`;
};

/**
 * Creates a log entry with the current timestamp
 */
const createLogEntry = (
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>
): LogEntry => ({
  timestamp: new Date().toISOString(),
  level,
  message,
  context,
});

/**
 * Logger instance with methods for each log level.
 * In production, this could be extended to send logs to a remote service.
 */
export const logger = {
  /**
   * Log debug information (verbose, development only)
   */
  debug: (message: string, context?: Record<string, unknown>): void => {
    if (process.env.NODE_ENV === 'development') {
      const entry = createLogEntry('debug', message, context);
      console.debug(formatLogEntry(entry));
    }
  },

  /**
   * Log general information
   */
  info: (message: string, context?: Record<string, unknown>): void => {
    const entry = createLogEntry('info', message, context);
    console.info(formatLogEntry(entry));
  },

  /**
   * Log warnings (non-critical issues)
   */
  warn: (message: string, context?: Record<string, unknown>): void => {
    const entry = createLogEntry('warn', message, context);
    console.warn(formatLogEntry(entry));
  },

  /**
   * Log errors (critical issues)
   */
  error: (message: string, context?: Record<string, unknown>): void => {
    const entry = createLogEntry('error', message, context);
    console.error(formatLogEntry(entry));
  },
};

export default logger;
