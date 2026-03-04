import { useState, useCallback } from "react";
import {
	View,
	Text,
	Pressable,
	ActivityIndicator,
	StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { trpc } from "@/lib/trpc";
import { ProgressBar } from "@/components/onboarding/progress-bar";
import { RegionStep } from "@/components/onboarding/region-step";
import { GenreStep } from "@/components/onboarding/genre-step";
import { StreamingStep } from "@/components/onboarding/streaming-step";
import { WatchlistStep } from "@/components/onboarding/watchlist-step";
import { FriendsStep } from "@/components/onboarding/friends-step";
import { Colors, fontSize, fontFamily, spacing, radius } from "@/lib/constants";

const TOTAL_STEPS = 5;

export default function OnboardingScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const utils = trpc.useUtils();

	const [step, setStep] = useState(1);
	const [country, setCountry] = useState<string | null>(null);
	const [selectedGenres, setSelectedGenres] = useState<Set<number>>(new Set());
	const [selectedProviders, setSelectedProviders] = useState<Set<number>>(
		new Set(),
	);
	const [watchlistIds, setWatchlistIds] = useState<Set<number>>(new Set());
	const [isSaving, setIsSaving] = useState(false);

	const setCountryMut = trpc.onboarding.setCountry.useMutation();
	const setGenresMut = trpc.onboarding.setGenrePreferences.useMutation();
	const setStreamingMut = trpc.onboarding.setStreamingServices.useMutation();
	const addToWatchlist = trpc.watchlist.add.useMutation();
	const removeFromWatchlist = trpc.watchlist.remove.useMutation();
	const completeMut = trpc.onboarding.complete.useMutation();

	const canContinue = (() => {
		switch (step) {
			case 1:
				return country !== null;
			case 2:
				return selectedGenres.size >= 1;
			default:
				return true;
		}
	})();

	const isSkippable = step >= 3;

	const handleWatchlistToggle = useCallback(
		(movieId: number) => {
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
			switch (step) {
				case 1:
					if (country) {
						await setCountryMut.mutateAsync({ country });
					}
					break;
				case 2:
					await setGenresMut.mutateAsync({
						genreIds: Array.from(selectedGenres),
					});
					break;
				case 3:
					if (selectedProviders.size > 0) {
						await setStreamingMut.mutateAsync({
							providerIds: Array.from(selectedProviders),
						});
					}
					break;
				default:
					break;
			}

			if (step < TOTAL_STEPS) {
				setStep(step + 1);
			} else {
				await completeMut.mutateAsync();
				utils.onboarding.getState.invalidate();
				router.replace("/(tabs)");
			}
		} finally {
			setIsSaving(false);
		}
	}

	function renderStep() {
		switch (step) {
			case 1:
				return <RegionStep country={country} onSelect={setCountry} />;
			case 2:
				return (
					<GenreStep
						selectedGenres={selectedGenres}
						onSelectionChange={setSelectedGenres}
					/>
				);
			case 3:
				return (
					<StreamingStep
						selectedProviders={selectedProviders}
						onSelectionChange={setSelectedProviders}
					/>
				);
			case 4:
				return (
					<WatchlistStep
						genreIds={Array.from(selectedGenres)}
						watchlistIds={watchlistIds}
						onToggle={handleWatchlistToggle}
					/>
				);
			case 5:
				return <FriendsStep />;
			default:
				return null;
		}
	}

	const buttonLabel = (() => {
		if (step === TOTAL_STEPS) {
			return "Finish";
		}
		if (isSkippable) {
			return "Next";
		}
		return "Continue";
	})();

	return (
		<View style={[styles.container, { paddingTop: insets.top + spacing[4] }]}>
			<ProgressBar currentStep={step} />

			<View style={styles.stepContainer}>{renderStep()}</View>

			<View
				style={[
					styles.actionBar,
					{ paddingBottom: insets.bottom + spacing[4] },
				]}
			>
				{isSkippable && step < TOTAL_STEPS && (
					<Pressable
						style={({ pressed }) => [
							styles.skipButton,
							pressed && styles.pressed,
						]}
						onPress={() => setStep(step + 1)}
						disabled={isSaving}
					>
						<Text style={styles.skipText}>Skip</Text>
					</Pressable>
				)}
				<Pressable
					style={({ pressed }) => [
						styles.continueButton,
						!canContinue && styles.continueButtonDisabled,
						pressed && canContinue && styles.pressed,
						isSkippable && step < TOTAL_STEPS
							? styles.continueButtonFlex
							: styles.continueButtonFull,
					]}
					onPress={handleNext}
					disabled={!canContinue || isSaving}
				>
					{isSaving ? (
						<ActivityIndicator color={Colors.primaryForeground} size="small" />
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
