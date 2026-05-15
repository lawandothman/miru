CREATE TABLE "movie_recommendations" (
	"id" text PRIMARY KEY NOT NULL,
	"sender_id" text NOT NULL,
	"recipient_id" text NOT NULL,
	"movie_id" integer NOT NULL,
	"message" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"responded_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "movie_recommendations" ADD CONSTRAINT "movie_recommendations_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_recommendations" ADD CONSTRAINT "movie_recommendations_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movie_recommendations" ADD CONSTRAINT "movie_recommendations_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "movie_recommendations_recipient_inbox_idx" ON "movie_recommendations" USING btree ("recipient_id","status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "movie_recommendations_pending_unique_idx" ON "movie_recommendations" USING btree ("sender_id","recipient_id","movie_id") WHERE "movie_recommendations"."status" = 'pending';--> statement-breakpoint
CREATE INDEX "movie_recommendations_movie_idx" ON "movie_recommendations" USING btree ("movie_id");--> statement-breakpoint
CREATE INDEX "movie_recommendations_sender_idx" ON "movie_recommendations" USING btree ("sender_id");