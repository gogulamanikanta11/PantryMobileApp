# Local Execution Guide — Selenium E2E Framework

This guide explains how to set up and run the Selenium E2E automated test suite locally on your computer.

## Prerequisites

Ensure you have the following installed on your machine:
1. **Node.js** (v18 or higher)
2. **Google Chrome** browser
3. **ChromeDriver** matching your installed Google Chrome version (Selenium Manager will automatically resolve and download ChromeDriver, but having Chrome installed is required).

## Directory Structure

All automation files are located in the `/automation` directory:
- `config/`: Configuration file containing target URLs and wait times.
- `data/`: Automated test case definition details.
- `pages/`: Page Object classes mapping elements and user actions.
- `tests/`: Main runner script executing test steps.
- `utils/`: Loggers, screenshots, and report compiler utilities.

## Steps for Local Execution

### 1. Install Dependencies
Navigate to the automation directory and install the required npm dependencies:
```bash
cd automation
npm install
```

### 2. Set Up Environment Variables (Optional)
By default, the runner hits the production URL. You can redirect it to local development port or pre-prod environment by setting the `BASE_URL` env variable:
```powershell
# In PowerShell:
$env:BASE_URL="http://localhost:8081"

# In Bash:
export BASE_URL=http://localhost:8081
```

### 3. Run E2E Tests
Execute the runner file using the npm script:
```bash
npm test
```

### 4. Review Results
After execution, results will compile in the `Test Results/` folder in the root directory:
- **HTML Dashboard**: Open `Test Results/HTML/execution-report.html` in any web browser to see detailed summaries.
- **Excel Spreadsheets**: View spreadsheets under `Test Results/Excel/` for auditing.
- **Screenshots**: Check `Test Results/Screenshots/` for any captured error screenshots.
- **Logs**: Read detailed debug details in `automation/logs/test.log`.
