import { randomUUID } from "node:crypto";
import postgres from "postgres";

const FAKE_USERS = [
	{
		name: "Emma Chen",
		email: "emma.chen@demo.miru.app",
		avatar: "adventurer",
	},
	{
		name: "Marcus Rivera",
		email: "marcus.rivera@demo.miru.app",
		avatar: "adventurer-neutral",
	},
	{
		name: "Sofia Andersson",
		email: "sofia.andersson@demo.miru.app",
		avatar: "avataaars",
	},
	{
		name: "James Okafor",
		email: "james.okafor@demo.miru.app",
		avatar: "bottts",
	},
	{
		name: "Lily Tanaka",
		email: "lily.tanaka@demo.miru.app",
		avatar: "lorelei",
	},
	{
		name: "Noah Dupont",
		email: "noah.dupont@demo.miru.app",
		avatar: "notionists",
	},
];

// Curated list of recognizable movies (TMDB IDs) — ordered by what looks
// best in a watchlist grid. The script falls back to popularity order for
// any IDs not found in the DB.
const CURATED_WATCHLIST_IDS = [
	1159559, // Scream 7
	1084242, // Zootopia 2
	83533, // Avatar: Fire and Ash
	1272837, // 28 Years Later: The Bone Temple
	1311031, // Demon Slayer: Infinity Castle
	1297842, // GOAT
	1316092, // Wuthering Heights
	1242898, // Predator: Badlands
	1084244, // Toy Story 5
	1368166, // The Housemaid
	840464, // Greenland 2: Migration
	1171145, // Crime 101
	1198984, // Send Help
	157336, // Interstellar
	991494, // SpongeBob Movie: Search for SquarePants
	425274, // Now You See Me: Now You Don't
	1234731, // Anaconda
	1119449, // Good Luck, Have Fun, Don't Die
];

const CURATED_WATCHED_IDS = [
	19995, // Avatar
	24428, // The Avengers
	755898, // War of the Worlds
	858024, // Hamnet
	1253000, // Deathstalker
	434853, // Space/Time
	1168190, // The Wrecking Crew
	680493, // Return to Silent Hill
	1199193, // Pose
	1310568, // Murder at the Embassy
];

