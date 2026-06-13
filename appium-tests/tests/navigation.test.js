const { TEST_EMAIL, TEST_PASS } = require('./constants');

describe('Navigation', () => {

  before(async () => {
    // Login first to reach the home screen
    await $('~email-input').setValue(TEST_EMAIL);
    await $('~password-input').setValue(TEST_PASS);
    await $('~login-button').click();
    await $('~home-screen').waitForDisplayed({ timeout: 10000 });
  });

  it('should navigate to profile screen', async () => {
    await $('~nav-profile').click();
    await expect($('~profile-screen')).toBeDisplayed();
  });

  it('should navigate back to home', async () => {
    await $('~nav-home').click();
    await expect($('~home-screen')).toBeDisplayed();
  });

  it('should logout and return to login screen', async () => {
    await $('~logout-button').click();
    await expect($('~login-screen')).toBeDisplayed();
  });

});
