# Back Office Automation (Pickup Coffee)

JavaScript [Playwright](https://playwright.dev/) automation for the Pickup Coffee Back Office staging site: https://staging.bo.pickup-coffee.net/

## Setup

```bash
npm install
npx playwright install
```

## Run tests

```bash
# Headless (default)
npm test

# With browser UI
npm run test:headed

# Interactive UI mode
npm run test:ui

# Debug
npm run test:debug
```

## Authenticated tests

To run tests that perform login (e.g. dashboard and roles), set:

- `BO_MOBILE` or `TEST_MOBILE` – mobile number (e.g. with country code if required)
- `BO_PASSWORD` or `TEST_PASSWORD` – password

Example:

```bash
BO_MOBILE=9123456789 BO_PASSWORD=yourpassword npm test
```

Or create a `.env` file (do not commit it) and use a loader like `dotenv` if you add it.

## Base URL

Override the base URL:

```bash
BASE_URL=https://staging.bo.pickup-coffee.net npm test
```

## Structure

- `playwright.config.js` – Playwright config (base URL, projects, reporters)
- `tests/fixtures/base.js` – Custom fixtures (page objects, authenticated page)
- `tests/pages/LoginPage.js` – Login page object
- `tests/pages/DashboardPage.js` – Dashboard page object
- `tests/login.spec.js` – Login page and login flow tests
- `tests/dashboard.spec.js` – Dashboard tests (require credentials)

## Adding tests

1. Add or reuse page objects under `tests/pages/`.
2. In specs, use the extended `test` and `expect` from `tests/fixtures/base.js` to get `loginPage`, `dashboardPage`, and optional `authenticatedPage`.
