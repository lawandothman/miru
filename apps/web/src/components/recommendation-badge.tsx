import {
	Flame,
	Heart,
	Sparkles,
	Star,
	Tv,
	TrendingUp,
	Users,
} from "lucide-react";
import { match } from "ts-pattern";

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
	return match(reason)
		.with({ type: "friends" }, (r) => ({
			icon: <Users className="size-3 shrink-0" />,
			text: r.count === 1 ? "1 friend watching" : `${r.count} friends watching`,
		}))
		.with({ type: "trending" }, () => ({
			icon: <Flame className="size-3 shrink-0" />,
			text: "Trending now",
		}))
		.with({ type: "because_you_watched" }, (r) => ({
			icon: <Sparkles className="size-3 shrink-0" />,
			text: r.title ? `Because you watched ${r.title}` : "Based on your taste",
		}))
		.with({ type: "popular_on_miru" }, () => ({
			icon: <TrendingUp className="size-3 shrink-0" />,
			text: "Popular on Miru",
		}))
		.with({ type: "available_on" }, (r) => ({
			icon: <Tv className="size-3 shrink-0" />,
			text: r.provider ? `On ${r.provider}` : "On your services",
		}))
		.with({ type: "top_rated" }, () => ({
			icon: <Star className="size-3 shrink-0" />,
			text: "Highly rated",
		}))
		.with({ type: "genre_match" }, () => ({
			icon: <Heart className="size-3 shrink-0" />,
			text: "Matches your taste",
		}))
		.exhaustive();
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
