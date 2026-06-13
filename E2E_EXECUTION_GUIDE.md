# E2E Automation Execution Guide

Follow these steps to run the Selenium/Appium tests for your Pantry App.

## 1. Prepare the APK
Before running tests, you must have the APK file ready:
1. Generate your APK (via Android Studio or `npx expo run:android`).
2. Create the folder: `appium-tests/app/`
3. Rename your APK to `app.apk` and place it in that folder.

## 2. Setup Environment
Open **three** separate terminals:

### Terminal 1: Start Appium Server
```bash
npm install -g appium
appium driver install uiautomator2
appium
```

### Terminal 2: Start Emulator
Make sure your emulator is running and detected:
```bash
adb devices
# Should show emulator-5554
```

### Terminal 3: Run Tests
```bash
cd appium-tests
npm install
npm test
```

## 3. How to write more tests
Use the `testID` attribute in your React Native code. I have already added these for you:
- `login-screen`
- `email-input`
- `password-input`
- `login-button`
- `dashboard-screen`

In your test file (`tests/login.test.js`), locate them using the tilde (`~`) symbol:
```javascript
const email = await $('~email-input');
await email.setValue('test@email.com');
```
