export type EventProperties = {
	signed_in: { method: string };
	signed_out: Record<string, never>;
	onboarding_started: Record<string, never>;
	onboarding_completed: Record<string, never>;
	onboarding_step_completed: { step: string };
	movie_added_to_watchlist: { movie_id: number };
	movie_removed_from_watchlist: { movie_id: number };
	movie_marked_watched: { movie_id: number };
	movie_unmarked_watched: { movie_id: number };
	user_followed: { target_user_id: string };
	user_unfollowed: { target_user_id: string };
	movie_viewed: { movie_id: number };
	search_performed: { query: string };
	match_viewed: { target_user_id: string };
};

export type EventName = keyof EventProperties;
