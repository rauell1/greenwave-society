/**
 * Structured Logger
 *
 * Provides consistent, structured logging across the application.
 * Includes request context, timestamps, and severity levels.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    message: string;
    stack?: string;
    name: string;
  };
}

class Logger {
  private serviceName: string;
  private baseContext: LogContext;

  constructor(serviceName: string = "greenwave-society", baseContext: LogContext = {}) {
    this.serviceName = serviceName;
    this.baseContext = baseContext;
  }

  private formatLog(level: LogLevel, message: string, context?: LogContext, error?: Error): LogEntry {
    const mergedContext = { ...this.baseContext, ...context };
    const hasContext = Object.keys(mergedContext).length > 0;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(hasContext && { context: { ...mergedContext, service: this.serviceName } }),
    };

    if (error) {
      entry.error = {
        message: error.message,
        name: error.name,
        stack: error.stack,
      };
    }

    return entry;
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    const entry = this.formatLog(level, message, context, error);

    if (process.env.NODE_ENV === "production") {
      // In production, output JSON for log aggregation tools
      console.log(JSON.stringify(entry));
    } else {
      // In development, output human-readable logs
      const levelEmoji = {
        debug: "🔍",
        info: "ℹ️",
        warn: "⚠️",
        error: "❌",
      };

      console.log(`${levelEmoji[level]} [${level.toUpperCase()}] ${message}`);
      const mergedContext = { ...this.baseContext, ...context };
      if (Object.keys(mergedContext).length > 0) {
        console.log("  Context:", mergedContext);
      }
      if (error) {
        console.error("  Error:", error.message);
        if (error.stack) console.error(error.stack);
      }
    }
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV !== "production") {
      this.log("debug", message, context);
    }
  }

  info(message: string, context?: LogContext): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log("warn", message, context);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    this.log("error", message, context, error);
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): Logger {
    return new Logger(this.serviceName, { ...this.baseContext, ...context });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export class for testing
export { Logger };
