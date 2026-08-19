# Agent Instructions & Project Conventions

**Project:** Teachy Time  
**Stack:** React 19, Next.js 15/16, JavaScript (ESM), Bootstrap 5  

This document serves as the master source of truth for AI coding agents in this repository. It defines our mandatory MCP routing rules, development lifecycle, code conventions, specialized stack patterns, and Definition of Done.

---

## 1. Build, Lint, and Test Commands

Execute these commands from the workspace root:
- **Install Dependencies:** `yarn install`
- **Development Server:** `yarn run dev`
- **Production Build:** `yarn run build`
- **Start Production Server:** `yarn run start`
- **Run Linter:** `yarn run lint`
- **Run Tests:** `yarn run test` (or `npx vitest`)

---

## 2. Model Context Protocol (MCP) Routing & Tool Selection

Always route tool calls according to the following deterministic policy without requiring manual prompting:

| Domain | Primary Tool / MCP | Policy & Fallback Rules |
|---|---|---|
| **Code Exploration & Impact** | `gitnexus` | **MUST** run `impact({target: "symbolName", direction: "upstream"})` before modifying any symbol.<br>**MUST** run `detect_changes()` before committing.<br>Use `query` and `context` instead of blind grepping. |
| **External Package Docs** | `context7` | **MUST** query `context7` (`query-docs`) whenever using or upgrading external npm packages (Next.js, tRPC, Bootstrap, etc.) to get verified API docs. |
| **Database & Schemas** | `supabase-local` (Default) | Exclusively use local Supabase for local dev, migrations, schema inspection, and testing.<br>`teachytime-supabase-remote` is **strictly restricted** to debugging live production issues. |
| **UI & Visual Design** | `open-design` | Solely rely on `open-design` for UI/design tasks.<br>• If the app/server is down, **immediately notify the human partner**.<br>• If `open-design` is unavailable, **prompt the human partner** before falling back to `google-stitch`. |
| **GitHub Operations** | `github` | Use `github` MCP for issues, PR reviews, comments, and repository status. |

---

## 3. Superpowers Development Lifecycle

All feature work and non-trivial bugfixes MUST follow the 4-phase Superpowers development pipeline:

```
[Phase 1: Brainstorming] ──> [Phase 2: Writing Plans] ──> [Phase 3: Execution & TDD] ──> [Phase 4: Verification]
 (superpowers:brainstorming)   (superpowers:writing-plans)    (executing-plans / SDD)    (verification-before-completion)
```

1. **Phase 1: Brainstorming & Requirement Alignment (`superpowers:brainstorming`)**
   - Explore user intent, constraints, and success criteria one question at a time.
   - For UI design questions, activate `open-design` MCP.
   - Produce a design specification saved to `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`.
   - **Hard Gate:** Do not write code or scaffold implementations until the design spec is approved.

2. **Phase 2: Blast Radius & Implementation Plan (`superpowers:writing-plans`)**
   - Run `gitnexus` impact analysis on candidate symbols to assess the blast radius.
   - Query `context7` for any external library APIs.
   - Produce a step-by-step implementation plan in `docs/superpowers/plans/YYYY-MM-DD-<topic>-plan.md`.
   - **Hard Gate:** Obtain explicit user approval on the plan before editing source files.

3. **Phase 3: Execution & TDD (`superpowers:executing-plans` or `superpowers:subagent-driven-development`)**
   - Follow `superpowers:test-driven-development`: write failing tests first, then write minimal code to pass.
   - If tests fail unexpectedly, invoke `superpowers:systematic-debugging` (no guess-fixing).
   - Maintain clean modularity: destructure component props, use direct imports, and avoid barrel files.

4. **Phase 4: Verification & Quality Gate (`superpowers:verification-before-completion`)**
   - Run `yarn run lint` (must pass with 0 errors / 0 warnings).
   - Run `yarn run test` (all unit tests must pass).
   - Run `yarn run build` (must build cleanly with static routes pre-rendered).
   - Run `gitnexus_detect_changes()` to ensure only expected symbols were affected.
   - Create/update `walkthrough.md` with verification evidence.

---

## 4. General Code Style

### 4.1 Language & Spacing
- **JavaScript (ES2020+):** Use ES Modules (`import`/`export`). No TypeScript for source code (`.js`, `.jsx` only).
- **Indentation:** Use 2 spaces for indentation.
- **Quotes & Semicolons:** Use single quotes (`'`) for JS strings, double quotes (`"`) for JSX attributes. Omit semicolons where possible.
- **No Unused Code:** Automatically run code cleanup before committing: remove dead imports, unused variables, and stale comments.

