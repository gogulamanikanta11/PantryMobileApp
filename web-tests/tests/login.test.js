const testEmail = `test-${Math.floor(Math.random() * 1000000)}@example.com`;
const testPassword = 'password123';

describe('Pantry Web - Login Flow', () => {
    it('should show error for empty credentials', async () => {
        await browser.url('http://localhost:8081/login');

        const loginBtn = await $('[data-testid="login-button"]');
        await loginBtn.click();

        const errorMsg = await $('[data-testid="error-message"]');
        await expect(errorMsg).toBeDisplayed();
        await expect(errorMsg).toHaveTextContaining('Enter email and password');
    });

    it('should successfully register a new user', async () => {
        await browser.url('http://localhost:8081/register');

        const emailInput = await $('[data-testid="register-email-input"]');
        const passInput = await $('[data-testid="register-password-input"]');
        const submitBtn = await $('[data-testid="register-submit-button"]');

        await emailInput.setValue(testEmail);
        await passInput.setValue(testPassword);
        await submitBtn.click();

        // Accept the browser success alert
        try {
            await browser.waitUntil(async () => await browser.isAlertOpen(), { timeout: 10000 });
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
        const passInput = await $('[data-testid="password-input"]');
        const loginBtn = await $('[data-testid="login-button"]');

        await emailInput.setValue(testEmail);
        await passInput.setValue(testPassword);
        await loginBtn.click();

        // Wait for redirect to dashboard/tabs
        await browser.waitUntil(
            async () => (await browser.getUrl()).includes('/(tabs)'),
            { timeout: 8000, timeoutMsg: 'Failed to redirect to dashboard' }
        );
    });
});
