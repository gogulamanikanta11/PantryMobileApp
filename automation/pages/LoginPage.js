const { By } = require('selenium-webdriver');
const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.emailInput = By.css('input[placeholder*="Email"], [data-testid="email-input"] input, input[type="email"]');
    this.passwordInput = By.css('input[placeholder*="Password"], [data-testid="password-input"] input, input[type="password"]');
    this.loginButton = By.css('[data-testid="login-button"], div[role="button"]');
    this.errorMessage = By.css('[data-testid="error-message"]');
    this.signupLink = By.xpath("//div[contains(text(), 'Don') and contains(text(), 'account')] | //span[contains(text(), 'Sign Up')]");
  }

  async login(email, password) {
    await this.navigate('/login');
    // React Native Web routes can also be root
    const onLogin = await this.isDisplayed(this.emailInput, 5000);
    if (!onLogin) {
      await this.navigate('/'); // fallback to root path
    }
    
    await this.type(this.emailInput, email);
    await this.type(this.passwordInput, password);
    await this.click(this.loginButton);
  }

  async getErrorMessage() {
    return await this.getText(this.errorMessage);
  }
}

module.exports = LoginPage;