### 4.2 React Component Construction
- **Components:** Exclusively functional components, destructuring props with default parameters.
- **State:** Lift state only when sharing with siblings. Use functional updates (`setCount(prev => prev + 1)`) to avoid race conditions.
- **Waterfalls:** Never chain sequential awaits. Run independent operations concurrently using `Promise.all()` or stream non-essential data using Suspense boundaries.
- **Imports:** Avoid barrel file imports (e.g. `import { Icon } from 'lucide-react'`). Import directly from source paths to reduce dev start times and cold-start latency.

---

## 5. Specialized Stack Guidelines

### 5.1 tRPC Fullstack APIs
- **Type Safety:** Ensure types flow cleanly from server routers directly to client queries/mutations.
- **Middlewares:** Implement rate-limiting, authentication, and context scoping cleanly inside router procedures.
- **Query/Mutation Separation:** Use queries for reads (idempotent, cacheable) and mutations for writes (state-altering).

### 5.2 SEO Indexing & Metadata
- **Canonical URLs:** Every page must include an absolute canonical URL alternates metadata. Never use relative paths.
- **Raw HTML Meta:** All metadata (OG tags, Twitter cards, descriptions) must be present in the raw HTML response. Put them in standard layouts/pages instead of client-side additions.
- **Static Render Check:** Important pages (like homepage, blog, public tools) must render statically (`○` or `●` in build output). Use `generateStaticParams` for dynamic routes to ensure they are pre-rendered.
- **Robots & Sitemaps:** Ensure `robots.txt` points to `sitemap.xml` and returns `200` with valid XML format. Do not block search crawlers on key routes.

### 5.3 UI/UX Design System (Bootstrap 5 & Bootstrap Icons)
- **SVG Icons:** Use consistent SVG icons from `react-bootstrap-icons`. Never use emojis as interactive icons.
- **Interactivity:** Every clickable element must have `cursor-pointer`, a smooth hover transition (`duration-200`), and a visible focus state for keyboard navigation.
- **Layout Consistency:** Maintain container max-widths, responsive paddings, and ensure no horizontal scrolls exist on mobile screen sizes (375px/768px).

### 5.4 Supabase & Postgres Database
- **Index FKs:** Always index foreign key columns and any fields frequently used in `WHERE` or `JOIN` conditions.
- **Covering & Partial Indexes:** Use covering indexes (`INCLUDE` clause) to avoid table heap lookups, and partial indexes (`WHERE` clause) to keep indexes small and fast for filtered queries.
- **Connection Limits:** Calculate connection limits based on available memory and use connection pooling (PgBouncer) for concurrent applications.

### 5.5 Pakistani Payments Integration (PKR Stack)
- **Webhook Durability:** Webhook handling must be resilient. Idempotently log event IDs to prevent duplicate charging, handle signature verification, and return a fast `200 OK` response.
- **Reconciliation:** Log payment status transitions clearly in the database for tracking.

---

## 6. Production QA & Definition of Done

A task is not complete until it passes the following checklist:
- [ ] Code compiles without errors.
- [ ] ESLint lints clean with 0 warnings (`yarn run lint`).
- [ ] Unit tests pass cleanly (`yarn run test`).
- [ ] Build command finishes successfully (`yarn run build`).
- [ ] GitNexus change detection runs cleanly (`detect_changes()`).
- [ ] No secrets, passwords, API keys, or `localhost:3000` URLs are staged in git diffs.
- [ ] Commits are descriptively scoped (e.g. `feat(seo): add canonical tags`).

---

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **teachy-time** (613 symbols, 1163 relationships, 43 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> Index stale? Run `node .gitnexus/run.cjs analyze` from the project root — it auto-selects an available runner. No `.gitnexus/run.cjs` yet? `npx gitnexus analyze` (npm 11 crash → `npm i -g gitnexus`; #1939).

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows. For regression review, compare against the default branch: `detect_changes({scope: "compare", base_ref: "master"})`.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `query({search_query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `context({name: "symbolName"})`.
- For security review, `explain({target: "fileOrSymbol"})` lists taint findings (source→sink flows; needs `analyze --pdg`).

## Never Do

- NEVER edit a function, class, or method without first running `impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `rename` which understands the call graph.
- NEVER commit changes without running `detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/teachy-time/context` | Codebase overview, check index freshness |
| `gitnexus://repo/teachy-time/clusters` | All functional areas |
| `gitnexus://repo/teachy-time/processes` | All execution flows |
| `gitnexus://repo/teachy-time/process/{name}` | Step-by-step execution trace |

<!-- gitnexus:end -->
