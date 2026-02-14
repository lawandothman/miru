"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";
import { OnboardingProgress } from "./onboarding-progress";
import { GenreStep } from "./steps/genre-step";
import { RegionStep } from "./steps/region-step";
import { StreamingStep } from "./steps/streaming-step";
import { WatchlistStep } from "./steps/watchlist-step";
import { FriendsStep } from "./steps/friends-step";

const TOTAL_STEPS = 5;

export default function OnboardingPage() {
	const router = useRouter();
	const [step, setStep] = useState(1);
	const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
	const [selectedProviders, setSelectedProviders] = useState<number[]>([]);
	const [country, setCountry] = useState<string | null>(null);
	const [canSubmitGenres, setCanSubmitGenres] = useState(
		selectedGenres.length > 0,
	);
	const [canSubmitStreaming, setCanSubmitStreaming] = useState(
		selectedProviders.length > 0,
	);

	const complete = trpc.onboarding.complete.useMutation({
		onSuccess: () => router.push("/dashboard"),
		onError: () => toast.error("Something went wrong"),
	});

	const skip = trpc.onboarding.skip.useMutation({
		onSuccess: () => router.push("/dashboard"),
		onError: () => toast.error("Something went wrong"),
	});

	const stepAction = {
		1: { form: "onboarding-region-form", label: "Continue", disabled: false },
		2: {
			form: "onboarding-genre-form",
			label: "Next",
			disabled: !canSubmitGenres,
		},
		3: {
			form: "onboarding-streaming-form",
			label: "Next",
			disabled: !canSubmitStreaming,
		},
		4: { form: "onboarding-watchlist-form", label: "Next", disabled: false },
		5: {
			form: "onboarding-friends-form",
			label: complete.isPending ? "Finishing..." : "Finish",
			disabled: complete.isPending,
		},
	} as const;

	const currentAction = stepAction[step as keyof typeof stepAction];

	return (
		<div className="space-y-8">
			<div className="flex items-center justify-between">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => skip.mutate()}
					disabled={skip.isPending}
					className="text-muted-foreground"
				>
					Skip
				</Button>

				<Button
					size="sm"
					type="submit"
					form={currentAction.form}
					disabled={currentAction.disabled}
				>
					{currentAction.label}
					{step < 5 && <ArrowRight className="size-4" />}
				</Button>
			</div>

			<OnboardingProgress currentStep={step} totalSteps={TOTAL_STEPS} />

			<div key={step} className="animate-fade-in-up">
				{step === 1 && (
					<RegionStep
						initialCountry={country}
						onComplete={(selectedCountry) => {
							setCountry(selectedCountry);
							setStep(2);
						}}
					/>
				)}

				{step === 2 && (
					<GenreStep
						selectedGenres={selectedGenres}
						onSelectionStateChange={setCanSubmitGenres}
						onComplete={(genreIds) => {
							setSelectedGenres(genreIds);
							setCanSubmitGenres(genreIds.length > 0);
							setStep(3);
						}}
					/>
				)}

				{step === 3 && (
					<StreamingStep
						selectedProviders={selectedProviders}
						country={country}
						onSelectionStateChange={setCanSubmitStreaming}
						onComplete={(providerIds) => {
							setSelectedProviders(providerIds);
							setCanSubmitStreaming(providerIds.length > 0);
							setStep(4);
						}}
					/>
				)}

				{step === 4 && (
					<WatchlistStep
						genreIds={selectedGenres}
						onComplete={() => setStep(5)}
					/>
				)}

				{step === 5 && (
					<FriendsStep
						onComplete={() => complete.mutate()}
					/>
				)}
			</div>
		</div>
	);
}
