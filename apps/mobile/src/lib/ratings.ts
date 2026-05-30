import { Heart, ThumbsDown, ThumbsUp } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import type { MovieRating } from "./types";

type RatingColorKey = "foreground" | "primary" | "destructive";

interface RatingMeta {
	label: string;
	icon: LucideIcon;
	colorKey: RatingColorKey;
}

export const RATING_META: Record<MovieRating, RatingMeta> = {
	disliked: { label: "Disliked", icon: ThumbsDown, colorKey: "foreground" },
	liked: { label: "Liked", icon: ThumbsUp, colorKey: "primary" },
	loved: { label: "Loved", icon: Heart, colorKey: "destructive" },
};

export const RATING_ORDER: readonly MovieRating[] = [
	"disliked",
	"liked",
	"loved",
];
