const testEmail = `test-${Math.floor(Math.random() * 1000000)}@example.com`;
const testPassword = 'password123';

describe('Pantry Web - Login Flow', () => {
    afterEach(async function() {
        if (this.currentTest.state === 'failed') {
            const fs = require('fs');
            const path = require('path');
            const docsDir = path.join(__dirname, '../../docs');
            if (!fs.existsSync(docsDir)) {
                fs.mkdirSync(docsDir, { recursive: true });
            }
            const screenshotPath = path.join(docsDir, 'error_screenshot.png');
            await browser.saveScreenshot(screenshotPath);
            console.log(`Saved failure screenshot to: ${screenshotPath}`);
        }
    });

    it('should show error for empty credentials', async () => {
        await browser.url('http://localhost:8081/login');

        const loginBtn = await $('[data-testid="login-button"]');
        await loginBtn.waitForExist({ timeout: 5000 });
        await loginBtn.waitForDisplayed({ timeout: 5000 });
        await loginBtn.click();

        const errorMsg = await $('[data-testid="error-message"]');
        await errorMsg.waitForExist({ timeout: 5000 });
        await errorMsg.waitForDisplayed({ timeout: 5000 });
        await expect(errorMsg).toBeDisplayed();
        await expect(errorMsg).toHaveTextContaining('Enter email and password');
    });

    it('should successfully register a new user', async () => {
        await browser.url('http://localhost:8081/register');

        const emailInput = await $('[data-testid="register-email-input"]');
        await emailInput.waitForExist({ timeout: 5000 });
        await emailInput.waitForDisplayed({ timeout: 5000 });

        const passInput = await $('[data-testid="register-password-input"]');
        await passInput.waitForExist({ timeout: 5000 });
        await passInput.waitForDisplayed({ timeout: 5000 });

        const submitBtn = await $('[data-testid="register-button"]');
        await submitBtn.waitForExist({ timeout: 5000 });
        await submitBtn.waitForDisplayed({ timeout: 5000 });

        await emailInput.setValue(testEmail);
        await passInput.setValue(testPassword);
        await submitBtn.click();

        // Wait to see if an error message appears
        await browser.pause(4000);
        const errorMsg = await $('[data-testid="error-message"]');
        if (await errorMsg.isExisting() && await errorMsg.isDisplayed()) {
            const errorText = await errorMsg.getText();
            throw new Error(`Registration failed with screen error: ${errorText}`);
        }

        // Accept the browser success alert if it opened
        try {
            await browser.waitUntil(async () => await browser.isAlertOpen(), { timeout: 3000 });
            await browser.acceptAlert();
        } catch (e) {
            console.log('No alert appeared or failed to accept alert:', e);
        }

        // Wait to be redirected to login page
        await browser.waitUntil(
            async () => (await browser.getUrl()).includes('/login'),
            { timeout: 8000, timeoutMsg: 'Failed to redirect to login after register' }
        );
    });

    it('should successfully login and reach dashboard', async () => {
        await browser.url('http://localhost:8081/login');

        const emailInput = await $('[data-testid="email-input"]');
        await emailInput.waitForExist({ timeout: 5000 });
        await emailInput.waitForDisplayed({ timeout: 5000 });

        const passInput = await $('[data-testid="password-input"]');
        await passInput.waitForExist({ timeout: 5000 });
        await passInput.waitForDisplayed({ timeout: 5000 });

        const loginBtn = await $('[data-testid="login-button"]');
        await loginBtn.waitForExist({ timeout: 5000 });
        await loginBtn.waitForDisplayed({ timeout: 5000 });

        await emailInput.setValue(testEmail);
        await passInput.setValue(testPassword);
        await loginBtn.click();

        // Wait to see if a login error message appears
        await browser.pause(4000);
        const loginErrorMsg = await $('[data-testid="error-message"]');
        if (await loginErrorMsg.isExisting() && await loginErrorMsg.isDisplayed()) {
            const errorText = await loginErrorMsg.getText();
            throw new Error(`Login failed with screen error: ${errorText}`);
        }

        // Wait for redirect to dashboard/tabs
        const homeScreen = await $('[data-testid="home-screen"]');
        await homeScreen.waitForExist({ timeout: 10000 });
        await homeScreen.waitForDisplayed({ timeout: 10000 });
    });
});
