# Agent Instructions & Project Conventions

**Project:** Gabay Estate Management Frontend
**Stack:** React 19, Next.js 16, JavaScript (ESM)

This document provides definitive instructions for AI coding agents operating within this repository. Adhering to these guidelines ensures consistency, maintainability, and alignment with existing project conventions. 

There are currently no existing `.cursorrules` or `.github/copilot-instructions.md` files; these rules serve as the primary source of truth.

---

## 1. Build, Lint, and Test Commands

All scripts must be executed from within the `gabay-estate-management-nextjs` directory. Navigate to this directory using the `workdir` parameter or execute commands with the correct path.

### Build Commands
- **Install Dependencies:** `yarn install`
- **Development Server:** `yarn run dev`
- **Production Build:** `yarn run build`
- **Start Production Server:** `yarn run start`

### Linting Commands
The project uses ESLint with a modern flat configuration (`eslint.config.mjs`). It includes `eslint-config-next` and `eslint-plugin-unicorn`.
- **Run Linter:** `yarn run lint`
- **Configuration Note:** Pay attention to custom rules in `eslint.config.mjs`.

### Testing Commands
*Note: A formal testing framework (e.g., Vitest or Jest) is not currently present in `package.json`. When one is introduced, use the following standard conventions.*
- **Run All Tests:** `yarn run test`
- **Run a Single Test File:** `npx vitest <path/to/test-file.test.js>`
- **Run a Specific Test Case:** `npx vitest -t "test name to match"`
- **Run Tests in Watch Mode:** `yarn run test:watch`
- **Run Coverage:** `yarn run test:coverage`

*(Always check `package.json` for updated test scripts before executing).*

---

## 2. Code Style Guidelines

### 2.1. Language & Ecosystem
- **JavaScript (ES2020+):** Use modern JavaScript features consistently (optional chaining, nullish coalescing, destructuring, spread syntax, template literals).
- **No TypeScript:** While `typescript` is in `devDependencies`, the project currently uses pure JavaScript (`.js`, `.jsx`). Do not introduce `.ts` or `.tsx` files unless explicitly asked.
- **Module System:** Use ES Modules (`import`/`export`).

### 2.2. Formatting & Linting
- **Indentation & Spacing:** Use 2 spaces for indentation.
- **Quotes:** Prefer single quotes (`'`) for strings in JS, and double quotes (`"`) for JSX attributes.
- **Semicolons:** Omit semicolons where possible, as per standard modern JS conventions, unless it creates ambiguity.
- **Lint Errors:** Always resolve ESLint errors before committing changes. Do not use `// eslint-disable-next-line` unless absolutely necessary and well-documented.

### 2.3. Imports
Group imports systematically at the top of the file to maintain readability:
1. Core React/Next.js dependencies (`react`, `next/link`, etc.)
2. Third-party libraries
3. Internal context, hooks, or utilities (using `@/` alias where possible)
4. Local components
5. Assets (images, SVGs)
6. Stylesheets (`.css`)

```javascript
// Example:
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { formatCurrency } from '@/utils/format';
import Header from '@/components/Header';
import logo from '@/assets/logo.svg';
import './Dashboard.css';
```

### 2.4. React Components
- **Functional Components:** Exclusively use functional components. Do not use class components.
- **Hooks:** Use built-in React hooks (`useState`, `useEffect`, `useMemo`, `useCallback`) and Next.js hooks (`useRouter`).
- **JSX:** Keep JSX clean and readable. Extract complex conditional logic or large loops into helper functions or sub-components.
- **Props:** Destructure props in the function signature. Provide sensible default values for optional props.

### 2.5. Naming Conventions
- **Files & Directories:**
  - Components: PascalCase (e.g., `PropertyCard.jsx`, `Layout.jsx`)
  - Utilities/Hooks: camelCase (e.g., `formatDate.js`, `useAuth.js`)
  - Assets: kebab-case (e.g., `hero-image.png`, `logo-dark.svg`)
