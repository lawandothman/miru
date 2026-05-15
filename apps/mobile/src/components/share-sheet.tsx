import { useCallback, useEffect, useRef, useState } from "react";
import {
	Alert,
	Linking,
	Platform,
	Share,
	StyleSheet,
	View,
} from "react-native";
import {
	BottomSheet,
	Group,
	Host,
	RNHostView,
	VStack,
} from "@expo/ui/swift-ui";
import { presentationDragIndicator } from "@expo/ui/swift-ui/modifiers";
import { captureRef } from "react-native-view-shot";
import RNShare, { Social } from "react-native-share";
import { TRPCClientError } from "@trpc/client";
import { ActionsView } from "@/components/share-sheet/actions-view";
import { PickerView } from "@/components/share-sheet/picker-view";
import { StoryCard } from "@/components/story-card";
import {
	useRecommendationDraft,
	type RecommendRecipient,
} from "@/hooks/use-recommendation-draft";
import { capture } from "@/lib/analytics";
import { triggerStepCompleteHaptic } from "@/lib/haptics";
import { trpc } from "@/lib/trpc";

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

function movieSlug(title: string, tmdbId: number): string {
	const slug = title
		.toLowerCase()
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
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

	if (__DEV__) {
		return true;
	}

	try {
		return await Linking.canOpenURL("instagram-stories://share");
	} catch {
		return false;
	}
}

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
	const [storiesSharing, setStoriesSharing] = useState(false);
	const [sendingRecipientId, setSendingRecipientId] = useState<string | null>(
		null,
	);
	const [storiesAvailable, setStoriesAvailable] = useState(
		() => Platform.OS === "ios" && Boolean(INSTAGRAM_STORIES_APP_ID),
	);
	const draft = useRecommendationDraft();
	const utils = trpc.useUtils();
	const sendMutation = trpc.recommendation.send.useMutation();

	useEffect(() => {
		if (Platform.OS !== "ios" || !INSTAGRAM_STORIES_APP_ID) {
			return;
		}
		let cancelled = false;
		canShareToInstagramStories()
			.then((available) => {
				if (!cancelled) setStoriesAvailable(available);
			})
			.catch(() => undefined);
		return () => {
			cancelled = true;
		};
	}, []);

	const handleClose = useCallback(() => {
		draft.reset();
		setStoriesSharing(false);
		setSendingRecipientId(null);
		onClose();
	}, [draft, onClose]);

	const handleShareMore = useCallback(async () => {
		handleClose();
		try {
			await shareMovieLink(movie);
		} catch {
			// user cancelled native share sheet
		}
	}, [movie, handleClose]);

	const handleShareStory = useCallback(async () => {
		if (storiesSharing) return;
		setStoriesSharing(true);
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
					attributionURL: getMovieShareUrl(movie),
				});
			} else {
				await shareMovieLink(movie);
			}
			handleClose();
		} catch {
			// user cancelled or Instagram not installed
		} finally {
			setStoriesSharing(false);
		}
	}, [storiesSharing, movie, handleClose]);

	const handleSelectRecipient = useCallback(
		async (recipient: RecommendRecipient) => {
			if (sendingRecipientId) return;
			setSendingRecipientId(recipient.id);

			try {
				await sendMutation.mutateAsync({
					movieId: movie.id,
					recipientId: recipient.id,
				});

				capture("movie_recommendation_sent", {
					movie_id: movie.id,
					target_user_id: recipient.id,
					has_message: false,
				});

				triggerStepCompleteHaptic();
				utils.recommendation.listIncoming.invalidate();
				utils.recommendation.getRecipientCandidates.invalidate({
					movieId: movie.id,
				});
				handleClose();
				Alert.alert(
					"Recommendation sent",
					`${movie.title} is on its way to ${recipient.name ?? "your friend"}.`,
				);
			} catch (error) {
				const message =
					error instanceof TRPCClientError
						? error.message
						: "Couldn't send the recommendation. Try again.";
				Alert.alert("Couldn't send", message);
			} finally {
				setSendingRecipientId(null);
			}
		},
		[
			handleClose,
			movie.id,
			movie.title,
			sendMutation,
			sendingRecipientId,
			utils,
		],
	);

	return (
		<>
			<View style={styles.offscreen} pointerEvents="none">
				<StoryCard ref={storyCardRef} movie={movie} />
			</View>

			<Host style={StyleSheet.absoluteFill}>
				<VStack>
					<BottomSheet
						isPresented={visible}
						onIsPresentedChange={(presented: boolean) => {
							if (!presented) handleClose();
						}}
						fitToContents
					>
						<Group modifiers={[presentationDragIndicator("visible")]}>
							<RNHostView matchContents>
								<View style={styles.sheet}>
									{draft.mode === "actions" ? (
										<ActionsView
											movie={movie}
											showStoriesAction={storiesAvailable}
											storiesSharing={storiesSharing}
											onShareLink={() => {
												void handleShareMore();
											}}
											onShareStory={() => {
												void handleShareStory();
											}}
											onRecommend={draft.startPicking}
										/>
									) : null}

									{draft.mode === "picker" ? (
										<PickerView
											movieId={movie.id}
											onBack={draft.back}
											onSelect={(recipient) => {
												void handleSelectRecipient(recipient);
											}}
											sendingRecipientId={sendingRecipientId}
										/>
									) : null}
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
	sheet: {
		width: "100%",
	},
	offscreen: {
		position: "absolute",
		left: -9999,
		top: 0,
	},
});
