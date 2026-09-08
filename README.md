# h2bc web store

Medusa v2 API (`api/`) and Next.js storefront (`front/`) in one repo.

## Develop

Open the repo in the devcontainer (VS Code: "Reopen in Container"). It provides node, pnpm, postgres and redis, and installs both apps.

```sh
cd api && pnpm dev      # http://localhost:9000  (admin: /app)
cd front && pnpm dev    # http://localhost:3000
```

Env files: copy `api/.env.template` → `api/.env` and `front/.env.example` → `front/.env.local`.

## Deploy

Every push to `main` lints the storefront, builds and pushes both images, then triggers the deploy in `h2bc/web-store-deploy` once with both image refs.
