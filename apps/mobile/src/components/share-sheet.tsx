import { useCallback, useRef, useState } from "react";
import {
	KeyboardAvoidingView,
	Linking,
	Modal,
	Platform,
	Pressable,
	Share,
	StyleSheet,
	View,
} from "react-native";
import { captureRef } from "react-native-view-shot";
import RNShare, { Social } from "react-native-share";
import { TRPCClientError } from "@trpc/client";
import { ActionsView } from "@/components/share-sheet/actions-view";
import { NoteView } from "@/components/share-sheet/note-view";
import { PickerView } from "@/components/share-sheet/picker-view";
import { StoryCard } from "@/components/story-card";
import {
	useRecommendationDraft,
	type RecommendRecipient,
} from "@/hooks/use-recommendation-draft";
import { capture } from "@/lib/analytics";
import { Colors, radius, spacing } from "@/lib/constants";
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
	const [storiesAvailable, setStoriesAvailable] = useState(false);
	const draft = useRecommendationDraft();
	const utils = trpc.useUtils();
	const sendMutation = trpc.recommendation.send.useMutation();

	const handleClose = useCallback(() => {
		draft.reset();
		setStoriesSharing(false);
		onClose();
	}, [draft, onClose]);

	const handleVisibilityChange = useCallback(
		(next: boolean) => {
			if (next) {
				void canShareToInstagramStories().then(setStoriesAvailable);
			} else {
				draft.reset();
			}
		},
		[draft],
	);

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
		(recipient: RecommendRecipient) => {
			draft.chooseRecipient(recipient);
		},
		[draft],
	);

	const handleSendRecommendation = useCallback(async () => {
		if (!draft.recipient || sendMutation.isPending) {
			return;
		}

		const trimmed = draft.message.trim();

		try {
			await sendMutation.mutateAsync({
				movieId: movie.id,
				recipientId: draft.recipient.id,
				...(trimmed ? { message: trimmed } : {}),
			});

			capture("movie_recommendation_sent", {
				movie_id: movie.id,
				target_user_id: draft.recipient.id,
				has_message: trimmed.length > 0,
			});

			triggerStepCompleteHaptic();
			utils.recommendation.listIncoming.invalidate();
			utils.recommendation.getRecipientCandidates.invalidate({
				movieId: movie.id,
			});
			handleClose();
		} catch (error) {
			if (error instanceof TRPCClientError) {
				// surface server error via a follow-up alert; keep sheet open
				// so the user can revise or cancel
				// oxlint-disable-next-line no-console
				console.warn("Recommendation send failed", error.message);
			}
		}
	}, [draft.message, draft.recipient, handleClose, movie.id, sendMutation, utils]);

	return (
		<Modal
			visible={visible}
			transparent
			animationType="slide"
			onRequestClose={handleClose}
			onShow={() => handleVisibilityChange(true)}
			onDismiss={() => handleVisibilityChange(false)}
			statusBarTranslucent
		>
			<View style={styles.backdrop}>
				<Pressable
					style={StyleSheet.absoluteFill}
					onPress={handleClose}
					accessibilityElementsHidden
					importantForAccessibility="no-hide-descendants"
				/>

				<KeyboardAvoidingView
					behavior={Platform.OS === "ios" ? "padding" : undefined}
					style={styles.sheetWrapper}
					pointerEvents="box-none"
				>
					<View style={styles.sheet}>
						<View style={styles.handle} />

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
								onSelect={handleSelectRecipient}
							/>
						) : null}

						{draft.mode === "note" && draft.recipient ? (
							<NoteView
								recipient={draft.recipient}
								message={draft.message}
								onMessageChange={draft.setMessage}
								sending={sendMutation.isPending}
								onBack={draft.back}
								onSend={() => {
									void handleSendRecommendation();
								}}
							/>
						) : null}
					</View>
				</KeyboardAvoidingView>

				<View style={styles.offscreen} pointerEvents="none">
					<StoryCard ref={storyCardRef} movie={movie} />
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	backdrop: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "flex-end",
	},
	sheetWrapper: {
		justifyContent: "flex-end",
	},
	sheet: {
		backgroundColor: Colors.background,
		borderTopLeftRadius: radius.xl,
		borderTopRightRadius: radius.xl,
		paddingBottom: spacing[8],
		paddingTop: spacing[2],
		maxHeight: "92%",
	},
	handle: {
		alignSelf: "center",
		width: 36,
		height: 4,
		borderRadius: 2,
		backgroundColor: Colors.border,
		marginBottom: spacing[2],
	},
	offscreen: {
		position: "absolute",
		left: -9999,
		top: 0,
	},
});
