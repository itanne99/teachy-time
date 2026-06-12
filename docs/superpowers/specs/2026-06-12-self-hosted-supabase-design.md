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
| `studio` | `supabase/studio:2026.06.03` | internal (via Kong :8000) | Supabase Studio (web UI) |
| `supavisor` | `supabase/supavisor:2.9.5` | 5432 (external), 6543 | Connection pooler |
| `functions` | `supabase/edge-runtime:v1.74.0` | internal | Edge functions |
| `imgproxy` | `darthsim/imgproxy:v3.30.1` | internal | Image transformation |

**Removed:**
- `db-teachy-time` (postgres:16-alpine)
- `bytebase-teachy-time`

### Volumes

Bind mounts (matching official Supabase setup):

| Mount | Purpose |
|-------|---------|
| `./volumes/db/data` | PostgreSQL data persistence |
| `./volumes/storage` | Uploaded files persistence |
| `./volumes/snippets` | Studio code snippets |
| `./volumes/functions` | Edge function code |
| `./volumes/api/kong.yml` | Kong gateway configuration |
| `./volumes/api/kong-entrypoint.sh` | Kong entrypoint script |
| `./volumes/pooler/pooler.exs` | Supavisor configuration |

Named volumes:

| Volume | Purpose |
|--------|---------|
| `db-config` | Postgres custom config (pgsodium key) |
| `deno-cache` | Deno cache for edge functions |

### Environment Variables

Generated secrets:
- `POSTGRES_PASSWORD` — 32-char random password (letters/numbers only to avoid URL encoding issues)
- `JWT_SECRET` — 32+ char random secret (legacy HS256)
- `ANON_KEY` — JWT with `anon` role (legacy HS256)
- `SERVICE_ROLE_KEY` — JWT with `service_role` role (legacy HS256)
- `SUPABASE_PUBLISHABLE_KEY` — opaque public key (new ES256)
- `SUPABASE_SECRET_KEY` — opaque secret key (new ES256, server-side only)
- `JWT_KEYS` — JSON array of signing JWKs (EC private + legacy symmetric)
- `JWT_JWKS` — JWKS for token verification (EC public + legacy symmetric)
- `ANON_KEY_ASYMMETRIC` — pre-signed ES256 JWT for anon role
- `SERVICE_ROLE_KEY_ASYMMETRIC` — pre-signed ES256 JWT for service_role
- `PG_META_CRYPTO_KEY` — 32+ char random key (generate: `openssl rand -base64 24`)
- `VAULT_ENC_KEY` — 32-char encryption key (generate: `openssl rand -hex 16`)
- `SECRET_KEY_BASE` — 64+ char random key (generate: `openssl rand -base64 48`)
- `POOLER_TENANT_ID` — unique tenant identifier (e.g., `your-tenant-id`)
- `S3_PROTOCOL_ACCESS_KEY_ID` — S3 protocol access key (generate: `openssl rand -hex 16`)
- `S3_PROTOCOL_ACCESS_KEY_SECRET` — S3 protocol secret key (generate: `openssl rand -hex 32`)

Studio access:
- `DASHBOARD_USERNAME` — `supabase` (default)
- `DASHBOARD_PASSWORD` — secure password with at least one letter

Connection vars:
- `POSTGRES_HOST` — `db`
- `POSTGRES_PORT` — `5432`
- `POSTGRES_DB` — `postgres`

URLs:
- `SUPABASE_PUBLIC_URL` — `http://localhost:8000`
- `API_EXTERNAL_URL` — `http://localhost:8000`
- `SITE_URL` — `http://localhost:3000`

Studio defaults:
- `STUDIO_DEFAULT_ORGANIZATION` — `Teachy Time`
- `STUDIO_DEFAULT_PROJECT` — `teachy-time`

Gateway:
- `KONG_HTTP_PORT` — `8000`
- `KONG_HTTPS_PORT` — `8443`

