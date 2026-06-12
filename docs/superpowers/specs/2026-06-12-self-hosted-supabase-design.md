# Design: Self-Hosted Supabase Stack with Supabase CLI Migrations

**Date:** 2026-06-12  
**Status:** Approved

## Problem

The project currently uses a plain `postgres:16-alpine` container with Bytebase for database management. This diverges significantly from the production Supabase environment, making local testing unreliable. There is also no standardized migration workflow for managing schema changes across local and cloud environments.

## Solution

Replace the current Postgres + Bytebase setup with the full self-hosted Supabase stack, and adopt Supabase CLI migrations for schema management across environments.

## Architecture

### Services (docker-compose.yaml)

| Service | Image | Ports | Purpose |
|---------|-------|-------|---------|
| `db` | `supabase/postgres:15.8.1.085` | 5432 (internal) | PostgreSQL with Supabase extensions |
| `kong` | `kong/kong:3.9.1` | 8000, 8443 | API gateway |
| `auth` | `supabase/gotrue:v2.189.0` | internal | Authentication (GoTrue) |
| `rest` | `postgrest/postgrest:v14.12` | internal | Auto-generated REST API |
| `realtime` | `supabase/realtime:v2.102.3` | internal | Realtime subscriptions |
| `storage` | `supabase/storage-api:v1.60.4` | internal | File storage |
| `meta` | `supabase/postgres-meta:v0.96.6` | internal | Database metadata |
| `studio` | `supabase/studio:2026.06.03` | 3000 | Supabase Studio (web UI) |
| `supavisor` | `supabase/supavisor:2.9.5` | 5432 (external), 6543 | Connection pooler |
| `functions` | `supabase/edge-runtime:v1.74.0` | internal | Edge functions |
| `imgproxy` | `darthsim/imgproxy:v3.30.1` | internal | Image transformation |

**Removed:**
- `db-teachy-time` (postgres:16-alpine)
- `bytebase-teachy-time`

### Volumes

| Volume | Purpose |
|--------|---------|
| `db-data` | PostgreSQL data persistence |
| `storage-data` | Uploaded files persistence |
| `snippets` | Studio code snippets |
| `functions` | Edge function code |
| `deno-cache` | Deno cache for edge functions |

### Environment Variables

Generated secrets:
- `POSTGRES_PASSWORD` — 32-char random password
- `JWT_SECRET` — 32+ char random secret
- `ANON_KEY` — JWT with `anon` role
- `SERVICE_ROLE_KEY` — JWT with `service_role` role
- `SUPABASE_PUBLISHABLE_KEY` — opaque public key
- `SUPABASE_SECRET_KEY` — opaque secret key
- `PG_META_CRYPTO_KEY` — 32-char random key
- `VAULT_ENC_KEY` — 32-char random key
- `SECRET_KEY_BASE` — 32-char random key
- `POOLER_TENANT_ID` — UUID

Connection vars:
- `POSTGRES_HOST` — `db`
- `POSTGRES_PORT` — `5432`
- `POSTGRES_DB` — `postgres`

Studio defaults:
- `STUDIO_DEFAULT_ORGANIZATION` — `Teachy Time`
- `STUDIO_DEFAULT_PROJECT` — `teachy-time`

Gateway:
- `KONG_HTTP_PORT` — `8000`
- `KONG_HTTPS_PORT` — `8443`
- `SUPABASE_PUBLIC_URL` — `http://localhost:8000`

### Migration Workflow (Supabase CLI)

```
supabase/
├── migrations/
│   └── 20260612000000_*.sql
├── config.toml
└── seed.sql (optional)
```

**Commands:**
- `supabase init` — initialize local project (creates `supabase/` directory)
- `supabase start` — start local Supabase stack
- `supabase db reset` — reset local database and apply all migrations
- `supabase db diff -f migration_name` — generate migration from schema diff
- `supabase db push --db-url <prod-url>` — apply migrations to production

**Environment parity:**
- Local: `supabase db reset` applies all migrations to local stack
- Cloud: `supabase db push` applies migrations to production Supabase
- Same SQL files, same order, same schema

### Application Configuration

The Next.js app connects to local Supabase via:
- `NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000`
- `NEXT_PUBLIC_SUPABASE_KEY=<local ANON_KEY>`
- `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=<local SERVICE_ROLE_KEY>`

### VS Code Integration

Add a compound launch configuration:
1. **Pre-launch task:** `docker compose up -d` to start Supabase
2. **Debug configuration:** Next.js dev server with existing debug options

### README Updates

Update Getting Started to include:
- Docker and Supabase CLI as prerequisites
- `docker compose up` to start local Supabase
- `supabase init` and migration commands
- Updated `.env` instructions for local development

## Files Changed

| File | Change |
|------|--------|
| `docker-compose.yaml` | Replace Postgres+Bytebase with full Supabase stack |
| `.env` | Add all Supabase environment variables with generated secrets |
| `.env.example` | Template with placeholder values and comments |
| `.vscode/launch.json` | Add compound configuration with Docker pre-launch task |
| `README.md` | Update Getting Started with Supabase local setup |
| `supabase/config.toml` | New file — Supabase CLI configuration |
| `supabase/migrations/` | New directory — SQL migration files |

## Risks

- **Resource usage:** Full Supabase stack uses ~2-4GB RAM vs ~200MB for plain Postgres
- **Port conflicts:** Port 8000 and 3000 must be available locally
- **Migration sync:** Local schema must be kept in sync with production via Supabase CLI
