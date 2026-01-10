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

> To run this project, you will need to set up a Supabase project and configure your environment variables. Create a `.env.local` file in the root of your project with the following:
>
> ```
> NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
> NEXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
> NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
> ```
>
> Ensure you have Node.js (v18 or higher recommended) and npm/yarn/pnpm/bun installed.

### Installation

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

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
