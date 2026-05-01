import winston from 'winston';

// Define log levels and colors
const logLevels = {
  critical: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5
};

const logColors = {
  critical: 'red',
  error: 'red',
  warn: 'yellow', 
  info: 'green',
  debug: 'blue',
  trace: 'magenta'
};

winston.addColors(logColors);

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, category, event, userId, requestId, duration, metadata, stack }) => {
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...(category && { category }),
      ...(event && { event }),
      ...(userId && { userId }),
      ...(requestId && { requestId }),
      ...(duration && { duration }),
      ...(metadata && { metadata }),
      ...(stack && { stack })
    };
    return JSON.stringify(logEntry);
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, category, event, userId, requestId, duration }) => {
    let logLine = `${timestamp} [${level}] ${message}`;
    
    if (category) logLine += ` [${category}]`;
    if (event) logLine += ` [${event}]`;
    if (userId) logLine += ` [User: ${userId}]`;
    if (requestId) logLine += ` [Req: ${requestId}]`;
    if (duration) logLine += ` [${duration}ms]`;
    
    return logLine;
  })
);

// Create Winston logger instance - AWS-friendly (no file logging)
const logger = winston.createLogger({
  levels: logLevels,
  format: logFormat,
  defaultMeta: {
    service: 'codequest-api',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  },
  
  // Only console transports - AWS CloudWatch will capture these
  transports: [],
  
  // Handle uncaught exceptions via console (CloudWatch captures these)
  exceptionHandlers: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      )
    })
  ],
  
  rejectionHandlers: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      )
    })
  ]
});

// AWS-friendly console logging (CloudWatch captures console output)
if (process.env.NODE_ENV === 'development') {
  // Development: Use colorized console output for readability
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'debug'
  }));
} else {
  // Production: JSON format for AWS CloudWatch structured logging
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    level: 'info' // Only important logs in production
  }));
  
  // Separate console transport for errors (always visible)
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    level: 'error'
  }));
}

// Audit event categories
const AuditCategories = {
  USER_ACTIONS: 'USER_ACTIONS',
  CHALLENGE_EVENTS: 'CHALLENGE_EVENTS',
  PERFORMANCE: 'PERFORMANCE',
  SECURITY: 'SECURITY',
  SYSTEM: 'SYSTEM',
  DATABASE: 'DATABASE',
  CACHE: 'CACHE',
  AUTH: 'AUTH',
  API: 'API'
};

class AuditService {
  constructor() {
    this.logger = logger;
    this.categories = AuditCategories;
    this.activeTraces = new Map(); // For tracking ongoing operations
  }

  // Generate unique request/trace IDs
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Core logging methods
  critical(message, metadata = {}) {
    this.logger.critical(message, metadata);
  }

