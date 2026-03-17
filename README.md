# Back Office Automation (Pickup Coffee)

Industry-standard **UI test automation** for the Pickup Coffee Back Office staging site, built with [Playwright](https://playwright.dev/) (JavaScript), **Page Object Model (POM)**, and a **Page Factory**. Tests and page objects are separated; config, setup, and teardown are centralized.

**Target application:** https://staging.bo.pickup-coffee.net/

---

## Table of contents

- [Setup](#setup)
- [Running tests](#running-tests)
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
| `npm test` | Run all tests headless (default) |
| `npm run test:headed` | Run with browser window visible |
| `npm run test:ui` | Open Playwright Test UI |
| `npm run test:debug` | Run in debug mode |
| `npm run report` | Open last HTML report |

Override base URL:

```bash
BASE_URL=https://staging.bo.pickup-coffee.net npm test
```

---

## Page Object Model (POM)

This framework uses the **Page Object Model** with a clear separation:

- **`pages/`** – Page objects (locators and actions); tests never import these directly.
- **`tests/`** – Test specs only; they use fixtures that provide page objects.

### Concepts

1. **Base Page (`pages/BasePage.js`)**  
   All page objects extend `BasePage`. It holds the Playwright `page` instance and common helpers (`goto(path)`, `waitForLoadState()`).

2. **Page Objects (`pages/LoginPage.js`, `pages/DashboardPage.js`)**  
   Each class represents one screen:
   - **Locators** as getters (e.g. `mobileInput`, `loginButton`).
   - **Actions** as async methods (e.g. `login(mobile, password)`, `goToRoles()`).
   - **Assertions** as helper methods (e.g. `expectOnLoginPage()`, `expectLoggedIn()`).

3. **Page Factory (`pages/PageFactory.js`)**  
   Creates and caches page objects. Tests receive `loginPage`, `dashboardPage`, etc. via fixtures.

4. **Fixtures (`tests/fixtures/base.js`)**  
   Exposes `pageFactory`, `loginPage`, `dashboardPage`, `authenticatedPage`, plus setup/teardown hooks.

### Flow

```
Test (tests/*.spec.js)
  → uses fixture (loginPage, dashboardPage)
    → fixture uses PageFactory (pages/PageFactory.js)
      → PageFactory returns LoginPage, DashboardPage (pages/)
        → each page extends BasePage, uses config (config/constants.js)
```

### Example

```javascript
const { test, expect } = require('./fixtures/base');

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
```

---

## Project structure

```
BackOffice_Automation/
├── config/
│   └── constants.js          # BASE_URL, PATHS, ENV_KEYS, TIMEOUTS
├── pages/                    # Page Object Model (separate from tests)
│   ├── BasePage.js           # Base class for all page objects
│   ├── PageFactory.js        # Creates/caches page objects
│   ├── LoginPage.js          # Login screen POM
│   └── DashboardPage.js      # Dashboard (post-login) POM
├── setup/
│   ├── globalSetup.js        # Runs once before all tests
│   └── globalTeardown.js     # Runs once after all tests
├── tests/                    # Test specs only
│   ├── fixtures/
│   │   └── base.js           # POM fixtures, setup/teardown, screenshot on failure
│   ├── login.spec.js
│   └── dashboard.spec.js
├── playwright.config.js
├── package.json
└── README.md
```

| Path | Purpose |
|------|---------|
| `config/constants.js` | Central config: base URL, paths, env keys, timeouts |
| `pages/BasePage.js` | Base page object; shared `page`, `goto()`, `waitForLoadState()` |
| `pages/PageFactory.js` | Factory that returns/caches `LoginPage`, `DashboardPage`, etc. |
| `pages/LoginPage.js` | Login page: locators + `login()`, `expectOnLoginPage()` |
| `pages/DashboardPage.js` | Dashboard: locators + `goToRoles()`, `expectLoggedIn()`, etc. |
| `setup/globalSetup.js` | Runs once before all tests |
| `setup/globalTeardown.js` | Runs once after all tests |
| `tests/fixtures/base.js` | Fixtures, `beforeEach`/`afterEach`, screenshot on failure |

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

Tests that perform login require credentials via environment variables. Names are in `config/constants.js` (`ENV_KEYS`):

- `BO_MOBILE` or `TEST_MOBILE` – mobile number
- `BO_PASSWORD` or `TEST_PASSWORD` – password

Example:

```bash
BO_MOBILE=9123456789 BO_PASSWORD=yourpassword npm test
```

Do not commit real credentials. Use a `.env` file locally (in `.gitignore`) or CI secrets.

---

## Adding new tests and page objects

### New page object

1. Create a class in `pages/` that **extends `BasePage`**.
2. Define locators as getters and actions as async methods.
3. In `pages/PageFactory.js`, add a getter that instantiates and caches the new page object.
4. In `tests/fixtures/base.js`, add a fixture that returns `pageFactory.<yourPage>`.

### New test file

1. Create a `*.spec.js` under `tests/`.
2. Use `test` and `expect` from `tests/fixtures/base.js`.
3. Request page objects via fixtures (e.g. `async ({ loginPage, dashboardPage }) => { ... }`).

---

## Practices followed

- **Page Object Model** – one class per screen; locators and actions in `pages/`, tests in `tests/`.
- **Page Factory** – single place to obtain page objects; lazy creation and reuse.
- **Base page** – shared behavior in `BasePage`; all POMs extend it.
- **Central config** – URLs, paths, env keys, timeouts in `config/constants.js`.
- **Setup and teardown** – globalSetup/globalTeardown plus beforeEach/afterEach.
- **Screenshot on failure** – built-in plus custom save to `test-results/screenshots/`.
- **No hardcoded secrets** – credentials via environment variables only.
- **Stable selectors** – role-based and placeholder-based locators.
