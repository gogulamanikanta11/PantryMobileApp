const fs = require('fs');
const path = require('path');
const config = require('../config/config');
const logger = require('./logger');

// Ensure screenshots dir exists
const localScreenshotsDir = config.paths.screenshots;
const resultsScreenshotsDir = path.join(config.paths.testResults, 'Screenshots');

[localScreenshotsDir, resultsScreenshotsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

async function captureScreenshot(driver, fileName) {
  try {
    const screenshotData = await driver.takeScreenshot();
    const cleanFileName = fileName.replace(/[^a-z0-9_-]/gi, '_') + '.png';
    
    const localPath = path.join(localScreenshotsDir, cleanFileName);
    const resultsPath = path.join(resultsScreenshotsDir, cleanFileName);
    
    fs.writeFileSync(localPath, screenshotData, 'base64');
    fs.writeFileSync(resultsPath, screenshotData, 'base64');
    
    logger.info(`Screenshot captured: ${cleanFileName}`);
    return cleanFileName;
  } catch (err) {
    logger.error(`Failed to capture screenshot: ${err.message}`);
    return null;
  }
}

module.exports = {
  captureScreenshot
};
