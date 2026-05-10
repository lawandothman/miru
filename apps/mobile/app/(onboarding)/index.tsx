import { useState, useCallback, useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { match } from "ts-pattern";
import { Spinner } from "@/components/spinner";
import { trpc } from "@/lib/trpc";
import { authClient, useSession } from "@/lib/auth";
import { ProgressBar } from "@/components/onboarding/progress-bar";
import { ProfileStep } from "@/components/onboarding/profile-step";
import { RegionStep } from "@/components/onboarding/region-step";
import { GenreStep } from "@/components/onboarding/genre-step";
import { StreamingStep } from "@/components/onboarding/streaming-step";
import { WatchlistStep } from "@/components/onboarding/watchlist-step";
import { FriendsStep } from "@/components/onboarding/friends-step";
import { capture } from "@/lib/analytics";
import { Colors, fontSize, fontFamily, spacing, radius } from "@/lib/constants";
import {
	triggerStepCompleteHaptic,
	triggerWatchlistHaptic,
} from "@/lib/haptics";

type StepName =
	| "profile"
	| "region"
	| "genre"
	| "streaming"
	| "watchlist"
	| "friends";

const ANALYTICS_NAME: Record<StepName, string> = {
	profile: "profile",
	region: "region",
	genre: "genres",
	streaming: "streaming",
	watchlist: "watchlist",
	friends: "friends",
};

export default function OnboardingScreen() {
	const insets = useSafeAreaInsets();
	const utils = trpc.useUtils();
	const { data: session, refetch: refetchSession } = useSession();
	const initialName = session?.user?.name ?? "";

	const [steps] = useState<readonly StepName[]>(() =>
		initialName.trim()
			? (["region", "genre", "streaming", "watchlist", "friends"] as const)
			: ([
					"profile",
					"region",
					"genre",
					"streaming",
					"watchlist",
					"friends",
				] as const),
	);
	const totalSteps = steps.length;

	const [step, setStep] = useState(1);
	const [name, setName] = useState(initialName);
	const [country, setCountry] = useState<string | null>(null);
	const [selectedGenres, setSelectedGenres] = useState<Set<number>>(new Set());
	const [selectedProviders, setSelectedProviders] = useState<Set<number>>(
		new Set(),
	);
	const [watchlistIds, setWatchlistIds] = useState<Set<number>>(new Set());
	const [isSaving, setIsSaving] = useState(false);

	const tracked = useRef(false);
	useEffect(() => {
		if (!tracked.current) {
			tracked.current = true;
			capture("onboarding_started", {});
		}
	});

	const setCountryMut = trpc.onboarding.setCountry.useMutation();
	const setGenresMut = trpc.onboarding.setGenrePreferences.useMutation();
	const setStreamingMut = trpc.onboarding.setStreamingServices.useMutation();
	const addToWatchlist = trpc.watchlist.add.useMutation();
	const removeFromWatchlist = trpc.watchlist.remove.useMutation();
	const completeMut = trpc.onboarding.complete.useMutation();

	const currentStepName = steps[step - 1];
	const isLastStep = step === totalSteps;

	const canContinue = match(currentStepName)
		.with("profile", () => name.trim().length > 0)
		.with("region", () => country !== null)
		.with("genre", () => selectedGenres.size >= 1)
		.otherwise(() => true);

	const isSkippable =
		currentStepName === "streaming" ||
		currentStepName === "watchlist" ||
		currentStepName === "friends";

	const handleWatchlistToggle = useCallback(
		(movieId: number) => {
			triggerWatchlistHaptic();

			setWatchlistIds((prev) => {
				const next = new Set(prev);
				if (next.has(movieId)) {
					next.delete(movieId);
					removeFromWatchlist.mutate({ movieId });
				} else {
					next.add(movieId);
					addToWatchlist.mutate({ movieId });
				}
				return next;
			});
		},
		[addToWatchlist, removeFromWatchlist],
	);

	async function handleNext() {
		setIsSaving(true);
		try {
			await match(currentStepName)
				.with("profile", async () => {
					const trimmed = name.trim();
					if (!trimmed) return;
					await authClient.updateUser({ name: trimmed });
				})
				.with("region", async () => {
					if (country) {
						await setCountryMut.mutateAsync({ country });
					}
				})
				.with("genre", async () => {
					await setGenresMut.mutateAsync({
						genreIds: Array.from(selectedGenres),
					});
				})
				.with("streaming", async () => {
					if (selectedProviders.size > 0) {
						await setStreamingMut.mutateAsync({
							providerIds: Array.from(selectedProviders),
						});
					}
				})
				.otherwise(async () => {});

			capture("onboarding_step_completed", {
				step: currentStepName ? ANALYTICS_NAME[currentStepName] : String(step),
			});

			if (!isLastStep) {
				triggerStepCompleteHaptic();
				setStep(step + 1);
			} else {
				await completeMut.mutateAsync();
				capture("onboarding_completed", {});
				triggerStepCompleteHaptic();
				utils.onboarding.getState.setData(undefined, (current) =>
					current ? { ...current, isCompleted: true } : current,
				);
				utils.onboarding.getState.invalidate();
				await refetchSession({
					query: { disableCookieCache: true },
				});
			}
		} finally {
			setIsSaving(false);
		}
	}

	function renderStep() {
		return match(currentStepName)
			.with("profile", () => <ProfileStep name={name} onChange={setName} />)
			.with("region", () => (
				<RegionStep country={country} onSelect={setCountry} />
			))
			.with("genre", () => (
				<GenreStep
					selectedGenres={selectedGenres}
					onSelectionChange={setSelectedGenres}
				/>
			))
			.with("streaming", () => (
				<StreamingStep
					country={country}
					selectedProviders={selectedProviders}
					onSelectionChange={setSelectedProviders}
				/>
			))
			.with("watchlist", () => (
				<WatchlistStep
					genreIds={Array.from(selectedGenres)}
					watchlistIds={watchlistIds}
					onToggle={handleWatchlistToggle}
				/>
			))
			.with("friends", () => <FriendsStep />)
			.exhaustive();
	}

	const buttonLabel = isLastStep ? "Open Miru" : "Continue";

	return (
		<View style={[styles.container, { paddingTop: insets.top + spacing[4] }]}>
			<ProgressBar currentStep={step} totalSteps={totalSteps} />

			<View style={styles.stepContainer}>{renderStep()}</View>

			<View
				style={[
					styles.actionBar,
					{ paddingBottom: insets.bottom + spacing[4] },
				]}
			>
				{isSkippable && !isLastStep && (
					<Pressable
						style={({ pressed }) => [
							styles.skipButton,
							pressed && styles.pressed,
						]}
						onPress={() => setStep(step + 1)}
						disabled={isSaving}
						accessibilityRole="button"
						accessibilityLabel="Skip this step"
					>
						<Text style={styles.skipText}>Skip</Text>
					</Pressable>
				)}
				<Pressable
					style={({ pressed }) => [
						styles.continueButton,
						!canContinue && styles.continueButtonDisabled,
						pressed && canContinue && styles.pressed,
						isSkippable && !isLastStep
							? styles.continueButtonFlex
							: styles.continueButtonFull,
					]}
					onPress={handleNext}
					disabled={!canContinue || isSaving}
					accessibilityRole="button"
					accessibilityLabel={isSaving ? "Saving" : buttonLabel}
				>
					{isSaving ? (
						<Spinner size={16} color={Colors.primaryForeground} />
					) : (
						<Text style={styles.continueText}>{buttonLabel}</Text>
					)}
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	stepContainer: {
		flex: 1,
		paddingTop: spacing[6],
	},
	actionBar: {
		flexDirection: "row",
		gap: spacing[3],
		paddingHorizontal: spacing[4],
		paddingTop: spacing[4],
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: Colors.border,
	},
	skipButton: {
		paddingVertical: spacing[3],
		paddingHorizontal: spacing[5],
		borderRadius: radius.lg,
		backgroundColor: Colors.secondary,
		alignItems: "center",
		justifyContent: "center",
	},
	skipText: {
		fontSize: fontSize.base,
		fontFamily: fontFamily.sansSemibold,
		color: Colors.foreground,
	},
	continueButton: {
		paddingVertical: spacing[3],
		borderRadius: radius.lg,
		backgroundColor: Colors.primary,
		alignItems: "center",
		justifyContent: "center",
	},
	continueButtonFull: {
		flex: 1,
	},
	continueButtonFlex: {
		flex: 1,
	},
	continueButtonDisabled: {
		opacity: 0.4,
	},
	continueText: {
		fontSize: fontSize.base,
		fontFamily: fontFamily.sansSemibold,
		color: Colors.primaryForeground,
	},
	pressed: {
		opacity: 0.8,
	},
});
