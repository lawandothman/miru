![ミル Miru](/apps/frontend/public/og-image.png)

#  Miru

This is a monorepo managed by [Turborepo](https://github.com/vercel/turbo)

## What's Inside?
This Turborepo includes the following packages/apps:
* `frontend`: a [Next.js](https://github.com/vercel/next.js) app
* `omni`: a GraphQL API

## Run locally

* Install Dependencies.
```bash
yarn install
```

* Create a `.env` in the root of the project following the `.env.example` template.

* Start the local development database
```bash
docker compose up -d
```

* Run the development server
```bash
yarn dev
```

* Frontend app at http://localhost:3000
* Omni API at http://localhost:4000
