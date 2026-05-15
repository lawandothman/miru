import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Link as LinkIcon, Send } from "lucide-react-native";
import { InstagramIcon } from "@/components/icons/instagram-icon";
import { StoryCard } from "@/components/story-card";
import { Colors, fontFamily, fontSize, radius, spacing } from "@/lib/constants";

const ACTION_ICON_SIZE = 52;
const INSTAGRAM_ICON_SIZE = 48;
const CARD_WIDTH = 360;
const CARD_HEIGHT = 640;
const PREVIEW_HEIGHT = 280;
const PREVIEW_WIDTH = (CARD_WIDTH / CARD_HEIGHT) * PREVIEW_HEIGHT;
const previewScale = PREVIEW_HEIGHT / CARD_HEIGHT;

interface ActionsViewMovie {
	title: string;
	posterPath: string | null;
	backdropPath: string | null;
	releaseDate: string | null;
	runtime: number | null;
	tmdbVoteAverage: number | null;
	genres: { genre: { id: number; name: string } }[] | null;
}

interface ActionsViewProps {
	movie: ActionsViewMovie;
	showStoriesAction: boolean;
	storiesSharing: boolean;
	onShareLink: () => void;
	onShareStory: () => void;
	onRecommend: () => void;
}

export function ActionsView({
	movie,
	showStoriesAction,
	storiesSharing,
	onShareLink,
	onShareStory,
	onRecommend,
}: ActionsViewProps) {
	return (
		<View style={styles.container}>
			<View style={styles.previewWrapper}>
				<View style={styles.previewScaler}>
					<StoryCard movie={movie} />
				</View>
			</View>

			<View style={styles.actions}>
				<Pressable
					style={({ pressed }) => [styles.button, pressed && styles.pressed]}
					onPress={onShareLink}
					accessibilityRole="button"
					accessibilityLabel="Share link"
				>
					<View style={styles.icon}>
						<LinkIcon size={22} color={Colors.foreground} />
					</View>
					<Text style={styles.label}>Share link</Text>
				</Pressable>

				{showStoriesAction ? (
					<Pressable
						style={({ pressed }) => [styles.button, pressed && styles.pressed]}
						onPress={onShareStory}
						disabled={storiesSharing}
						accessibilityRole="button"
						accessibilityLabel="Share to Instagram Stories"
					>
						<View style={styles.instagramWrap}>
							{storiesSharing ? (
								<ActivityIndicator size="small" color={Colors.foreground} />
							) : (
								<InstagramIcon size={INSTAGRAM_ICON_SIZE} />
							)}
						</View>
						<Text style={styles.label}>Instagram</Text>
					</Pressable>
				) : null}

				<Pressable
					style={({ pressed }) => [styles.button, pressed && styles.pressed]}
					onPress={onRecommend}
					accessibilityRole="button"
					accessibilityLabel="Send to a friend"
				>
					<View style={styles.icon}>
						<Send size={22} color={Colors.foreground} />
					</View>
					<Text style={styles.label}>Send to friend</Text>
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingTop: spacing[4],
		paddingBottom: spacing[6],
		paddingHorizontal: spacing[6],
		gap: spacing[6],
		alignItems: "center",
	},
	previewWrapper: {
		width: PREVIEW_WIDTH,
		height: PREVIEW_HEIGHT,
		borderRadius: radius.xl,
		overflow: "hidden",
	},
	previewScaler: {
		width: CARD_WIDTH,
		height: CARD_HEIGHT,
		transform: [{ scale: previewScale }],
		transformOrigin: "top left",
	},
	actions: {
		flexDirection: "row",
		justifyContent: "center",
		gap: spacing[6],
	},
	button: {
		alignItems: "center",
		gap: spacing[2],
		minWidth: 80,
	},
	pressed: {
		opacity: 0.6,
	},
	icon: {
		width: ACTION_ICON_SIZE,
		height: ACTION_ICON_SIZE,
		borderRadius: ACTION_ICON_SIZE / 2,
		backgroundColor: Colors.secondary,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: Colors.border,
		justifyContent: "center",
		alignItems: "center",
	},
	instagramWrap: {
		width: ACTION_ICON_SIZE,
		height: ACTION_ICON_SIZE,
		borderRadius: ACTION_ICON_SIZE / 2,
		overflow: "hidden",
		justifyContent: "center",
		alignItems: "center",
	},
	label: {
		fontSize: fontSize.xs,
		fontFamily: fontFamily.sansMedium,
		color: Colors.mutedForeground,
		textAlign: "center",
	},
});
