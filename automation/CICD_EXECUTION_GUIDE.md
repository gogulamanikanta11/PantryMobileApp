# CI/CD Execution Guide — Selenium E2E Framework

This guide documents how the GitHub Actions pipeline is structured and how to configure the repository to host results on GitHub Pages.

## Pipeline Architecture

The workflow file `.github/workflows/deploy-and-test.yml` automatically triggers on:
- Every code `push` to `main`, `master`, and `dev` branches.
- Every `pull_request` target branches.
- Manual execution via `workflow_dispatch`.

### 13 Pipeline Stages
1. **Repository Checkout**: Clones the repo onto the Ubuntu agent.
2. **Dependency Installation**: Restores root and automation dependencies.
3. **Build Application**: Compiles React Native Web code into a static bundle.
4. **Static Analysis**: Evaluates linting code guidelines.
5. **Deploy to GitHub Pages**: Publishes build assets to the `gh-pages` branch.
6. **Wait for Deployment**: Pauses for 30s to allow GitHub Pages deployment to propagate.
7. **Deployment Verification**: Asserts that the deployed URL returns a HTTP 200 and loads.
8. **Run Selenium E2E Tests**: Launches headless Chrome to run 440 tests against the deployed URL.
9. **Generate HTML Reports**: Compiles interactive web reports.
10. **Generate Excel Reports**: Compiles spreadsheet sheets.
11. **Upload Artifacts**: Uploads spreadsheets, HTML, logs, and screenshots as artifacts.
12. **Publish Summary**: Outputs execution dashboard metrics to the workflow run summary.
13. **Store Historical Results**: Archives test results into history build subfolders to maintain records.

## GitHub Repository Setup

To ensure successful CI/CD executions, configure your GitHub Repository:

### 1. Workflow Permissions
Allows the workflow to commit compiled reports to the `gh-pages` branch:
1. Go to **Settings -> Actions -> General**.
2. Under **Workflow permissions**, select **Read and write permissions**.
3. Click **Save**.

### 2. Configure GitHub Pages
Configures where the built app and HTML reports are served:
1. Go to **Settings -> Pages**.
2. Under **Build and deployment -> Source**, select **Deploy from a branch**.
3. Under **Branch**, select `gh-pages` and select `/ (root)`.
4. Click **Save**.
