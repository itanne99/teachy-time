# Agent Instructions & Project Conventions

**Project:** Teachy Time
**Stack:** React 19, Next.js 15/16, JavaScript (ESM), Bootstrap 5

This document outlines the conventions and best practices that AI coding agents must follow. It incorporates specialized guidelines for tRPC, SEO indexing, UI/UX design, database optimization, and launch-readiness checks.

---

## 1. Build, Lint, and Test Commands

Navigate to the workspace root to execute these commands:
- **Install Dependencies:** `yarn install`
- **Development Server:** `yarn run dev`
- **Production Build:** `yarn run build`
- **Start Production Server:** `yarn run start`
- **Run Linter:** `yarn run lint`
- **Run Tests:** `yarn run test` (or `npx vitest`)

---

## 2. General Code Style

### 2.1 Language & Spacing
- **JavaScript (ES2020+):** Use ES Modules (`import`/`export`). No TypeScript for source code (`.js`, `.jsx` only).
- **Indentation:** Use 2 spaces for indentation.
- **Quotes & Semicolons:** Use single quotes (`'`) for JS strings, double quotes (`"`) for JSX attributes. Omit semicolons where possible.
- **No Unused Code:** Automatically run code cleanup before committing: remove dead imports, unused variables, and stale comments.

### 2.2 React Component Construction
- **Components:** Exclusively functional components, destructuring props with default parameters.
- **State:** Lift state only when sharing with siblings. Use functional updates (`setCount(prev => prev + 1)`) to avoid race conditions.
- **Waterfalls:** Never chain sequential awaits. Run independent operations concurrently using `Promise.all()` or stream non-essential data using Suspense boundaries.
- **Imports:** Avoid barrel file imports (e.g. `import { Icon } from 'lucide-react'`). Import directly from source paths to reduce dev start times and cold-start latency.

---

## 3. Specialized Stack Guidelines

### 3.1 tRPC Fullstack APIs
- **Type Safety:** Ensure types flow cleanly from server routers directly to client queries/mutations.
- **Middlewares:** Implement rate-limiting, authentication, and context scoping cleanly inside router procedures.
- **Query/Mutation Separation:** Use queries for reads (idempotent, cacheable) and mutations for writes (state-altering).

### 3.2 SEO Indexing & Metadata
- **Canonical URLs:** Every page must include an absolute canonical URL alternates metadata. Never use relative paths.
- **Raw HTML Meta:** All metadata (OG tags, Twitter cards, descriptions) must be present in the raw HTML response. Put them in standard layouts/pages instead of client-side additions.
- **Static Render Check:** Important pages (like homepage, blog, public tools) must render statically (`○` or `●` in build output). Use `generateStaticParams` for dynamic routes to ensure they are pre-rendered.
- **Robots & Sitemaps:** Ensure `robots.txt` points to `sitemap.xml` and returns `200` with valid XML format. Do not block search crawlers on key routes.

### 3.3 UI/UX Design System (Bootstrap 5 & Bootstrap Icons)
- **SVG Icons:** Use consistent SVG icons from `react-bootstrap-icons`. Never use emojis as interactive icons.
- **Interactivity:** Every clickable element must have `cursor-pointer`, a smooth hover transition (`duration-200`), and a visible focus state for keyboard navigation.
- **Layout Consistency:** Maintain container max-widths, responsive paddings, and ensure no horizontal scrolls exist on mobile screen sizes (375px/768px).

### 3.4 Supabase & Postgres Database
- **Index FKs:** Always index foreign key columns and any fields frequently used in `WHERE` or `JOIN` conditions.
- **Covering & Partial Indexes:** Use covering indexes (`INCLUDE` clause) to avoid table heap lookups, and partial indexes (`WHERE` clause) to keep indexes small and fast for filtered queries.
- **Connection Limits:** Calculate connection limits based on available memory and use connection pooling (PgBouncer) for concurrent applications.

### 3.5 Pakistani Payments Integration (PKR Stack)
- **Webhook Durability:** webhook handling must be resilient. Idempotently log event IDs to prevent duplicate charging, handle signature verification, and return a fast `200 OK` response.
- **Reconciliation:** Log payment status transitions clearly in the database for tracking.

---

## 4. Production QA & Definition of Done

A task is not complete until it passes the following checklist:
- [ ] Code compiles without errors (`npx tsc --noEmit` if type-checking is active).
- [ ] ESLint lints clean with 0 warnings (`yarn run lint`).
- [ ] Unit tests pass cleanly.
- [ ] Build command finishes successfully (`yarn run build`).
- [ ] No secrets, passwords, API keys, or `localhost:3000` URLs are staged in git diffs.
- [ ] Commits are descriptively scoped (e.g. `feat(seo): add canonical tags`).

---

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **teachy-time** (691 symbols, 1003 relationships, 26 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/teachy-time/context` | Codebase overview, check index freshness |
| `gitnexus://repo/teachy-time/clusters` | All functional areas |
| `gitnexus://repo/teachy-time/processes` | All execution flows |
| `gitnexus://repo/teachy-time/process/{name}` | Step-by-step execution trace |

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