- **Variables & Functions:** camelCase (e.g., `userList`, `fetchData()`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`, `API_BASE_URL`)
- **Components:** PascalCase (e.g., `UserProfile`)
- **Event Handlers:** Prefix with `handle` (e.g., `handleSubmit`, `handleInputChange`). Prefix props with `on` (e.g., `onSubmit`).

### 2.6. State Management
- Lift state up only when necessary to share data between sibling components.
- Prefer local component state (`useState`, `useReducer`) for UI-specific data (modals, toggles, form inputs).
- Do not mutate state directly; always use the setter functions provided by the hook, utilizing the functional update form when new state depends on the previous state (`setCount(prev => prev + 1)`).

### 2.7. Error Handling & Asynchronous Operations
- **Async/Await:** Use `async`/`await` for asynchronous operations instead of `.then()` chains for better readability.
- **Try/Catch:** Always wrap asynchronous network requests in `try/catch` blocks.
- **User Feedback:** Ensure errors are surfaced gracefully in the UI (e.g., error messages, toast notifications, fallback UI) rather than just logging to the console.
- **Cleanup:** Always provide cleanup functions in `useEffect` when setting up subscriptions, intervals, or event listeners.

```javascript
// Example Error Handling
async function loadProperties() {
  try {
    setLoading(true);
    setError(null);
    const data = await fetchProperties();
    setProperties(data);
  } catch (error) {
    console.error('Failed to load properties:', error);
    setError('Could not load properties at this time. Please try again later.');
  } finally {
    setLoading(false);
  }
}
```

### 2.8. File & Folder Structure
Adhere strictly to the existing directory architecture inside `gabay-estate-management-nextjs/src`:
- `/components`: Reusable UI components.
- `/pages`: Next.js pages (using Pages Router).
- `/hooks`: Custom React hooks.
- `/utils`: Helper functions, formatters, and constants.
- `/logic`: Business logic and service integrations (e.g., `EmailJsLogic.js`).
- `/styles`: Global and component-specific CSS.

### 2.9. Styling & CSS
- The project uses Bootstrap 5 with Bootswatch themes.
- Use descriptive, semantic, and scoped class names.
- Avoid inline styles (`style={{ ... }}`) unless strictly necessary for dynamic values.
- Ensure interfaces are responsive and mobile-friendly using standard CSS media queries or Bootstrap grid.

### 2.10. Code Comments & Documentation
- **Why, not What:** Write comments that explain the *intent* or *business logic* behind complex code, not simply repeating what the code does.
- Keep comments up-to-date with code changes. Remove stale comments immediately.
- Avoid redundant comments for obvious code.
- Provide JSDoc headers for complex utility functions that require parameter and return value explanations.

### 2.11. Agent Specific Directives
- **Verification:** Always run `yarn run lint` AND `yarn test` to verify there are no errors after writing or modifying code.
- **Unit Test Integrity:** Never modify unit tests just to make them pass. If a test fails, investigate and fix the implementation first. Only update the test if the underlying business logic or API interface has intentionally changed.
- **API Testing:** All new API endpoints MUST include unit tests covering happy, edge, and bad cases (e.g., missing fields, unauthorized access, DB errors). Tests should be placed in the `tests/api` directory and use Vitest with `node-mocks-http`.
- **Dependency Management:** Never add a new yarn package without explicitly asking the user, unless it's strictly implied by the core requirement.
- **Tool Usage:** Prefer specific file parsing tools (`read`, `edit`, `write`) over generic bash scripting when interacting with the codebase. Always use absolute paths.
- **No Unsolicited Refactoring:** Only refactor code that is directly related to the user's explicit request. Do not "clean up" unrelated files.
- **Do Not Alert User Made Changes:** While refactoring code if you think the change was made by the user. Do not try to adjust it unless asked to by the user.

---

## 3. Development Workflow

### 3.1. Branching Policy
- **New Branch for Every Change:** ALWAYS open a new feature branch for any code changes. Unless you are in a new feature branch already.
- **Base Branch:** Use `dev-ido` as your local base branch.
- **No Direct Commits to Main:** NEVER make changes to the `main` branch directly.

### 3.2. Synchronizing with Upstream
- **Up-to-Date Check:** Always verify that the `dev-ido` branch is up-to-date with the `dev` branch (`origin/dev`) before starting work.
- **Merge Conflict Protocol:** If merge conflicts occur during synchronization, STOP and notify the user. Let the user address conflicts manually.