Pooler:
- `POOLER_PROXY_PORT_TRANSACTION` — `6543`
- `POOLER_DEFAULT_POOL_SIZE` — `20`
- `POOLER_MAX_CLIENT_CONN` — `100`
- `POOLER_DB_POOL_SIZE` — `5`

API:
- `PGRST_DB_SCHEMAS` — `public,storage,graphql_public`
- `PGRST_DB_MAX_ROWS` — `1000`
- `PGRST_DB_EXTRA_SEARCH_PATH` — `public`
- `FUNCTIONS_VERIFY_JWT` — `false` (local dev)

Storage:
- `GLOBAL_S3_BUCKET` — `stub` (file backend)
- `REGION` — `stub`
- `STORAGE_TENANT_ID` — `stub`
- `IMGPROXY_AUTO_WEBP` — `true`

### Migration Workflow (Supabase CLI)

The project uses the **self-hosted Docker Compose** stack (not `supabase start`). Migrations are managed via Supabase CLI but applied to the self-hosted database.

```
supabase/
├── migrations/
│   └── 20260612000000_*.sql
├── config.toml
└── seed.sql (optional)
```

**Commands:**
- `supabase init` — initialize local project (creates `supabase/` directory with `config.toml` and `migrations/`)
- `docker compose up -d` — start the self-hosted Supabase stack
- `supabase db push --db-url "postgresql://postgres.[POOLER_TENANT_ID]:[POSTGRES_PASSWORD]@localhost:5432/postgres"` — apply migrations to local self-hosted DB
- `supabase db diff -f migration_name --db-url "postgresql://postgres.[POOLER_TENANT_ID]:[POSTGRES_PASSWORD]@localhost:5432/postgres"` — generate migration from schema diff
- `supabase db push --db-url <prod-url>` — apply migrations to production Supabase
- `supabase migration new migration_name` — create an empty migration file

**Important:** `supabase db reset` only works with CLI-managed stacks (`supabase start`). For self-hosted, use `supabase db push --db-url` to apply migrations.

**Environment parity:**
- Local: `supabase db push --db-url` applies all migrations to self-hosted DB via Supavisor
- Cloud: `supabase db push --db-url <prod-url>` applies migrations to production Supabase
- Same SQL files, same order, same schema

### Application Configuration

The Next.js app connects to local Supabase via:
- `NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000`
- `NEXT_PUBLIC_SUPABASE_KEY=<local ANON_KEY or SUPABASE_PUBLISHABLE_KEY>`
- `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=<local SERVICE_ROLE_KEY or SUPABASE_SECRET_KEY>`

Supabase Studio (Dashboard) is accessed through Kong at `http://localhost:8000` (HTTP basic auth with `DASHBOARD_USERNAME`/`DASHBOARD_PASSWORD`).

### VS Code Integration

Add a compound launch configuration:
1. **Pre-launch task:** `docker compose up -d` to start Supabase
2. **Debug configuration:** Next.js dev server with existing debug options

### README Updates

Update Getting Started to include:
- Docker and Supabase CLI as prerequisites
- `docker compose up` to start local Supabase
- `supabase init` and migration commands (`supabase db push --db-url`)
- Updated `.env` instructions for local development
- Accessing Studio at `http://localhost:8000` (HTTP basic auth)

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

- **Resource usage:** Full Supabase stack requires 4GB RAM minimum, 8GB+ recommended (vs ~200MB for plain Postgres)
- **Port conflicts:** Ports 8000 (Kong), 5432 (Supavisor), 6543 (transaction pooler), and 8443 (Kong HTTPS) must be available locally
- **Migration sync:** Local schema must be kept in sync with production via Supabase CLI (`supabase db push --db-url`)
- **Bind mount permissions:** On macOS, Docker Desktop bind mounts have known xattr/permission issues with Storage; may need named volumes instead
- **CRLF line endings:** Kong entrypoint script must use LF line endings; CRLF causes startup failures
