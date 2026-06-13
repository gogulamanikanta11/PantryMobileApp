describe('Pantry Web - Login Flow', () => {
    it('should show error for empty credentials', async () => {
        await browser.url('http://localhost:8081/login');

        const loginBtn = await $('[data-testid="login-button"]');
        await loginBtn.click();

        const errorMsg = await $('[data-testid="error-message"]');
        await expect(errorMsg).toBeDisplayed();
        await expect(errorMsg).toHaveTextContaining('Enter email and password');
    });

    it('should successfully login and reach dashboard', async () => {
        const emailInput = await $('[data-testid="email-input"]');
        const passInput = await $('[data-testid="password-input"]');
        const loginBtn = await $('[data-testid="login-button"]');

        await emailInput.setValue('test@example.com');
        await passInput.setValue('password123');
        await loginBtn.click();

        // Wait for redirect to dashboard/tabs
        await browser.waitUntil(
            async () => (await browser.getUrl()).includes('/(tabs)'),
            { timeout: 5000, timeoutMsg: 'Failed to redirect to dashboard' }
        );
    });
});
