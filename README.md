# Back Office Automation (Pickup Coffee)

Industry-standard **UI test automation** for the Pickup Coffee Back Office staging site, built with [Playwright](https://playwright.dev/) (JavaScript), **Page Object Model (POM)**, and a **Page Factory** for maintainability and scalability.

**Target application:** https://staging.bo.pickup-coffee.net/

---

## Table of contents

- [Setup](#setup)
- [Running tests](#running-tests)
- [Page Object Model (POM)](#page-object-model-pom)
- [Project structure](#project-structure)
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

This framework uses the **Page Object Model** so that:

- **Locators** live in one place (page classes), not scattered in tests.
- **Actions** (e.g. login, navigate) are reusable methods on page objects.
- **Tests** stay short and readable and focus on behavior, not selectors.

### Concepts

1. **Base Page (`BasePage.js`)**  
   All page objects extend `BasePage`. It holds the Playwright `page` instance and common helpers (e.g. `goto(path)`, `waitForLoadState()`).

2. **Page Objects (e.g. `LoginPage.js`, `DashboardPage.js`)**  
   Each class represents one screen or logical area:
   - **Locators** exposed as getters (e.g. `mobileInput`, `loginButton`).
   - **Actions** as async methods (e.g. `login(mobile, password)`, `goToRoles()`).
   - **Assertions** that belong to the page can be helper methods (e.g. `expectOnLoginPage()`, `expectLoggedIn()`).

3. **Page Factory (`PageFactory.js`)**  
   A single entry point that creates and caches page objects for the same browser `page`. Tests get `loginPage`, `dashboardPage`, etc. via fixtures that delegate to the factory, so each test receives the same page context.

4. **Fixtures (`tests/fixtures/base.js`)**  
   Playwright fixtures expose:
   - `pageFactory` – use `pageFactory.loginPage`, `pageFactory.dashboardPage`, etc.
   - `loginPage`, `dashboardPage` – convenience fixtures that use the factory.
   - `authenticatedPage` – a pre-logged-in page when credentials are set.

### Flow

```
Test
  → uses fixture (e.g. loginPage, dashboardPage)
    → fixture uses PageFactory
      → PageFactory returns/caches LoginPage, DashboardPage, …
        → each page object extends BasePage and uses config (constants)
```

### Example: test using POM

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
├── playwright.config.js      # Playwright config (uses config/constants)
├── package.json
├── README.md
├── tests/
│   ├── fixtures/
│   │   └── base.js           # POM + Page Factory fixtures
│   ├── pages/
│   │   ├── BasePage.js       # Base class for all page objects
│   │   ├── PageFactory.js    # Creates/caches page objects
│   │   ├── LoginPage.js      # Login screen POM
│   │   └── DashboardPage.js  # Dashboard (post-login) POM
│   ├── login.spec.js
│   └── dashboard.spec.js
└── .gitignore
```

| Path | Purpose |
|------|--------|
| `config/constants.js` | Central config: base URL, paths, env key names, timeouts |
| `tests/pages/BasePage.js` | Base page object; shared `page`, `goto()`, `waitForLoadState()` |
| `tests/pages/PageFactory.js` | Factory that returns/caches `LoginPage`, `DashboardPage`, etc. |
| `tests/pages/LoginPage.js` | Login page: locators + `login()`, `expectOnLoginPage()` |
| `tests/pages/DashboardPage.js` | Dashboard: locators + `goToRoles()`, `expectLoggedIn()`, etc. |
| `tests/fixtures/base.js` | Fixtures: `pageFactory`, `loginPage`, `dashboardPage`, `authenticatedPage` |

---

## Configuration

- **Base URL and paths** – `config/constants.js` (`BASE_URL`, `PATHS`).
- **Timeouts** – `config/constants.js` (`TIMEOUTS`); used in `playwright.config.js`.
- **Credentials** – never in repo; use env vars (see [Authenticated tests](#authenticated-tests)).

---

## Authenticated tests

Tests that perform login require credentials via environment variables. Names are defined in `config/constants.js` (`ENV_KEYS`); primary keys:

- `BO_MOBILE` or `TEST_MOBILE` – mobile number
- `BO_PASSWORD` or `TEST_PASSWORD` – password

Example:

```bash
BO_MOBILE=9123456789 BO_PASSWORD=yourpassword npm test
```

Do not commit real credentials. Use a `.env` file locally (and add it to `.gitignore`) or set env in CI secrets.

---

## Adding new tests and page objects

### New page object

1. Create a class in `tests/pages/` that **extends `BasePage`**.
2. Define locators as getters and actions as async methods.
3. In `tests/pages/PageFactory.js`, add a private property and a getter that instantiates and caches the new page object.
4. In `tests/fixtures/base.js`, add a fixture that returns `pageFactory.<yourPage>`.

### New test file

1. Create a `*.spec.js` under `tests/`.
2. Use the extended `test` and `expect` from `tests/fixtures/base.js`.
3. Request the page objects you need via fixtures (e.g. `async ({ loginPage, dashboardPage }) => { ... }`).

---

## Practices followed

- **Page Object Model** – one class per screen/area; locators and actions encapsulated.
- **Page Factory** – single place to obtain page objects; lazy creation and reuse per context.
- **Base page** – shared behavior (navigation, wait) in `BasePage`; all POMs extend it.
- **Central config** – URLs, paths, env keys, and timeouts in `config/constants.js`.
- **No hardcoded secrets** – credentials via environment variables only.
- **Stable selectors** – preference for role-based and placeholder-based locators.
- **Clear test vs page responsibility** – tests orchestrate; page objects expose actions and, where useful, assertion helpers.