async function main() {
	const [, , userId] = process.argv;
	if (!userId) {
		throw new Error(
			"Usage: node scripts/seed-screenshots.mjs <USER_ID>\n" +
				'Get user ID: docker exec miru-postgres psql -U postgres -d miru_dev -c "SELECT id, name FROM users;"',
		);
	}

	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		throw new Error("Missing DATABASE_URL. Set it in packages/db/.env.");
	}

	const sql = postgres(databaseUrl, { max: 1 });

	try {
		// Verify the real user exists
		const [realUser] =
			await sql`select id, name from users where id = ${userId}`;
		if (!realUser) {
			throw new Error(
				`User "${userId}" not found. Run the app and sign in first.`,
			);
		}
		writeOut(`Seeding screenshot data for user "${realUser.name}"...\n`);

		// Fetch all movies from DB
		const allMovies =
			await sql`select id, title from movies order by popularity desc nulls last`;
		const movieById = new Map(allMovies.map((m) => [m.id, m]));

		// Resolve curated lists — keep only movies that exist in the DB
		const watchlistMovies = CURATED_WATCHLIST_IDS.filter((id) =>
			movieById.has(id),
		).map((id) => movieById.get(id));
		const watchedMovies = CURATED_WATCHED_IDS.filter((id) =>
			movieById.has(id),
		).map((id) => movieById.get(id));

		// Fill remaining slots from popularity if curated list is short
		const usedIds = new Set([...CURATED_WATCHLIST_IDS, ...CURATED_WATCHED_IDS]);
		const fallbackMovies = allMovies.filter((m) => !usedIds.has(m.id));
		while (watchlistMovies.length < 18 && fallbackMovies.length > 0) {
			watchlistMovies.push(fallbackMovies.shift());
		}
		while (watchedMovies.length < 10 && fallbackMovies.length > 0) {
			watchedMovies.push(fallbackMovies.shift());
		}

		if (watchlistMovies.length + watchedMovies.length < 20) {
			throw new Error(
				`Need at least 20 movies in the DB but found ${allMovies.length}. Run "pnpm db:seed" first.`,
			);
		}

		// Clear old screenshot data for the real user (idempotent re-runs)
		await sql`delete from watchlist_entries where user_id = ${userId}`;
		await sql`delete from watched_entries where user_id = ${userId}`;

		// Mark real user as onboarded
		await sql`
			update users
			set onboarding_completed_at = now()
			where id = ${userId} and onboarding_completed_at is null
		`;

		// Create fake users
		const fakeUserRows = FAKE_USERS.map((u) => ({
			id: randomUUID(),
			name: u.name,
			email: u.email,
			email_verified: true,
			image: `https://api.dicebear.com/9.x/${u.avatar}/png?seed=${encodeURIComponent(u.name)}&size=256`,
			onboarding_completed_at: new Date(),
			created_at: new Date(),
			updated_at: new Date(),
		}));

		await sql`
			insert into users ${sql(
				fakeUserRows,
				"id",
				"name",
				"email",
				"email_verified",
				"image",
				"onboarding_completed_at",
				"created_at",
				"updated_at",
			)}
			on conflict (email) do update set
				name = excluded.name,
				image = excluded.image,
				onboarding_completed_at = excluded.onboarding_completed_at,
				updated_at = excluded.updated_at
		`;

		// Re-fetch fake user IDs (in case they already existed from a previous run)
		const fakeEmails = FAKE_USERS.map((u) => u.email);
		const fakeUsers =
			await sql`select id, name, email from users where email = any(${fakeEmails})`;
		const fakeUserIds = fakeUsers.map((u) => u.id);

		writeOut(`  Created/updated ${fakeUsers.length} fake users\n`);

		// Bidirectional follows between real user and all fake users
		const followRows = fakeUserIds.flatMap((fakeId) => [
			{ follower_id: userId, following_id: fakeId, created_at: new Date() },
			{ follower_id: fakeId, following_id: userId, created_at: new Date() },
		]);

		await sql`
			insert into follows ${sql(followRows, "follower_id", "following_id", "created_at")}
			on conflict do nothing
		`;
		writeOut(`  Created ${followRows.length} follow relationships\n`);

		// Real user's watchlist: 18 movies (6 full rows in 3-column grid)
		const realWatchlistMovies = watchlistMovies;
		const realWatchlistRows = realWatchlistMovies.map((m, i) => ({
			user_id: userId,
			movie_id: m.id,
			created_at: new Date(Date.now() - i * 3600000), // stagger timestamps
		}));

		await sql`
			insert into watchlist_entries ${sql(realWatchlistRows, "user_id", "movie_id", "created_at")}
			on conflict do nothing
		`;
		writeOut(
			`  Added ${realWatchlistRows.length} movies to real user's watchlist\n`,
		);

		// Real user's watched: 10 movies
		const realWatchedMovies = watchedMovies;
		const realWatchedRows = realWatchedMovies.map((m, i) => ({
			user_id: userId,
			movie_id: m.id,
			created_at: new Date(Date.now() - i * 86400000), // stagger by day
		}));

		await sql`
			insert into watched_entries ${sql(realWatchedRows, "user_id", "movie_id", "created_at")}
			on conflict do nothing
		`;
		writeOut(
			`  Added ${realWatchedRows.length} movies to real user's watched\n`,
		);

		// Clear old fake user watchlist/watched data too
		for (const fakeId of fakeUserIds) {
			await sql`delete from watchlist_entries where user_id = ${fakeId}`;
			await sql`delete from watched_entries where user_id = ${fakeId}`;
		}

		// Fake users' watchlists — each shares 4-5 movies with real user's watchlist
		// plus a few unique ones for variety
		let totalFakeWatchlist = 0;
		let totalFakeWatched = 0;

		// Remaining movies for unique picks per fake user
		const remainingMovies = allMovies.filter(
			(m) =>
				!realWatchlistMovies.some((w) => w.id === m.id) &&
				!realWatchedMovies.some((w) => w.id === m.id),
		);

		for (let i = 0; i < fakeUserIds.length; i += 1) {
			const fakeId = fakeUserIds[i];

			// Pick 4-5 overlapping movies from the real user's watchlist
			const overlapCount = 4 + (i % 2);
			const overlapStart = (i * 3) % realWatchlistMovies.length;
			const overlapMovies = [];
			for (let j = 0; j < overlapCount; j += 1) {
				overlapMovies.push(
					realWatchlistMovies[(overlapStart + j) % realWatchlistMovies.length],
				);
			}

			// Add 3-4 unique movies
			const uniqueStart = i * 3;
			const uniqueMovies = remainingMovies.slice(
				uniqueStart,
				Math.min(uniqueStart + 3 + (i % 2), remainingMovies.length),
			);

			const fakeWatchlistMovies = [...overlapMovies, ...uniqueMovies];
			const fakeWatchlistRows = fakeWatchlistMovies.map((m, j) => ({
				user_id: fakeId,
				movie_id: m.id,
				created_at: new Date(Date.now() - j * 7200000),
			}));

			if (fakeWatchlistRows.length > 0) {
				await sql`
					insert into watchlist_entries ${sql(fakeWatchlistRows, "user_id", "movie_id", "created_at")}
					on conflict do nothing
				`;
				totalFakeWatchlist += fakeWatchlistRows.length;
			}

			// Give each fake user 3-5 watched movies
			const watchedStart = (i * 2) % remainingMovies.length;
			const watchedCount = 3 + (i % 3);
			const fakeWatchedMovies = remainingMovies.slice(
				watchedStart,
				watchedStart + watchedCount,
			);
			const fakeWatchedRows = fakeWatchedMovies.map((m, j) => ({
				user_id: fakeId,
				movie_id: m.id,
				created_at: new Date(Date.now() - j * 172800000),
			}));

			if (fakeWatchedRows.length > 0) {
				await sql`
					insert into watched_entries ${sql(fakeWatchedRows, "user_id", "movie_id", "created_at")}
					on conflict do nothing
				`;
				totalFakeWatched += fakeWatchedRows.length;
			}
		}

		writeOut(
			`  Added ${totalFakeWatchlist} watchlist entries for fake users\n`,
		);
		writeOut(`  Added ${totalFakeWatched} watched entries for fake users\n`);

		writeOut("\nScreenshot seed complete!\n");
		writeOut(`  Users: 1 real + ${fakeUsers.length} fake\n`);
		writeOut(`  Follows: ${followRows.length} (bidirectional)\n`);
		writeOut(
			`  Real user watchlist: ${realWatchlistRows.length} | watched: ${realWatchedRows.length}\n`,
		);
		writeOut(
			`  Fake users watchlist: ${totalFakeWatchlist} | watched: ${totalFakeWatched}\n`,
		);
	} finally {
		await sql.end();
	}
}

main().catch((error) => {
	writeErr(`${error instanceof Error ? error.message : String(error)}\n`);
	process.exitCode = 1;
});

function writeOut(message) {
	process.stdout.write(message);
}

function writeErr(message) {
	process.stderr.write(message);
}
