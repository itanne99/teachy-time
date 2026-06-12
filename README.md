<h1 align="center">
  <a href="https://github.com/itanne99/teachy-time">
    <!-- Logo removed as requested -->
  </a>
</h1>

<div align="center">
  Teachy Time
  <br />
  <a href="#about"><strong>Explore the project »</strong></a>
  <br />
  <br />
  <a href="https://github.com/itanne99/teachy-time/issues/new?assignees=&labels=bug&template=01_BUG_REPORT.md&title=bug%3A+">Report a Bug</a>
  ·
  <a href="https://github.com/itanne99/teachy-time/issues/new?assignees=&labels=enhancement&template=02_FEATURE_REQUEST.md&title=feat%3A+">Request a Feature</a>
  .
  <a href="https://github.com/itanne99/teachy-time/issues/new?assignees=&labels=question&template=04_SUPPORT_QUESTION.md&title=support%3A+">Ask a Question</a>
</div>

<div align="center">
<br />

[![Project license](https://img.shields.io/github/license/itanne99/teachy-time.svg?style=flat-square)](LICENSE)

[![Pull Requests welcome](https://img.shields.io/badge/PRs-welcome-ff69b4.svg?style=flat-square)](https://github.com/itanne99/teachy-time/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22)
[![code with love by itanne99](https://img.shields.io/badge/%3C%2F%3E%20with%20%E2%99%A5%20by-itanne99-ff1414.svg?style=flat-square)](https://github.com/itanne99)

</div>

<details open="open">
<summary>Table of Contents</summary>

- [About](#about)
  - [Built With](#built-with)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Roadmap](#roadmap)
- [Support](#support)
- [Project assistance](#project-assistance)
- [Contributing](#contributing)
- [Authors \& contributors](#authors--contributors)
- [Security](#security)
- [License](#license)

</details>

---

## About

> A stylish timer to help teachers keep track of their busy day.

### Built With

- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com/)
- [Bruno API](https://www.usebruno.com/)

## Getting Started

### Prerequisites

> - [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed
> - [Supabase CLI](https://supabase.com/docs/guides/local-development) installed (`npm install -g supabase` or via your package manager)
> - Node.js v18+ and yarn installed

### Local Supabase Setup

1. **Clone the repository and install dependencies:**

```bash
yarn install
```

2. **Configure environment variables:**

Copy `.env.example` to `.env` and update the values. The `.env` file contains all Supabase secrets and configuration.

```bash
cp .env.example .env
```

> **Important:** You must generate your own secrets before starting. Never use the default placeholder values in production.

3. **Start the Supabase stack:**

```bash
docker compose up -d
```

Wait for all services to become healthy (usually 1-2 minutes). Check status with:

```bash
docker compose ps
```

4. **Initialize Supabase CLI for migrations (first time only):**

```bash
supabase init
```

5. **Apply migrations to local database:**

```bash
supabase db push --db-url "postgresql://postgres.your-tenant-id:your-super-secret-and-long-postgres-password@localhost:5432/postgres"
```

6. **Access Supabase Studio:**

Open [http://localhost:8000](http://localhost:8000) in your browser. You will be prompted for credentials:
- Username: `supabase`
- Password: (value of `DASHBOARD_PASSWORD` from your `.env`)

### Running the Development Server

```bash
yarn run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Managing Migrations

| Command | Description |
|---------|-------------|
| `supabase migration new <name>` | Create a new empty migration file |
| `supabase db diff -f <name> --db-url "<local-url>"` | Generate migration from schema diff |
| `supabase db push --db-url "<local-url>"` | Apply migrations to local DB |
| `supabase db push --db-url "<prod-url>"` | Apply migrations to production |

### Stopping Supabase

```bash
docker compose down
```

### Resetting Everything (destroys all data)

```bash
docker compose down -v
rm -rf volumes/db/data volumes/storage
```

## Usage

> Teachy Time helps teachers manage their daily schedule by providing a visual countdown for active time segments and a list of upcoming alarms. Users can create, edit, and delete alarms, and copy schedules between different days of the week.

## Roadmap

See the [open issues](https://github.com/itanne99/teachy-time/issues) for a list of proposed features (and known issues).

- [Top Feature Requests](https://github.com/itanne99/teachy-time/issues?q=label%3Aenhancement+is%3Aopen+sort%3Areactions-%2B1-desc) (Add your votes using the 👍 reaction)
- [Top Bugs](https://github.com/itanne99/teachy-time/issues?q=is%3Aissue+is%3Aopen+label%3Abug+sort%3Areactions-%2B1-desc) (Add your votes using the 👍 reaction)
- [Newest Bugs](https://github.com/itanne99/teachy-time/issues?q=is%3Aopen+is%3Aissue+label%3Abug)

## Support

Reach out to the maintainer at one of the following places:

- [GitHub issues](https://github.com/itanne99/teachy-time/issues/new?assignees=&labels=question&template=04_SUPPORT_QUESTION.md&title=support%3A+)
- Contact options listed on [this GitHub profile](https://github.com/itanne99)

## Project assistance

If you want to say **thank you** or/and support active development of Teachy Time:

- Add a [GitHub Star](https://github.com/itanne99/teachy-time) to the project.

Together, we can make Teachy Time **better**!

## Contributing

First off, thanks for taking the time to contribute! Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make will benefit everybody else and are **greatly appreciated**.

Please read [our contribution guidelines](docs/CONTRIBUTING.md), and thank you for being involved!

## Authors & contributors

The original setup of this repository is by [Ido Tanne](https://github.com/itanne99).

For a full list of all authors and contributors, see [the contributors page](https://github.com/itanne99/teachy-time/contributors).

## Security

Teachy Time follows good practices of security, but 100% security cannot be assured.
Teachy Time is provided **"as is"** without any **warranty**. Use at your own risk.

_For more information and to report security issues, please refer to our [security documentation](docs/SECURITY.md)._

## License

This project is licensed under the **MIT license**.

See [LICENSE](LICENSE) for more information.
