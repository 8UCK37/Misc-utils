const { env } = require('../config/vars'); // "dev" or "prod"
const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

// Function to extract filename and line number
const getCallerInfo = () => {
  const stack = new Error().stack.split('\n')[3]; // Caller line
  const match = stack.match(/\((.*):(\d+):(\d+)\)/);
  if (!match) return { file: 'unknown', line: '0' };
  return { file: path.basename(match[1]), line: match[2] };
};

// Custom format
const myFormat = winston.format.printf(({ level, message, timestamp }) => {
  const { file, line } = getCallerInfo();
  return `[${timestamp}] [${level.toUpperCase()}] [${file}:${line}] → ${message}`;
});

// Define transport with monthly separation
const transport = new winston.transports.DailyRotateFile({
  filename: env === 'prod' ? 'logs/prod-%DATE%.log' : 'logs/dev-%DATE%.log',
  datePattern: 'YYYY-MM', // Monthly logs
  zippedArchive: false,
  maxSize: '20m',
  maxFiles: '12m' // Keep logs for 12 months
});

const logger = winston.createLogger({
  level: env === 'prod' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    myFormat
  ),
  transports: [transport]
});

// Print to console in dev mode
if (env === 'dev') {
  logger.add(new winston.transports.Console());
}

module.exports = logger;
