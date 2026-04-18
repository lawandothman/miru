import { useCallback, useRef, useState } from "react";
import {
	View,
	Text,
	Pressable,
	StyleSheet,
	Alert,
	Share,
	Platform,
	ActivityIndicator,
	Image as RNImage,
	Linking,
} from "react-native";
import {
	BottomSheet,
	Host,
	Group,
	RNHostView,
	VStack,
} from "@expo/ui/swift-ui";
import { presentationDragIndicator } from "@expo/ui/swift-ui/modifiers";
import * as Clipboard from "expo-clipboard";
import { captureRef } from "react-native-view-shot";
import RNShare, { Social } from "react-native-share";
import { SvgUri } from "react-native-svg";
import { Copy } from "lucide-react-native";
import { StoryCard } from "./story-card";
import { Colors, fontFamily, fontSize, spacing, radius } from "@/lib/constants";

interface ShareSheetMovie {
	id: number;
	title: string;
	posterPath: string | null;
	backdropPath: string | null;
	releaseDate: string | null;
	runtime: number | null;
	tmdbVoteAverage: number | null;
	genres: { genre: { id: number; name: string } }[] | null;
}

const WEB_BASE = "https://watchmiru.app";
const INSTAGRAM_STORIES_APP_ID =
	process.env.EXPO_PUBLIC_INSTAGRAM_STORIES_APP_ID?.trim();
const INSTAGRAM_GLYPH_URI = RNImage.resolveAssetSource(
	require("../../assets/instagram-glyph-gradient.svg"),
).uri;

function movieSlug(title: string, tmdbId: number): string {
	const slug = title
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
	return `${slug}-${tmdbId}`;
}

export function getMovieShareUrl(movie: Pick<ShareSheetMovie, "id" | "title">) {
	return `${WEB_BASE}/movie/${movieSlug(movie.title, movie.id)}`;
}

export async function shareMovieLink(
	movie: Pick<ShareSheetMovie, "id" | "title">,
) {
	const url = getMovieShareUrl(movie);

	return Share.share(
		Platform.OS === "ios"
			? { message: `Check out ${movie.title} on Miru`, url }
			: { message: `Check out ${movie.title} on Miru\n${url}` },
	);
}

export async function canShareToInstagramStories() {
	if (Platform.OS !== "ios") {
		return false;
	}

	try {
		return await Linking.canOpenURL("instagram-stories://share");
	} catch {
		return false;
	}
}

const CARD_WIDTH = 360;
const CARD_HEIGHT = 640;
const PREVIEW_HEIGHT = 280;
const PREVIEW_WIDTH = (CARD_WIDTH / CARD_HEIGHT) * PREVIEW_HEIGHT;
const previewScale = PREVIEW_HEIGHT / CARD_HEIGHT;
const storyActionLabel = "Instagram stories";

export function ShareSheet({
	movie,
	visible,
	onClose,
}: {
	movie: ShareSheetMovie;
	visible: boolean;
	onClose: () => void;
}) {
	const storyCardRef = useRef<View>(null);
	const [sharing, setSharing] = useState(false);

	const url = getMovieShareUrl(movie);

	const handleCopyLink = useCallback(async () => {
		onClose();
		try {
			await Clipboard.setStringAsync(url);
			Alert.alert("Link copied");
		} catch {
			Alert.alert("Couldn't copy link", "Try again in a moment.");
		}
	}, [url, onClose]);

	const handleShareStory = useCallback(async () => {
		if (sharing) return;
		setSharing(true);
		try {
			const uri = await captureRef(storyCardRef, {
				format: "png",
				quality: 1,
			});

			if (INSTAGRAM_STORIES_APP_ID) {
				await RNShare.shareSingle({
					social: Social.InstagramStories,
					appId: INSTAGRAM_STORIES_APP_ID,
					backgroundImage: uri,
					attributionURL: url,
				});
			} else {
				await shareMovieLink(movie);
			}
			onClose();
		} catch {
			// user cancelled or Instagram not installed
		} finally {
			setSharing(false);
		}
	}, [sharing, url, onClose]);

	return (
		<>
			{/* Off-screen full-size card for capture */}
			<View style={styles.offscreen} pointerEvents="none">
				<StoryCard ref={storyCardRef} movie={movie} />
			</View>

			<Host style={StyleSheet.absoluteFill}>
				<VStack>
					<BottomSheet
						isPresented={visible}
						onIsPresentedChange={(presented: boolean) => {
							if (!presented) onClose();
						}}
						fitToContents
					>
						<Group modifiers={[presentationDragIndicator("visible")]}>
							<RNHostView matchContents>
								<View style={styles.sheet}>
									{/* Story card preview */}
									<View style={styles.previewContainer}>
										<View style={styles.previewWrapper}>
											<View style={styles.previewScaler}>
												<StoryCard movie={movie} />
											</View>
										</View>
									</View>

									{/* Actions */}
									<View style={styles.actions}>
										<Pressable
											style={({ pressed }) => [
												styles.actionButton,
												pressed && styles.pressed,
											]}
											onPress={handleShareStory}
											disabled={sharing}
										>
											{sharing ? (
												<View style={styles.actionIcon}>
													<ActivityIndicator
														size="small"
														color={Colors.foreground}
													/>
												</View>
											) : (
												<View style={[styles.actionIcon, styles.instagramIcon]}>
													<SvgUri
														uri={INSTAGRAM_GLYPH_URI}
														width={22}
														height={22}
													/>
												</View>
											)}
											<Text style={styles.actionLabel}>{storyActionLabel}</Text>
										</Pressable>

										<Pressable
											style={({ pressed }) => [
												styles.actionButton,
												pressed && styles.pressed,
											]}
											onPress={() => {
												void handleCopyLink();
											}}
										>
											<View style={styles.actionIcon}>
												<Copy size={22} color={Colors.foreground} />
											</View>
											<Text style={styles.actionLabel}>Copy link</Text>
										</Pressable>
									</View>
								</View>
							</RNHostView>
						</Group>
					</BottomSheet>
				</VStack>
			</Host>
		</>
	);
}

const styles = StyleSheet.create({
	offscreen: {
		position: "absolute",
		left: -9999,
		top: 0,
	},
	sheet: {
		paddingTop: spacing[4],
		paddingBottom: spacing[6],
		paddingHorizontal: spacing[6],
		gap: spacing[6],
		alignItems: "center",
	},
	previewContainer: {
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
		gap: spacing[8],
	},
	actionButton: {
		alignItems: "center",
		gap: spacing[2],
	},
	pressed: {
		opacity: 0.6,
	},
	actionIcon: {
		width: 52,
		height: 52,
		borderRadius: 26,
		backgroundColor: Colors.secondary,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: Colors.border,
		justifyContent: "center",
		alignItems: "center",
	},
	instagramIcon: {
		backgroundColor: "transparent",
		borderWidth: 0,
	},
	actionLabel: {
		fontSize: fontSize.xs,
		fontFamily: fontFamily.sansMedium,
		color: Colors.mutedForeground,
	},
});
