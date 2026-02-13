import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
	email: text("email").unique().notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	image: text("image"),
	isBot: boolean("is_bot").default(false).notNull(),
	name: text("name").notNull(),
	updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
	accessToken: text("access_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: "date" }),
	accountId: text("account_id").notNull(),
	createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	idToken: text("id_token"),
	password: text("password"),
	providerId: text("provider_id").notNull(),
	refreshToken: text("refresh_token"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
		mode: "date",
	}),
	scope: text("scope"),
	updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
});

export const sessions = pgTable("sessions", {
	createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
	expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	ipAddress: text("ip_address"),
	token: text("token").unique().notNull(),
	updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
});

export const verifications = pgTable("verifications", {
	createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
	expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
	id: text("id")
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	identifier: text("identifier").notNull(),
	updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
	value: text("value").notNull(),
});
