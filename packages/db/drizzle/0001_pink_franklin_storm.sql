CREATE INDEX "accounts_user_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "movie_buy_providers_provider_idx" ON "movie_buy_providers" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "movie_rent_providers_provider_idx" ON "movie_rent_providers" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "movie_stream_providers_provider_idx" ON "movie_stream_providers" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "user_genre_preferences_genre_idx" ON "user_genre_preferences" USING btree ("genre_id");