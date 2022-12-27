# Omni API

## Helper neo4j scripts

Drop all constraints and migrations
```cql
DROP CONSTRAINT migrationId;
DROP CONSTRAINT movieId;
MATCH (m:Migration) DELETE m;
```

WIPE DB (Keeps migrations)
```cql
MATCH (n) 
WHERE not n:Migration
DETACH DELETE n
```

## Seed db for testing

Will create a few users with a fixed watchlist (Watchlist is most likely skewed to top movies)

```bash
# cd apps/omni
yarn script:seed
```