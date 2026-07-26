const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class DashboardPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.addPantryItemButton = By.css('[data-testid="add-item-btn"], [placeholder*="Add Item"]');
    this.qaDashboardButton = By.xpath("//div[contains(text(), 'QA') and contains(text(), 'Dashboard')] | //div[contains(text(), 'Console')]");
    this.navPantry = By.css('[data-testid="nav-pantry"]');
    this.navRecipes = By.css('[data-testid="nav-recipes"]');
    this.navShoppingList = By.css('[data-testid="nav-shopping-list"]');
    this.navProfile = By.css('[data-testid="nav-profile"]');
    this.dashboardTitle = By.xpath("//div[contains(text(), 'Smart Pantry') or contains(text(), 'Dashboard')]");
  }

  async goToQADashboard() {
    await this.navigate('/qa-dashboard');
  }

  async verifyOnDashboard() {
    return await this.isDisplayed(this.dashboardTitle);
  }
}

module.exports = DashboardPage;
