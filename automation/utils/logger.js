const fs = require('fs');
const path = require('path');
const config = require('../config/config');

// Ensure log dir exists
if (!fs.existsSync(config.paths.logs)) {
  fs.mkdirSync(config.paths.logs, { recursive: true });
}

const logFile = path.join(config.paths.logs, 'test.log');

function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMsg = `[${timestamp}] [${level}] ${message}`;
  
  // Console logging
  if (level === 'ERROR') {
    console.error(logMsg);
  } else if (level === 'WARNING') {
    console.warn(logMsg);
  } else {
    console.log(logMsg);
  }

  // File logging
  fs.appendFileSync(logFile, logMsg + '\n', 'utf8');
}

module.exports = {
  info: (msg) => log(msg, 'INFO'),
  warn: (msg) => log(msg, 'WARNING'),
  error: (msg) => log(msg, 'ERROR'),
  logPath: logFile
};
