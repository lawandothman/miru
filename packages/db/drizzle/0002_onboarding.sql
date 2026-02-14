ALTER TABLE "users" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "onboarding_completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "is_bot";--> statement-breakpoint
CREATE TABLE "user_genre_preferences" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"genre_id" integer NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "user_genre_preferences_user_id_genre_id_pk" PRIMARY KEY("user_id","genre_id")
);
--> statement-breakpoint
CREATE TABLE "user_streaming_services" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"provider_id" integer NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "user_streaming_services_user_id_provider_id_pk" PRIMARY KEY("user_id","provider_id")
);
--> statement-breakpoint
ALTER TABLE "user_genre_preferences" ADD CONSTRAINT "user_genre_preferences_genre_id_genres_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."genres"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_genre_preferences" ADD CONSTRAINT "user_genre_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_streaming_services" ADD CONSTRAINT "user_streaming_services_provider_id_watch_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."watch_providers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_streaming_services" ADD CONSTRAINT "user_streaming_services_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
