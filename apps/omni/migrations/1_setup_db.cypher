CREATE CONSTRAINT movieId FOR (m:Movie) REQUIRE m.id IS UNIQUE;