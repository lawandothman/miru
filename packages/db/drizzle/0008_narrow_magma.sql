ALTER TABLE "movies" ADD COLUMN "watchlist_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
UPDATE "movies" AS "movies"
SET "watchlist_count" = "counts"."cnt"
FROM (
	SELECT "movie_id", count(*)::integer AS "cnt"
	FROM "watchlist_entries"
	GROUP BY "movie_id"
) AS "counts"
WHERE "movies"."id" = "counts"."movie_id";--> statement-breakpoint
CREATE OR REPLACE FUNCTION update_movie_watchlist_count() RETURNS trigger AS $$
BEGIN
	IF TG_OP = 'INSERT' THEN
		UPDATE "movies"
		SET "watchlist_count" = "watchlist_count" + 1
		WHERE "id" = NEW."movie_id";
		RETURN NEW;
	ELSIF TG_OP = 'DELETE' THEN
		UPDATE "movies"
		SET "watchlist_count" = GREATEST("watchlist_count" - 1, 0)
		WHERE "id" = OLD."movie_id";
		RETURN OLD;
	END IF;

	RETURN NULL;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER watchlist_entries_insert_movie_count
AFTER INSERT ON "watchlist_entries"
FOR EACH ROW
EXECUTE FUNCTION update_movie_watchlist_count();--> statement-breakpoint
CREATE TRIGGER watchlist_entries_delete_movie_count
AFTER DELETE ON "watchlist_entries"
FOR EACH ROW
EXECUTE FUNCTION update_movie_watchlist_count();--> statement-breakpoint
CREATE INDEX "movies_watchlist_count_idx" ON "movies" USING btree ("watchlist_count") WHERE "movies"."adult" = false and "movies"."watchlist_count" > 0;--> statement-breakpoint
CREATE INDEX "movies_discover_popularity_idx" ON "movies" USING btree ("popularity") WHERE "movies"."adult" = false and "movies"."poster_path" is not null;--> statement-breakpoint
CREATE INDEX "movies_discover_release_idx" ON "movies" USING btree ("release_date","popularity") WHERE "movies"."adult" = false and "movies"."poster_path" is not null;
