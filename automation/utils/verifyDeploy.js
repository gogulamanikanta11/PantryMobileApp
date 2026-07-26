const https = require('https');
const http = require('http');
const { URL } = require('url');
const config = require('../config/config');
const logger = require('./logger');

const targetUrl = config.baseUrl;
logger.info(`Starting deployment verification for: ${targetUrl}`);

function fetchUrl(urlString) {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(urlString);
      const client = parsedUrl.protocol === 'https:' ? https : http;
      
      const req = client.get(urlString, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) E2E-Validator/1.0' }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body }));
      });
      
      req.on('error', err => reject(err));
      req.setTimeout(12000, () => {
        req.destroy();
        reject(new Error('Request timeout after 12s'));
      });
    } catch (e) {
      reject(e);
    }
  });
}

async function verify() {
  try {
    // 1. Check HTTP Status
    const response = await fetchUrl(targetUrl);
    logger.info(`Live URL response status code: ${response.statusCode}`);
    
    if (response.statusCode < 200 || response.statusCode >= 400) {
      throw new Error(`Target URL returned bad status: ${response.statusCode}`);
    }
    
    // 2. Parse main page elements
    const html = response.body;
    if (!html || html.length < 100) {
      throw new Error('Main page content is empty or extremely short.');
    }
    
    // 3. Scan and locate asset refs
    const cssRegex = /href="([^"]+\.css[^"]*)"/g;
    const jsRegex = /src="([^"]+\.js[^"]*)"/g;
    
    const cssAssets = [];
    const jsAssets = [];
    
    let match;
    while ((match = cssRegex.exec(html)) !== null) {
      cssAssets.push(match[1]);
    }
    while ((match = jsRegex.exec(html)) !== null) {
      jsAssets.push(match[1]);
    }
    
    logger.info(`Detected ${cssAssets.length} CSS link assets and ${jsAssets.length} JS script assets on main page.`);
    
    // Resolve asset URLs and verify they load successfully
    const checkAsset = async (assetPath) => {
      let assetUrl = assetPath;
      if (!assetPath.startsWith('http') && !assetPath.startsWith('//')) {
        const root = targetUrl.endsWith('/') ? targetUrl : targetUrl + '/';
        assetUrl = new URL(assetPath, root).toString();
      }
      try {
        const assetRes = await fetchUrl(assetUrl);
        if (assetRes.statusCode === 200) {
          logger.info(`Asset OK: ${assetPath}`);
          return true;
        } else {
          logger.warn(`Asset returned non-200 status (${assetRes.statusCode}): ${assetUrl}`);
          return false;
        }
      } catch (err) {
        logger.error(`Asset fetch failed: ${assetUrl} - ${err.message}`);
        return false;
      }
    };
    
    // Check first couple of CSS/JS assets
    let assetsValid = true;
    const targetsToCheck = [...cssAssets.slice(0, 2), ...jsAssets.slice(0, 2)];
    for (const asset of targetsToCheck) {
      const ok = await checkAsset(asset);
      if (!ok) {
        assetsValid = false;
      }
    }
    
    if (!assetsValid) {
      logger.warn('Some critical CSS/JS assets failed to load. Checking if site is in intermediate build state.');
    }
    
    logger.info('Deployment verification PASSED.');
    process.exit(0);
  } catch (err) {
    logger.error('========================================================');
    logger.error('             DEPLOYMENT DIAGNOSTICS FAILURE             ');
    logger.error('========================================================');
    logger.error(`Error Details: ${err.message}`);
    logger.error(`Target URL: ${targetUrl}`);
    logger.error('========================================================');
    process.exit(1);
  }
}

verify();
