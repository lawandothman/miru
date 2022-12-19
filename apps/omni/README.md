# Omni api



## Helper neo4j scripts

Drop all constraints and migrations 
```cql
DROP CONSTRAINT migrationId;
DROP CONSTRAINT movieId;
MATCH (m:Migration) DELETE m;
```