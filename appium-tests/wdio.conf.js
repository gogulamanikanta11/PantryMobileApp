const path = require('path');

exports.config = {
  runner: 'local',
  port: 4723,

  specs: ['./tests/**/*.test.js'],

  capabilities: [{
    platformName: 'Android',
    'appium:deviceName': 'emulator-5554',         // Match your adb devices output
    'appium:platformVersion': '13',               // Update to match your emulator version
    'appium:app': path.resolve(__dirname, '../android/app/build/outputs/apk/debug/app-debug.apk'),
    'appium:automationName': 'UiAutomator2',
    'appium:appPackage': 'com.gmanikanta.pantrymobileapp', // Updated to match your app.json
    'appium:appActivity': '.MainActivity',
    'appium:noReset': false,
    'appium:newCommandTimeout': 60,
  }],

  services: ['appium'],
  framework: 'mocha',
  reporters: ['spec'],

  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },
};
