<p align="center">
  <img src="public/bw-logo.svg" alt="h2bc logo" width="120" />
</p>

<h1 align="center">
  h2bc web storefront
</h1>

<p align="center">
  E-commerce storefront built with Next.js 15 and Medusa.js
</p>

<p align="center">
  <a href="https://instagram.com/_h2bc">
    <img src="https://img.shields.io/badge/@_h2bc-555555?style=flat&logo=instagram&logoColor=white" alt="Instagram" />
  </a>
  <a href="https://youtube.com/@_h2bc">
    <img src="https://img.shields.io/badge/@_h2bc-555555?style=flat&logo=youtube&logoColor=white" alt="YouTube" />
  </a>
</p>

---

### Prerequisites

To use this storefront, you need a Medusa server running locally on port 9000.
For a quick setup, run:

```shell
npx create-medusa-app@latest
```

Check out [create-medusa-app docs](https://docs.medusajs.com/learn/installation) for more details.

---

# Overview

Built with:

- [Next.js 15](https://nextjs.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Medusa.js](https://medusajs.com/)
- [shadcn/ui](https://ui.shadcn.com/)

Features:

- Product catalog with filtering
- Product detail pages
- Multi-region/currency support
- Contact form with validation
- Next.js 15 features:
  - App Router
  - Server Components
  - Server Actions
  - Turbopack

---

# Quickstart

### Setting up environment variables

Navigate into the project directory and copy the example:

```shell
cd h2bc-web-front/
cp .env.example .env.local
```

Edit `.env.local` with your Medusa backend configuration.

### Install dependencies

```shell
npm install
```

### Start developing

```shell
npm run dev
```

Your site is now running at http://localhost:3000

### Build for production

```shell
npm run build
npm start
```

### Run with Docker

Build the production image:

```shell
docker build -t h2bc-web-front .
```

Start the container (pass your environment file or individual variables):

```shell
docker run --rm -p 3000:3000 --env-file .env.local h2bc-web-front
```

The app will be available at http://localhost:3000.

---

# Resources

## Medusa

- [Website](https://www.medusajs.com/)
- [GitHub](https://github.com/medusajs)
- [Documentation](https://docs.medusajs.com/)

## Next.js

- [Website](https://nextjs.org/)
- [GitHub](https://github.com/vercel/next.js)
- [Documentation](https://nextjs.org/docs)

## shadcn/ui

- [Website](https://ui.shadcn.com/)
- [Documentation](https://ui.shadcn.com/docs)

---

# License

This project is licensed under a custom **All Rights Reserved** license.  
See the [LICENSE](./LICENSE) file for details.
