const winston = require('winston');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define log levels and colors
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

winston.addColors(logColors);

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create winston logger
const logger = winston.createLogger({
  levels: logLevels,
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'solutil-api' },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      handleExceptions: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      handleExceptions: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),

    // Console output (only in development)
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize({ all: true }),
          winston.format.simple()
        ),
        handleExceptions: true
      })
    ] : [])
  ],
  exitOnError: false
});

// Create a stream object for Morgan HTTP request logging
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

// Helper functions for different log levels
logger.logError = (error, req = null) => {
  const logData = {
    message: error.message,
    stack: error.stack,
    statusCode: error.statusCode || 500
  };

  if (req) {
    logData.request = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id
    };
  }

  logger.error(logData);
};

logger.logInfo = (message, data = {}) => {
  logger.info({ message, ...data });
};

logger.logWarning = (message, data = {}) => {
  logger.warn({ message, ...data });
};

logger.logDebug = (message, data = {}) => {
  logger.debug({ message, ...data });
};

// Log unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

// Log uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', { error: error.message, stack: error.stack });
  process.exit(1);
});

module.exports = logger;
