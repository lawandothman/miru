CREATE TABLE IF NOT EXISTS "accounts" (
	"access_token" text,
	"access_token_expires_at" timestamp,
	"account_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"id_token" text,
	"password" text,
	"provider_id" text NOT NULL,
	"refresh_token" text,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"ip_address" text,
	"token" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"country" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"image" text,
	"name" text NOT NULL,
	"onboarding_completed_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "verifications" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"value" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "genres" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "movie_buy_providers" (
	"movie_id" integer NOT NULL,
	"provider_id" integer NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "movie_buy_providers_movie_id_provider_id_pk" PRIMARY KEY("movie_id","provider_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "movie_genres" (
	"genre_id" integer NOT NULL,
	"movie_id" integer NOT NULL,
	CONSTRAINT "movie_genres_movie_id_genre_id_pk" PRIMARY KEY("movie_id","genre_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "movie_rent_providers" (
	"movie_id" integer NOT NULL,
	"provider_id" integer NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "movie_rent_providers_movie_id_provider_id_pk" PRIMARY KEY("movie_id","provider_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "movie_stream_providers" (
	"movie_id" integer NOT NULL,
	"provider_id" integer NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "movie_stream_providers_movie_id_provider_id_pk" PRIMARY KEY("movie_id","provider_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "movies" (
	"adult" boolean DEFAULT false,
	"backdrop_path" text,
	"budget" bigint,
	"homepage" text,
	"id" integer PRIMARY KEY NOT NULL,
	"imdb_id" text,
	"original_title" text,
	"overview" text,
	"popularity" real,
	"poster_path" text,
	"release_date" text,
	"revenue" bigint,
	"runtime" integer,
	"tagline" text,
	"title" text NOT NULL,
	"tmdb_vote_average" real,
	"tmdb_vote_count" integer,
	"trailer_key" text,
	"trailer_site" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "watch_providers" (
	"display_priority" integer,
	"id" integer PRIMARY KEY NOT NULL,
	"logo_path" text,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "follows" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"follower_id" text NOT NULL,
	"following_id" text NOT NULL,
	CONSTRAINT "follows_follower_id_following_id_pk" PRIMARY KEY("follower_id","following_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "watched_entries" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"movie_id" integer NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "watched_entries_user_id_movie_id_pk" PRIMARY KEY("user_id","movie_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "watchlist_entries" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"movie_id" integer NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "watchlist_entries_user_id_movie_id_pk" PRIMARY KEY("user_id","movie_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_genre_preferences" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"genre_id" integer NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "user_genre_preferences_user_id_genre_id_pk" PRIMARY KEY("user_id","genre_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_streaming_services" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"provider_id" integer NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "user_streaming_services_user_id_provider_id_pk" PRIMARY KEY("user_id","provider_id")
);
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "movie_buy_providers" ADD CONSTRAINT "movie_buy_providers_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "movie_buy_providers" ADD CONSTRAINT "movie_buy_providers_provider_id_watch_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."watch_providers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "movie_genres" ADD CONSTRAINT "movie_genres_genre_id_genres_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."genres"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "movie_genres" ADD CONSTRAINT "movie_genres_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "movie_rent_providers" ADD CONSTRAINT "movie_rent_providers_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "movie_rent_providers" ADD CONSTRAINT "movie_rent_providers_provider_id_watch_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."watch_providers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "movie_stream_providers" ADD CONSTRAINT "movie_stream_providers_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "movie_stream_providers" ADD CONSTRAINT "movie_stream_providers_provider_id_watch_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."watch_providers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "follows" ADD CONSTRAINT "follows_following_id_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "watched_entries" ADD CONSTRAINT "watched_entries_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "watched_entries" ADD CONSTRAINT "watched_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "watchlist_entries" ADD CONSTRAINT "watchlist_entries_movie_id_movies_id_fk" FOREIGN KEY ("movie_id") REFERENCES "public"."movies"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "watchlist_entries" ADD CONSTRAINT "watchlist_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "user_genre_preferences" ADD CONSTRAINT "user_genre_preferences_genre_id_genres_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."genres"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "user_genre_preferences" ADD CONSTRAINT "user_genre_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "user_streaming_services" ADD CONSTRAINT "user_streaming_services_provider_id_watch_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."watch_providers"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
ALTER TABLE "user_streaming_services" ADD CONSTRAINT "user_streaming_services_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "movie_genres_genre_idx" ON "movie_genres" USING btree ("genre_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "movies_title_idx" ON "movies" USING btree ("title");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "follows_follower_idx" ON "follows" USING btree ("follower_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "follows_following_idx" ON "follows" USING btree ("following_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "watched_user_idx" ON "watched_entries" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "watched_movie_idx" ON "watched_entries" USING btree ("movie_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "watchlist_user_idx" ON "watchlist_entries" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "watchlist_movie_idx" ON "watchlist_entries" USING btree ("movie_id");
