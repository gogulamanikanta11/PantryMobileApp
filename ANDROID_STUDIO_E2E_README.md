# Android Studio — E2E Testing with Appium + WebdriverIO
### Complete Setup Guide for React Native Android Apps

---

## Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Android Studio | Latest | https://developer.android.com/studio |
| Node.js | v18+ | https://nodejs.org |
| Java JDK | 11+ | https://adoptium.net |
| Git | Any | https://git-scm.com |

---

## PART 1 — Android Studio Installation & Setup

### Step 1 — Install Android Studio

1. Download from https://developer.android.com/studio
2. Run installer → keep all **default selections**
3. On first launch, the Setup Wizard opens:
   - Select **Standard** installation
   - It auto-installs: Android SDK, Emulator, Platform Tools, Build Tools

---

### Step 2 — Set ANDROID_HOME Environment Variable

**macOS / Linux** — add to `~/.zshrc` or `~/.bashrc`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk        # macOS
# export ANDROID_HOME=$HOME/Android/Sdk              # Linux

export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

Reload terminal:
```bash
source ~/.zshrc
```

**Windows:**
1. Search **Environment Variables** in Start Menu
2. Under System Variables → **New**:
   - Name: `ANDROID_HOME`
   - Value: `C:\Users\YOUR_NAME\AppData\Local\Android\Sdk`
3. Edit **Path** → Add:
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\emulator`

**Verify setup:**
```bash
adb --version
emulator -list-avds
```

---

### Step 3 — Create an Android Virtual Device (Emulator)

1. Open **Android Studio**
2. Click **More Actions** → **Virtual Device Manager**
   *(or: Tools → Device Manager)*
3. Click **Create Device** (+ button)
4. Select hardware: **Pixel 6** → Next
5. Select system image: **API 33 — Android 13** (click Download if needed) → Next
6. Give it a name (e.g. `Test_Device_API33`) → **Finish**
7. Click the **▶️ Play button** to start the emulator

Wait for the home screen to appear fully before running any tests.

**Or start emulator via terminal:**
```bash
emulator -list-avds                  # see all AVDs
emulator -avd Test_Device_API33      # start your AVD
```

---

### Step 4 — Verify Emulator is Running

```bash
adb devices
```

Expected:
```
List of devices attached
emulator-5554   device
```

---

## PART 2 — Open Your React Native Project in Android Studio

### Step 5A — Expo Managed Workflow

```bash
cd your-project-folder
npm install
npx expo start
```

In the Expo terminal press **`a`** → opens on Android emulator automatically.

### Step 5B — Bare React Native

1. Android Studio → **File → Open**
2. Navigate to your project's `android/` folder → click **OK**
3. Wait for **Gradle sync** to complete (progress bar at bottom)
4. Click the **▶️ Run button** (top toolbar)
5. Select your running emulator → OK

---

## PART 3 — Build the APK for Testing

### Option A — Android Studio (Bare React Native)
1. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Click **locate** in the notification that appears
3. APK path: `android/app/build/outputs/apk/debug/app-debug.apk`

### Option B — Gradle (Terminal)
```bash
cd android
./gradlew assembleDebug
# APK at: android/app/build/outputs/apk/debug/app-debug.apk
```

### Option C — EAS Build (Expo)
```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview --local
```

Copy the APK to your test folder:
```bash
cp path/to/your-app.apk appium-tests/app/app.apk
```

---

## PART 4 — Add testID to Your Components

Appium locates elements using `testID`. Add it to every interactive element in your app **before** building the APK.

```jsx
// Login Screen
<View testID="login-screen">
  <TextInput testID="email-input" ... />
  <TextInput testID="password-input" secureTextEntry ... />
  <TouchableOpacity testID="login-button">
    <Text>Login</Text>
  </TouchableOpacity>
  <Text testID="error-message">{error}</Text>
</View>

// Home / Dashboard Screen
<View testID="home-screen">
  <FlatList testID="items-list" ... />
  <TouchableOpacity testID="add-button">
    <Text>+ Add</Text>
  </TouchableOpacity>
</View>

