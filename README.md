# h2bc web store

Medusa v2 API (`api/`) and Next.js storefront (`front/`) in one repo.

## Develop

Open the repo in the devcontainer (VS Code: "Reopen in Container"). It provides node, pnpm, postgres and redis, and installs both apps.

```sh
cd api && pnpm dev      # http://localhost:9000  (admin: /app)
cd front && pnpm dev    # http://localhost:3000
```

Env files: copy `api/.env.template` → `api/.env` and `front/.env.example` → `front/.env.local`.

## Lighthouse

`pnpm lighthouse` scans every public page (cart, checkout and order pages are excluded) and fails when a page scores below the budgets in `unlighthouse.config.ts`. It must target a production build or the deployed host: `next dev` fails minification and source-map audits and inflates every timing, so its numbers are meaningless.

```sh
# local production build (backend on :9000 with a seeded catalog)
cd front && pnpm build && SITE_URL=http://localhost:3000 SEO_INDEXABLE=true pnpm start
pnpm lighthouse                                     # from the repo root, in another terminal

# deployed host
LIGHTHOUSE_SITE=https://dev.h2bcweb.com pnpm lighthouse
```

The static report is written to `.unlighthouse/`, which is gitignored.

## Deploy

Every push to `main` lints the storefront, builds and pushes both images, then triggers the deploy in `h2bc/web-store-deploy` once with both image refs.
