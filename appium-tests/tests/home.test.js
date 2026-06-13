const { TEST_EMAIL, TEST_PASS } = require('./constants');

describe('Home Screen', () => {

  before(async () => {
    // Ensure we are logged in with the new email
    await $('~email-input').setValue(TEST_EMAIL);
    await $('~password-input').setValue(TEST_PASS);
    await $('~login-button').click();
    await $('~home-screen').waitForDisplayed({ timeout: 10000 });
  });

  it('should display the items list', async () => {
    await expect($('~items-list')).toBeDisplayed();
  });

  it('should open add screen when add button tapped', async () => {
    await $('~add-button').click();
    await expect($('~add-screen')).toBeDisplayed();
  });

});
