const { TEST_EMAIL, TEST_PASS } = require('./constants');

describe('Login Screen', () => {
  it('should display login screen on launch', async () => {
    await expect($('~login-screen')).toBeDisplayed();
  });

  it('should login and go to home screen', async () => {
    await $('~email-input').setValue(TEST_EMAIL);
    await $('~password-input').setValue(TEST_PASS);
    await $('~login-button').click();
    await $('~home-screen').waitForDisplayed({ timeout: 10000 });
    await expect($('~home-screen')).toBeDisplayed();
  });
});
