DELETE FROM "user_streaming_services"
WHERE NOT EXISTS (
	SELECT 1
	FROM "movie_stream_providers"
	WHERE "movie_stream_providers"."provider_id" = "user_streaming_services"."provider_id"
);--> statement-breakpoint
DELETE FROM "watch_providers"
WHERE NOT EXISTS (
	SELECT 1
	FROM "movie_stream_providers"
	WHERE "movie_stream_providers"."provider_id" = "watch_providers"."id"
);