// Profile Screen
<View testID="profile-screen">
  <TouchableOpacity testID="logout-button">
    <Text>Logout</Text>
  </TouchableOpacity>
</View>
```

> Rebuild the APK every time you add or change `testID` values.

---

## PART 5 — Appium E2E Test Setup

### Step 6 — Install Appium

```bash
npm install -g appium
appium driver install uiautomator2
appium --version    # confirm install
```

### Step 7 — Create Test Folder Structure

```
your-project/
├── android/                    ← Android Studio opens this
├── src/                        ← React Native source code
├── appium-tests/               ← All E2E tests here
│   ├── app/
│   │   └── app.apk             ← Your built APK
│   ├── tests/
│   │   ├── login.test.js
│   │   ├── home.test.js
│   │   └── navigation.test.js
│   ├── wdio.conf.js
│   └── package.json
└── package.json
```

```bash
mkdir -p appium-tests/app appium-tests/tests
cd appium-tests
npm init -y
npm install @wdio/cli @wdio/mocha-framework @wdio/spec-reporter webdriverio --save-dev
```

### Step 8 — Configure wdio.conf.js

Create `appium-tests/wdio.conf.js`:

```javascript
exports.config = {
  runner: 'local',
  port: 4723,

  specs: ['./tests/**/*.test.js'],

  capabilities: [{
    platformName: 'Android',
    'appium:deviceName': 'emulator-5554',         // from: adb devices
    'appium:platformVersion': '13',               // Android version of your AVD
    'appium:app': `${__dirname}/app/app.apk`,     // path to your APK
    'appium:automationName': 'UiAutomator2',
    'appium:appPackage': 'com.yourcompany.yourapp', // update this
    'appium:appActivity': '.MainActivity',
    'appium:noReset': false,
    'appium:newCommandTimeout': 60,
  }],

  services: ['appium'],
  framework: 'mocha',
  reporters: ['spec'],

  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },
};
```

**Find your app package name:**
```bash
adb shell pm list packages | grep yourapp
# or
aapt dump badging appium-tests/app/app.apk | grep package
```

### Step 9 — Add npm Scripts

Edit `appium-tests/package.json`:

```json
{
  "name": "appium-e2e-tests",
  "version": "1.0.0",
  "scripts": {
    "test": "wdio run wdio.conf.js",
    "test:login": "wdio run wdio.conf.js --spec tests/login.test.js",
    "test:home": "wdio run wdio.conf.js --spec tests/home.test.js",
    "test:nav": "wdio run wdio.conf.js --spec tests/navigation.test.js",
    "appium": "appium --port 4723"
  }
}
```

---

## PART 6 — Write the Tests

### Login Test

Create `appium-tests/tests/login.test.js`:

```javascript
describe('Login Screen', () => {

  it('should display login screen on launch', async () => {
    await expect($('~login-screen')).toBeDisplayed();
  });

  it('should show error for empty fields', async () => {
    await $('~login-button').click();
    await expect($('~error-message')).toBeDisplayed();
  });

  it('should show error for wrong credentials', async () => {
    await $('~email-input').setValue('wrong@email.com');
    await $('~password-input').setValue('wrongpass');
    await $('~login-button').click();
    await expect($('~error-message')).toBeDisplayed();
  });

  it('should login and go to home screen', async () => {
    await $('~email-input').clearValue();
    await $('~password-input').clearValue();
    await $('~email-input').setValue('user@example.com');
    await $('~password-input').setValue('Password123');
    await $('~login-button').click();
    await $('~home-screen').waitForDisplayed({ timeout: 10000 });
    await expect($('~home-screen')).toBeDisplayed();
  });

});
```

### Home Screen Test

Create `appium-tests/tests/home.test.js`:

```javascript
describe('Home Screen', () => {

  before(async () => {
    // Login first
    await $('~email-input').setValue('user@example.com');
    await $('~password-input').setValue('Password123');
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
```

### Navigation Test

Create `appium-tests/tests/navigation.test.js`:

```javascript
describe('Navigation', () => {

  before(async () => {
    await $('~email-input').setValue('user@example.com');
    await $('~password-input').setValue('Password123');
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
```

---

## PART 7 — Run the Tests

Open **3 separate terminals**:

**Terminal 1 — Start Emulator:**
```bash
emulator -avd Test_Device_API33
# Wait for home screen to appear
```

**Terminal 2 — Start Appium Server:**
```bash
appium --port 4723
# Should print: Appium REST http interface listener started on 0.0.0.0:4723
```

**Terminal 3 — Run Tests:**
```bash
cd appium-tests

npm test              # run all tests
npm run test:login    # login tests only
npm run test:home     # home screen tests only
npm run test:nav      # navigation tests only
```

**Expected output:**
```
Login Screen
  ✓ should display login screen on launch (2100ms)
  ✓ should show error for empty fields (1800ms)
  ✓ should show error for wrong credentials (2400ms)
  ✓ should login and go to home screen (5200ms)

Home Screen
  ✓ should display the items list (1200ms)
  ✓ should open add screen when add button tapped (1500ms)

Navigation
  ✓ should navigate to profile screen (1800ms)
  ✓ should navigate back to home (1400ms)
  ✓ should logout and return to login screen (2100ms)

9 passing (19s)
```

---

## PART 8 — GitHub Actions CI/CD (Optional)

Create `.github/workflows/android-e2e.yml`:

```yaml
name: Android E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  android-e2e:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - uses: actions/setup-java@v3
        with:
          java-version: '11'
          distribution: 'temurin'
      - name: Install Appium
        run: |
          npm install -g appium
          appium driver install uiautomator2
      - name: Install test dependencies
        run: cd appium-tests && npm install
      - name: Run tests on emulator
        uses: reactivecircus/android-emulator-runner@v2
        with:
          api-level: 33
          arch: x86_64
          script: |
            npx appium &
            sleep 5
            cd appium-tests && npm test
```

---

## Quick Reference — All Commands

```bash
# ── Android Studio / Emulator ──────────────────────────
emulator -list-avds                          # list your AVDs
emulator -avd Test_Device_API33              # start emulator
adb devices                                  # verify device connected
adb install appium-tests/app/app.apk         # manually install APK

# ── Build APK ──────────────────────────────────────────
cd android && ./gradlew assembleDebug        # bare React Native
eas build --platform android --local         # Expo

# ── Appium ─────────────────────────────────────────────
appium --port 4723                           # start Appium server
appium driver list                           # check installed drivers
appium driver install uiautomator2           # install Android driver

# ── Run Tests ──────────────────────────────────────────
cd appium-tests
npm test                                     # all tests
npm run test:login                           # login only
npm run test:home                            # home only
npm run test:nav                             # navigation only

# ── Find Package Name ──────────────────────────────────
adb shell pm list packages | grep yourapp
aapt dump badging app.apk | grep package
```

---

## Android Studio — Key Features for Testing

| Feature | Where to Find | Purpose |
|---------|--------------|---------|
| **Device Manager** | Tools → Device Manager | Create & start emulators |
| **SDK Manager** | Tools → SDK Manager | Install Android API versions |
| **Logcat** | View → Tool Windows → Logcat | Real-time app logs during tests |
| **Build APK** | Build → Build APK(s) | Generate APK for Appium |
| **Run button ▶️** | Top toolbar | Launch app on emulator |
| **Device File Explorer** | View → Tool Windows → Device File Explorer | Browse emulator files |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `adb: command not found` | Add `platform-tools` to PATH, reload terminal |
| `Emulator not found` | Run `emulator -list-avds`, match name in `wdio.conf.js` |
| `Connection refused 4723` | Start Appium first: `appium --port 4723` |
| `UiAutomator2 not found` | Run: `appium driver install uiautomator2` |
| `APK not found` | Check path in `wdio.conf.js` matches your actual APK location |
| `Element not found (~login-screen)` | Add `testID="login-screen"` to your React Native component |
| `Gradle sync failed` | Android Studio → File → Sync Project with Gradle Files |
| `Emulator is very slow` | SDK Manager → SDK Tools → Install Intel HAXM (hardware acceleration) |
| `noReset keeps reinstalling` | Set `'appium:noReset': true` to keep app installed between runs |

---

*Android Studio — React Native E2E Testing Guide*
