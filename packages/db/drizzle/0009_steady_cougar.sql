INSERT INTO "watch_providers" ("id", "name", "logo_path", "display_priority")
VALUES
	(8, 'Netflix', '/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg', 4),
	(9, 'Amazon Prime Video', '/pvske1MyAoymrs5bguRfVqYiM9a.jpg', 5),
	(41, 'ITVX', '/1LuvKw01c2KQCt6DqgAgR06H2pT.jpg', 20),
	(103, 'Channel 4', '/uMWCgjsGnO5IoQtqxXOjnQA5gt9.jpg', 15),
	(386, 'Peacock Premium', '/2aGrp1xw3qhwCYvNGAJZPdjfeeX.jpg', 17),
	(531, 'Paramount Plus', '/h5DcR0J2EESLitnhR8xLG1QymTE.jpg', 6)
ON CONFLICT ("id") DO UPDATE
SET
	"name" = EXCLUDED."name",
	"logo_path" = EXCLUDED."logo_path",
	"display_priority" = EXCLUDED."display_priority";--> statement-breakpoint
WITH "alias_map" ("alias_id", "canonical_id") AS (
	VALUES
		(387, 386),
		(1796, 8),
		(2100, 9),
		(2300, 41),
		(2303, 531),
		(2304, 531),
		(2311, 103)
), "remapped" AS (
	SELECT
		"movie_stream_providers"."movie_id",
		"alias_map"."canonical_id" AS "provider_id",
		"movie_stream_providers"."updated_at"
	FROM "movie_stream_providers"
	INNER JOIN "alias_map"
		ON "alias_map"."alias_id" = "movie_stream_providers"."provider_id"
)
INSERT INTO "movie_stream_providers" ("movie_id", "provider_id", "updated_at")
SELECT DISTINCT ON ("movie_id", "provider_id")
	"movie_id",
	"provider_id",
	"updated_at"
FROM "remapped"
ORDER BY "movie_id", "provider_id", "updated_at" DESC
ON CONFLICT ("movie_id", "provider_id") DO NOTHING;--> statement-breakpoint
DELETE FROM "movie_stream_providers"
WHERE "provider_id" IN (387, 1796, 2100, 2300, 2303, 2304, 2311);--> statement-breakpoint
WITH "alias_map" ("alias_id", "canonical_id") AS (
	VALUES
		(387, 386),
		(1796, 8),
		(2100, 9),
		(2300, 41),
		(2303, 531),
		(2304, 531),
		(2311, 103)
), "remapped" AS (
	SELECT
		"user_streaming_services"."user_id",
		"alias_map"."canonical_id" AS "provider_id",
		"user_streaming_services"."created_at"
	FROM "user_streaming_services"
	INNER JOIN "alias_map"
		ON "alias_map"."alias_id" = "user_streaming_services"."provider_id"
)
INSERT INTO "user_streaming_services" ("user_id", "provider_id", "created_at")
SELECT DISTINCT ON ("user_id", "provider_id")
	"user_id",
	"provider_id",
	"created_at"
FROM "remapped"
ORDER BY "user_id", "provider_id", "created_at" DESC
ON CONFLICT ("user_id", "provider_id") DO NOTHING;--> statement-breakpoint
DELETE FROM "user_streaming_services"
WHERE "provider_id" IN (387, 1796, 2100, 2300, 2303, 2304, 2311);--> statement-breakpoint
DELETE FROM "watch_providers"
WHERE "id" IN (387, 1796, 2100, 2300, 2303, 2304, 2311);
