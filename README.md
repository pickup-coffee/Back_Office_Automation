# Back Office Automation (Pickup Coffee)

Industry-standard **UI test automation** for the Pickup Coffee Back Office staging site, built with [Playwright](https://playwright.dev/) (JavaScript) and the **Page Object Model (POM)**. Tests and page objects are separated; config, setup, and teardown are centralized.

**Target application:** https://staging.bo.pickup-coffee.net/

---

## Table of contents

- [Setup](#setup)
- [Running tests](#running-tests)
- [Orders tests](#orders-tests)
- [Page Object Model (POM)](#page-object-model-pom)
- [Project structure](#project-structure)
- [Setup and teardown](#setup-and-teardown)
- [Screenshot on failure](#screenshot-on-failure)
- [Configuration](#configuration)
- [Authenticated tests](#authenticated-tests)
- [Adding new tests and page objects](#adding-new-tests-and-page-objects)
- [Practices followed](#practices-followed)

---

## Setup

```bash
npm install
npx playwright install
```

Install all browsers (Chromium, Firefox, WebKit) or a single one:

```bash
npx playwright install chromium
```

---

## Running tests

| Command | Description |
|--------|-------------|
| `npm test` | Run all tests headless (1 worker, sequential) |
| `npm run test:headed` | Run full suite with browser visible (1 worker) |
| `npm run test:headed:orders` | Run **Orders** + auth setup only (no login spec). For **login → setup → orders**, set `REQUIRE_LOGIN_BEFORE_SETUP=1` |
| `npm run test:ui` | Open Playwright Test UI |
| `npm run test:debug` | Run in debug mode |
| `npm run report` | Open last HTML report |

Override base URL:

```bash
BASE_URL=https://staging.bo.pickup-coffee.net npm test
```

Stricter CI (run **login** project before **setup** so the login spec runs first):

```bash
REQUIRE_LOGIN_BEFORE_SETUP=1 npm test
```

---


```bash
TEST_THROTTLE_MS=800 ORDERS_API_429_DELAY_MS=12000 npm run test:headed:orders
```

---

## Page Object Model (POM)

This framework uses the **Page Object Model** with a clear separation:

- **`pages/`** – Page objects (locators and actions); tests never import these directly.
- **`tests/`** – Specs (`login/`, `dashboard/`, `orders/`); shared `fixtures/` for POM hooks (`base.js` / `base-core.js`).

### Concepts

1. **Base Page (`pages/BasePage.js`)**  
   All page objects extend `BasePage`. It holds the Playwright `page` instance and common helpers (`goto(path)`, `waitForLoadState()`).

2. **Page Objects (`pages/LoginPage.js`, `pages/DashboardPage.js`, `pages/OrdersPage.js`)**  
   Each class represents one screen:
   - **Locators** as getters (e.g. `mobileInput`, `loginButton`).
   - **Actions** as async methods (e.g. `login(mobile, password)`, `goToRoles()`).
   - **Assertions** as helper methods (e.g. `expectOnLoginPage()`, `expectLoggedIn()`).

3. **Fixtures (`tests/fixtures/base-core.js` / `base.js`)**  
   For each test, fixtures build **one** page object per screen: `new LoginPage(page)`, `new DashboardPage(page)`, `new OrdersPage(page)`. Tests request `loginPage`, `dashboardPage`, `ordersPage`, or `authenticatedPage` (logs in then yields `page`)—they do **not** import POM classes in spec files.

### Flow

```
Test (tests/<feature>/*.spec.js)
  → uses fixture (loginPage, dashboardPage, ordersPage, …)
    → fixture: new LoginPage(page), etc. (tests/fixtures/base-core.js)
      → each page class lives in pages/, extends BasePage (config/constants.js)
```

### Example

```javascript
const { test, expect } = require('../fixtures/base');

test('login page loads', async ({ loginPage }) => {
  await loginPage.goto();
  await loginPage.expectOnLoginPage();
});

test('navigate to roles after login', async ({ loginPage, dashboardPage }) => {
  await loginPage.goto();
  await loginPage.login(mobile, password);
  await dashboardPage.expectLoggedIn();
  await dashboardPage.goToRoles();
  await dashboardPage.expectOnRolesPage();
});

test('orders list', async ({ ordersPage }) => {
  await ordersPage.goto();
  await ordersPage.expectOnOrdersPage();
});
```

---

## Project structure

```
BackOffice_Automation/
├── config/
│   └── constants.js          # BASE_URL, PATHS, ENV_KEYS, TIMEOUTS
├── pages/                    # Page Object Model (separate from tests)
│   ├── BasePage.js           # Base class for all page objects
│   ├── LoginPage.js          # Login screen POM
│   ├── DashboardPage.js      # Dashboard (post-login) POM
│   └── OrdersPage.js         # Orders list POM
├── setup/
│   ├── globalSetup.js        # Runs once before all tests
│   └── globalTeardown.js     # Runs once after all tests
├── tests/
│   ├── auth.setup.spec.js    # Setup project: writes `.auth/bo-user.json` for dashboard/orders
│   ├── fixtures/
│   │   ├── base-core.js      # POM fixtures only (no global hooks)
│   │   └── base.js           # Re-exports core + screenshot on failure
│   ├── login/
│   │   └── login.spec.js     # Login project: unauthenticated login flows
│   ├── dashboard/
│   │   └── dashboard.spec.js # Dashboard project (depends on setup)
│   ├── orders/
│   │   └── orders.spec.js    # Orders project (depends on setup)
│   └── support/
│       ├── ordersNetwork.js  # Orders API response matching + 429-aware wait predicate
│       └── rateLimit.js      # goto/reload retries on HTTP 429, API 429 logger
├── playwright.config.js
├── package.json
└── README.md
```

| Path | Purpose |
|------|---------|
| `config/constants.js` | Central config: base URL, paths, env keys, timeouts |
| `pages/BasePage.js` | Base page object; shared `page`, `goto()`, `waitForLoadState()` |
| `pages/LoginPage.js` | Login page: locators + `login()`, `expectOnLoginPage()` |
| `pages/DashboardPage.js` | Dashboard: locators + `goToRoles()`, `expectLoggedIn()`, etc. |
| `pages/OrdersPage.js` | Orders list: search, filters, table POM |
| `tests/support/ordersNetwork.js` | `waitForOrdersBackendAfter`, `matchOrdersBackendOrThrow429` |
| `tests/support/rateLimit.js` | `gotoWith429Retry`, `reloadWith429Retry`, `attach429ApiLogger` |
| `setup/globalSetup.js` | Runs once before all tests |
| `setup/globalTeardown.js` | Runs once after all tests |
| `tests/fixtures/base.js` | Fixtures, `beforeEach`/`afterEach`, screenshot on failure |
| `tests/fixtures/base-core.js` | Core POM fixtures (used by `base.js`) |
| `tests/auth.setup.spec.js` | **setup** project: staging auth file for saved session |
| `tests/login/login.spec.js` | **login** project: login UI and OTP flow |
| `tests/dashboard/dashboard.spec.js` | **dashboard** project: post-login dashboard |
| `tests/orders/orders.spec.js` | **orders** project: Orders list automation |

---

## Setup and teardown

| Hook | Scope | Purpose |
|------|-------|---------|
| `globalSetup` | Once per run | Validate env, log start |
| `globalTeardown` | Once per run | Log end, cleanup |
| `beforeEach` | Per test | Per-test setup (extend in fixtures) |
| `afterEach` | Per test | Screenshot on failure, cleanup |

Defined in `playwright.config.js` (globalSetup/globalTeardown) and `tests/fixtures/base.js` (beforeEach/afterEach).

---

## Screenshot on failure

- **Playwright default** – `screenshot: 'only-on-failure'` in config captures screenshots automatically.
- **Custom teardown** – `afterEach` in fixtures saves additional screenshots to `test-results/screenshots/` when a test fails.

---

## Configuration

- **Base URL and paths** – `config/constants.js` (`BASE_URL`, `PATHS`).
- **Timeouts** – `config/constants.js` (`TIMEOUTS`); used in `playwright.config.js`.
- **Credentials** – never in repo; use env vars (see [Authenticated tests](#authenticated-tests)).

---

## Authenticated tests

### Login with OTP

The app uses a two-step login: mobile → OTP. Use `loginWithOtp(mobile, otp)`:

```javascript
await loginPage.goto();
await loginPage.loginWithOtp('9123456789', '123456');
await dashboardPage.expectLoggedIn();
```

### Login with env credentials

Set environment variables (see `config/constants.js`):

- `BO_MOBILE` or `TEST_MOBILE` – mobile number
- `BO_OTP` or `TEST_OTP` – OTP (for OTP flow)
- `BO_PASSWORD` or `TEST_PASSWORD` – password (if app uses password)

```bash
BO_MOBILE=9123456789 BO_OTP=123456 npm test
```

Do not commit real credentials. Use a `.env` file locally (in `.gitignore`) or CI secrets.

---

## Adding new tests and page objects

### New page object

1. Create a class in `pages/` that **extends `BasePage`**.
2. Define locators as getters and actions as async methods.
3. In `tests/fixtures/base-core.js`, add a fixture that does `await use(new YourPage(page))`.

### New test file

1. Create a feature folder under `tests/<feature>/` and add `*.spec.js` there.
2. Use `test` and `expect` from `tests/fixtures/base.js` (`require('../fixtures/base')`).
3. Request page objects via fixtures (e.g. `async ({ loginPage, dashboardPage }) => { ... }`).

---

## Practices followed

- **Page Object Model** – one class per screen; locators and actions in `pages/`, tests in `tests/`.
- **Fixtures** – `base-core.js` exposes `loginPage`, `dashboardPage`, `ordersPage` via `new` per test; specs use fixtures, not direct `require` of POM classes.
- **Base page** – shared behavior in `BasePage`; all POMs extend it.
- **Central config** – URLs, paths, env keys, timeouts in `config/constants.js`.
- **Setup and teardown** – globalSetup/globalTeardown plus beforeEach/afterEach.
- **Screenshot on failure** – built-in plus custom save to `test-results/screenshots/`.
- **No hardcoded secrets** – credentials via environment variables only.
- **Stable selectors** – role-based and placeholder-based locators.
- **Orders** – `tests/orders/orders.spec.js`; optional `ORDERS_API_URL_MATCH` for API checks.
