# Miru

A social movie-watching platform. Follow friends, build watchlists, and find movies to watch together.

## Stack

- **Web**: Next.js 16 (App Router), React 19, Tailwind CSS v4
- **API**: tRPC v11
- **Database**: Drizzle ORM + Neon Postgres
- **Auth**: Better Auth
- **UI**: shadcn/ui

## Monorepo Structure

```
apps/
  web/              # Next.js web app
packages/
  db/               # Drizzle schema + Postgres client
  trpc/             # tRPC routers (shared API)
  typescript-config/ # Shared tsconfig
```

## Development

```bash
pnpm install
docker compose up -d
cp apps/web/.env.example apps/web/.env
cp packages/db/.env.example packages/db/.env
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Web app runs at http://localhost:3000

## Local database

- Local development is configured for Postgres at `postgresql://postgres:postgres@localhost:5433/miru_dev`.
- Start/stop the local DB with `docker compose up -d` and `docker compose down`.
- Keep production credentials out of local env files.
- Migrations are now the source of truth for schema changes (use `pnpm db:generate` then `pnpm db:migrate`).
- Seed minimal catalog data from TMDB with `pnpm db:seed`.

### Existing databases

If an environment already has the schema (created previously via `db:push`), baseline it before using `db:migrate` so Drizzle does not try to recreate existing tables:

```sql
CREATE SCHEMA IF NOT EXISTS drizzle;
CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
  id serial PRIMARY KEY,
  hash text NOT NULL,
  created_at bigint
);
INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
VALUES ('b83b8a61cb69b5ad000b4d236a1ecce1b5267f5d2836f34e5afdc62c54684f81', 1771093819555);
```

Run the insert only once per database.

## Scripts

```bash
pnpm dev          # Start dev server
pnpm build        # Build all packages
pnpm lint         # Run oxlint
pnpm format       # Run oxfmt
pnpm typecheck    # Type-check all packages
pnpm db:generate  # Generate Drizzle migrations
pnpm db:migrate   # Apply Drizzle migrations
pnpm db:seed      # Seed minimal TMDB genres/providers/movies
```
