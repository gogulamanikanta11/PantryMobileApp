const { By, until } = require('selenium-webdriver');
const config = require('../config/config');

class BasePage {
  constructor(driver) {
    this.driver = driver;
    this.baseUrl = config.baseUrl;
  }

  async navigate(path = '') {
    const url = this.baseUrl.endsWith('/') && path.startsWith('/')
      ? this.baseUrl + path.substring(1)
      : this.baseUrl + path;
    await this.driver.get(url);
    await this.driver.manage().window().maximize();
  }

  async findElement(locator, timeout = config.timeout) {
    await this.driver.wait(until.elementLocated(locator), timeout);
    const element = await this.driver.findElement(locator);
    await this.driver.wait(until.elementIsVisible(element), timeout);
    return element;
  }

  async click(locator, timeout = config.timeout) {
    const element = await this.findElement(locator, timeout);
    await this.driver.wait(until.elementIsEnabled(element), timeout);
    await element.click();
  }

  async type(locator, text, timeout = config.timeout) {
    const element = await this.findElement(locator, timeout);
    await this.driver.wait(until.elementIsEnabled(element), timeout);
    await element.clear();
    await element.sendKeys(text);
  }

  async getText(locator, timeout = config.timeout) {
    const element = await this.findElement(locator, timeout);
    return await element.getText();
  }

  async isDisplayed(locator, timeout = config.timeout) {
    try {
      const element = await this.findElement(locator, timeout);
      return await element.isDisplayed();
    } catch (err) {
      return false;
    }
  }

  async getBrowserLogs() {
    try {
      const logs = await this.driver.manage().logs().get('browser');
      return logs.map(log => `[${log.level.name}] ${log.message}`).join('\n');
    } catch (err) {
      return `Failed to fetch browser logs: ${err.message}`;
    }
  }
}

module.exports = BasePage;
