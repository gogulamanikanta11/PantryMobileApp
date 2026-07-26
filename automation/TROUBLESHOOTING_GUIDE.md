# Troubleshooting Guide — Selenium E2E Framework

This guide provides resolutions for common errors encountered during local execution and the CI/CD pipeline.

## 1. ChromeDriver Initialization Failures (Local)
* **Symptom**: `SessionNotCreatedError: session not created: This version of ChromeDriver only supports Chrome version X`.
* **Cause**: Your local Google Chrome browser updated, but your cached WebDriver version is outdated.
* **Resolution**: 
  1. Let Selenium Manager handle downloading the correct driver automatically by making sure you don't override the path in your code.
  2. Alternatively, manually update ChromeDriver:
     ```bash
     npm install chromedriver@latest --prefix automation
     ```

## 2. GitHub Actions Deployment Timeouts
* **Symptom**: The pipeline fails at Stage 7 (Deployment Verification) because the deployed URL returns a `404` or `502`.
* **Cause**: GitHub Pages deployment takes longer than expected to build and publish the pages branch.
* **Resolution**: 
  - The pipeline has an integrated `Wait for Deployment` (Stage 6) sleep step. You can increase the wait delay in `.github/workflows/deploy-and-test.yml` from `30s` to `60s` if your repo bundle size is large.

## 3. Selector Changes causing E2E test failures
* **Symptom**: `NoSuchElementError: no such element: unable to locate element: {"method":"css selector","selector":"..."}`.
* **Cause**: Front-end developers changed class names or test IDs inside components.
* **Resolution**:
  - Update locators inside page files in `automation/pages/` (e.g. `LoginPage.js`, `DashboardPage.js`). Use resilient locators (like search placeholders or custom text contains) instead of deep nested CSS paths.

## 4. Pipeline reports $LASTEXITCODE errors (Windows Local)
* **Symptom**: Local console prints `The variable '$LASTEXITCODE' cannot be retrieved because it has not been set`.
* **Cause**: PowerShell cannot find Node commands exit status wrapper variables.
* **Resolution**:
  - Run scripts explicitly using node instead of the npm package.json script wrapper:
    ```powershell
    node automation/tests/runner.js
    ```
