### Test framework:

Test framework is built using Mocha, javascript and axios

### Pre-requisites:

-   Make sure you have received your API key from what3words. This is an 8 character alphanumeric key.
-   Node.js, npm and git installed on your machine

### Reference:

-   https://developer.what3words.com/public-api/docs

### Getting started

1.   Install node.js, npm and git in your machine.
2.   Clone this repository to desired location.
3.   Run `npm install` at the root folder of this repository.
4.   **Setup API Key:**
     - Copy `.env.example` to `.env` in the root directory
     - Open `.env` and replace `your-api-key-here` with your actual what3words API key
     - Example: `API_KEY=abc12345`

### Running tests

**Run tests without HTML report:**
```bash
npm test
```

**Run tests with HTML report:**
```bash
npm run test:report
```

The HTML report will be generated in the `report/` directory:
- `report/test-report.html` - Interactive HTML report
- `report/test-report.json` - JSON data for report

**Note:** Make sure you have created `.env` file with your API key before running tests, otherwise tests will fail with a clear error message.

### CI/CD

This project includes GitHub Actions CI workflow that automatically runs tests on:
- Push to `main`, `master`, or `develop` branches
- Pull requests to `main`, `master`, or `develop` branches

**Setup CI/CD:**
1. Go to repository Settings → Secrets and variables → Actions
2. Add a new secret named `API_KEY` with your What3Words API key
3. CI will automatically run tests on each commit/PR

### Test Coverage

The test suite covers:
- ✅ Accepted delimiters (9 different delimiters)
- ✅ Invalid delimiters
- ✅ Mixed delimiters
- ✅ Input validation (empty input)
- ✅ Language parameter (valid, invalid, missing)
- ✅ Convert to three word address
