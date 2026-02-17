CREATE INDEX "movies_vote_idx" ON "movies" USING btree ("tmdb_vote_count","tmdb_vote_average");--> statement-breakpoint
CREATE INDEX "movies_release_idx" ON "movies" USING btree ("release_date");