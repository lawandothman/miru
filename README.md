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
pnpm dev
```

Web app runs at http://localhost:3000

## Scripts

```bash
pnpm dev          # Start dev server
pnpm build        # Build all packages
pnpm lint         # Run oxlint
pnpm format       # Run oxfmt
pnpm typecheck    # Type-check all packages
pnpm db:generate  # Generate Drizzle migrations
pnpm db:push      # Push schema to database
```
