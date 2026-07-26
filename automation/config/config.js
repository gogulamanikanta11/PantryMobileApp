const path = require('path');

const BASE_URL = process.env.BASE_URL || 'https://gogulamanikanta11.github.io/PantryMobileApp/';

module.exports = {
  baseUrl: BASE_URL,
  headless: true,
  timeout: 15000,
  paths: {
    screenshots: path.join(__dirname, '../screenshots'),
    logs: path.join(__dirname, '../logs'),
    reports: path.join(__dirname, '../reports'),
    testResults: path.join(__dirname, '../../Test Results')
  }
};