  error(message, error = null, metadata = {}) {
    const logData = {
      ...metadata,
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      })
    };
    this.logger.error(message, logData);
  }

  warn(message, metadata = {}) {
    this.logger.warn(message, metadata);
  }

  info(message, metadata = {}) {
    this.logger.info(message, metadata);
  }

  debug(message, metadata = {}) {
    this.logger.debug(message, metadata);
  }

  trace(message, metadata = {}) {
    this.logger.trace(message, metadata);
  }

  // Specialized logging methods

  // User action logging
  userAction(event, metadata = {}) {
    this.info(`User action: ${event}`, {
      category: this.categories.USER_ACTIONS,
      event,
      ...metadata
    });
  }

  // Challenge event logging
  challengeEvent(event, metadata = {}) {
    this.info(`Challenge event: ${event}`, {
      category: this.categories.CHALLENGE_EVENTS,
      event,
      ...metadata
    });
  }

  // Performance logging
  performance(event, metadata = {}) {
    this.info(`Performance: ${event}`, {
      category: this.categories.PERFORMANCE,
      event,
      ...metadata
    });
  }

  // Security event logging
  security(event, metadata = {}) {
    this.warn(`Security event: ${event}`, {
      category: this.categories.SECURITY,
      event,
      ...metadata
    });
  }

  // System event logging
  systemEvent(event, metadata = {}) {
    this.info(`System: ${event}`, {
      category: this.categories.SYSTEM,
      event,
      ...metadata
    });
  }

  // Database operation logging
  dbOperation(operation, metadata = {}) {
    this.debug(`Database: ${operation}`, {
      category: this.categories.DATABASE,
      event: operation,
      ...metadata
    });
  }

  // Cache operation logging
  cacheEvent(operation, metadata = {}) {
    this.debug(`Cache: ${operation}`, {
      category: this.categories.CACHE,
      event: operation,
      ...metadata
    });
  }

  // Authentication event logging
  authEvent(event, metadata = {}) {
    this.info(`Auth: ${event}`, {
      category: this.categories.AUTH,
      event,
      ...metadata
    });
  }

  // API request/response logging
  apiEvent(event, metadata = {}) {
    this.info(`API: ${event}`, {
      category: this.categories.API,
      event,
      ...metadata
    });
  }

  // Operation tracing (for tracking multi-step operations)
  startTrace(operation, metadata = {}) {
    const traceId = this.generateId();
    const startTime = Date.now();
    
    this.activeTraces.set(traceId, {
      operation,
      startTime,
      metadata
    });

    this.debug(`Started: ${operation}`, {
      traceId,
      operation,
      ...metadata
    });

    return {
      traceId,
      complete: (result = {}) => this.completeTrace(traceId, result),
      error: (error) => this.errorTrace(traceId, error),
      update: (update) => this.updateTrace(traceId, update)
    };
  }

  completeTrace(traceId, result = {}) {
    const trace = this.activeTraces.get(traceId);
    if (!trace) return;

    const duration = Date.now() - trace.startTime;
    this.activeTraces.delete(traceId);

    this.info(`Completed: ${trace.operation}`, {
      traceId,
      operation: trace.operation,
      duration,
      ...trace.metadata,
      ...result
    });

    return { traceId, duration, success: true };
  }

  errorTrace(traceId, error) {
    const trace = this.activeTraces.get(traceId);
    if (!trace) return;

    const duration = Date.now() - trace.startTime;
    this.activeTraces.delete(traceId);

    this.error(`Failed: ${trace.operation}`, error, {
      traceId,
      operation: trace.operation,
      duration,
      ...trace.metadata
    });

    return { traceId, duration, success: false, error };
  }

  updateTrace(traceId, update) {
    const trace = this.activeTraces.get(traceId);
    if (!trace) return;

    this.debug(`Progress: ${trace.operation}`, {
      traceId,
      operation: trace.operation,
      ...update
    });
  }

  // Request context helper (for middleware)
  createRequestContext(req) {
    const requestId = this.generateId();
    const startTime = Date.now();

    return {
      requestId,
      startTime,
      userId: req.user?._id?.toString(),
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      method: req.method,
      url: req.originalUrl,
      
      // Helper methods for this request
      log: (level, message, metadata = {}) => {
        this[level](message, {
          requestId,
          userId: req.user?._id?.toString(),
          ip: req.ip,
          ...metadata
        });
      },

      logDuration: () => {
        const duration = Date.now() - startTime;
        this.performance('request_completed', {
          requestId,
          method: req.method,
          url: req.originalUrl,
          duration,
          userId: req.user?._id?.toString()
        });
        return duration;
      }
    };
  }

  // Graceful shutdown
  shutdown() {
    try {
      this.info('Audit service shutting down...');
      
      // Complete any pending traces
      for (const [traceId, trace] of this.activeTraces.entries()) {
        this.warn(`Force completing trace: ${trace.operation}`, {
          traceId,
          reason: 'shutdown'
        });
      }
      this.activeTraces.clear();

      // Close logger transports gracefully
      if (this.logger && this.logger.close) {
        this.logger.close();
      }
      console.log('Audit service shutdown complete');
    } catch (error) {
      // Failsafe: just use console.log if logger fails
      console.log('Audit service shutdown completed with errors:', error.message);
    }
  }

  // Get logger stats (useful for monitoring)
  getStats() {
    return {
      activeTraces: this.activeTraces.size,
      logLevel: this.logger.level,
      transports: this.logger.transports.length
    };
  }
}

// Create and export singleton instance
const auditService = new AuditService();

export default auditService;
export { AuditCategories };