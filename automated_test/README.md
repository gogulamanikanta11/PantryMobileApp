# API Regression and Integration Testing Framework

A python-based regression testing tool designed to validate endpoint catalog schemas, response latencies, and HTTP status codes for the Pantry application.

## Directory Structure

```text
automated_test/
├── endpoint_catalog.py       # Discovers and structures available paths
├── request_tests.py          # Validates HTTP header and request constraints
├── response_schema_tests.py  # Asserts data layout and schema compliance
├── status_code_tests.py      # Verifies correct HTTP code outputs
├── latency_measurements.py   # Logs and measures API latency constraints
├── api_runner.py             # Main entry point to configure integration tests
├── input.json                # Server config targets (URL, Auth details)
└── report.json               # Target database file recording run reports
```

## Setup Instructions

1. Ensure Python 3.8+ is installed on your local environment.
2. Install the target dependencies:
   ```bash
   pip install pytest requests
   ```
3. Update `automated_test/input.json` with the base URL of your target server and valid test user credentials:
   ```json
   {
     "baseUrl": "http://localhost:8081",
     "username": "gogulamanikanta8@gmail.com",
     "password": "123456"
   }
   ```

## Running the Integration Tests

To run the full regression test suite manually using `pytest`:

```bash
pytest automated_test/
```

To run individual test files (for example, validating response schemas only):

```bash
pytest automated_test/response_schema_tests.py
```

To run the custom orchestration runner to output formatting reports into `report.json`:

```bash
python automated_test/api_runner.py
```
