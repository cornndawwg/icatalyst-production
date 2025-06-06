const winston = require('winston');

// Custom format for better readability
const customFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += `\n${JSON.stringify(metadata, null, 2)}`;
  }
  return msg;
});

// Railway-compatible logger configuration
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    // Always use console transport for Railway deployment
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: false }), // No colors for Railway logs
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        customFormat
      )
    })
  ]
});

// Only add file logging in development with proper error handling
if (process.env.NODE_ENV !== 'production') {
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Create logs directory if it doesn't exist (development only)
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs');
    }
    
    logger.add(new winston.transports.File({ 
      filename: path.join('logs', 'error.log'),
      level: 'error',
      format: customFormat
    }));
    
    logger.add(new winston.transports.File({ 
      filename: path.join('logs', 'combined.log'),
      format: customFormat
    }));
    
  } catch (err) {
    console.warn('File logging disabled - using console only:', err.message);
  }
}

module.exports = { logger }; 