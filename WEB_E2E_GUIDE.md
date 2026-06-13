# Web E2E Automation Guide (Selenium)

This guide explains how to run Selenium tests for the web version of your Pantry App.

## 1. Setup
1. Ensure your Expo web server is running:
   ```bash
   npx expo start --web
   ```
   (Verify it is accessible at `http://localhost:8081`)

2. Install dependencies in the `web-tests` folder:
   ```bash
   cd web-tests
   npm install
   ```

## 2. Run Tests
Execute the following command to start the Selenium tests:
```bash
npx wdio run wdio.conf.js
```

## 3. Configuration
The configuration is located in `web-tests/wdio.conf.js`. You can change the `baseUrl` if your local server runs on a different port.
