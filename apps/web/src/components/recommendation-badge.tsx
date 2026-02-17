import {
	Flame,
	Heart,
	Sparkles,
	Star,
	Tv,
	TrendingUp,
	Users,
} from "lucide-react";

interface FriendsReason {
	type: "friends";
	count: number;
}
interface TrendingReason {
	type: "trending";
}
interface BecauseYouWatchedReason {
	type: "because_you_watched";
	title: string;
}
interface PopularOnMiruReason {
	type: "popular_on_miru";
	count: number;
}
interface AvailableOnReason {
	type: "available_on";
	provider: string;
}
interface TopRatedReason {
	type: "top_rated";
}
interface GenreMatchReason {
	type: "genre_match";
}

export type RecommendationReason =
	| FriendsReason
	| TrendingReason
	| BecauseYouWatchedReason
	| PopularOnMiruReason
	| AvailableOnReason
	| TopRatedReason
	| GenreMatchReason;

function getReasonContent(reason: RecommendationReason): {
	icon: React.ReactNode;
	text: string;
} {
	switch (reason.type) {
		case "friends":
			return {
				icon: <Users className="size-3 shrink-0" />,
				text:
					reason.count === 1
						? "1 friend watching"
						: `${reason.count} friends watching`,
			};
		case "trending":
			return {
				icon: <Flame className="size-3 shrink-0" />,
				text: "Trending now",
			};
		case "because_you_watched":
			return {
				icon: <Sparkles className="size-3 shrink-0" />,
				text: reason.title
					? `Because you watched ${reason.title}`
					: "Based on your taste",
			};
		case "popular_on_miru":
			return {
				icon: <TrendingUp className="size-3 shrink-0" />,
				text: "Popular on Miru",
			};
		case "available_on":
			return {
				icon: <Tv className="size-3 shrink-0" />,
				text: reason.provider
					? `On ${reason.provider}`
					: "On your services",
			};
		case "top_rated":
			return {
				icon: <Star className="size-3 shrink-0" />,
				text: "Highly rated",
			};
		case "genre_match":
			return {
				icon: <Heart className="size-3 shrink-0" />,
				text: "Matches your taste",
			};
		default:
			return {
				icon: <Sparkles className="size-3 shrink-0" />,
				text: "Recommended for you",
			};
	}
}

export function RecommendationBadge({
	reason,
}: {
	reason: RecommendationReason;
}) {
	const { icon, text } = getReasonContent(reason);

	return (
		<span className="inline-flex max-w-full items-center gap-1.5 text-[11px] leading-tight text-white/90 drop-shadow-sm [&>svg]:text-gold">
			{icon}
			<span className="truncate">{text}</span>
		</span>
	);
}
