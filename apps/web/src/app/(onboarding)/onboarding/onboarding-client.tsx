"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { match } from "ts-pattern";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";
import { capture } from "@/lib/analytics";
import { OnboardingProgress } from "./onboarding-progress";
import { GenreStep } from "./steps/genre-step";
import { ProfileStep } from "./steps/profile-step";
import { RegionStep } from "./steps/region-step";
import { StreamingStep } from "./steps/streaming-step";
import { WatchlistStep } from "./steps/watchlist-step";
import { FriendsStep } from "./steps/friends-step";

type StepName =
	| "profile"
	| "region"
	| "genre"
	| "streaming"
	| "watchlist"
	| "friends";

interface OnboardingClientProps {
	initialName: string;
}

export function OnboardingClient({ initialName }: OnboardingClientProps) {
	const router = useRouter();
	const [steps] = useState<readonly StepName[]>(() =>
		initialName.trim()
			? ["region", "genre", "streaming", "watchlist", "friends"]
			: ["profile", "region", "genre", "streaming", "watchlist", "friends"],
	);
	const totalSteps = steps.length;

	const [step, setStep] = useState(1);
	const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
	const [selectedProviders, setSelectedProviders] = useState<number[]>([]);
	const [country, setCountry] = useState<string | null>(null);

	const tracked = useRef(false);
	useEffect(() => {
		if (!tracked.current) {
			tracked.current = true;
			capture("onboarding_started", {});
		}
	});

	const complete = trpc.onboarding.complete.useMutation({
		onSuccess: () => {
			capture("onboarding_completed", {});
			router.push("/dashboard");
		},
		onError: () => toast.error("Something went wrong"),
	});

	const currentStepName = steps[step - 1];
	const isLastStep = step === totalSteps;

	const stepAction: Record<
		StepName,
		{ form: string; label: string; disabled: boolean }
	> = {
		profile: {
			form: "onboarding-profile-form",
			label: "Continue",
			disabled: false,
		},
		region: {
			form: "onboarding-region-form",
			label: "Continue",
			disabled: false,
		},
		genre: {
			form: "onboarding-genre-form",
			label: "Next",
			disabled: selectedGenres.length === 0,
		},
		streaming: {
			form: "onboarding-streaming-form",
			label: "Next",
			disabled: false,
		},
		watchlist: {
			form: "onboarding-watchlist-form",
			label: "Next",
			disabled: false,
		},
		friends: {
			form: "onboarding-friends-form",
			label: complete.isPending ? "Finishing..." : "Finish",
			disabled: complete.isPending,
		},
	};

	const currentAction = currentStepName
		? stepAction[currentStepName]
		: stepAction.region;

	const advance = (eventName: string) => {
		capture("onboarding_step_completed", { step: eventName });
		setStep((s) => s + 1);
	};

	return (
		<div className="space-y-8">
			<div className="flex items-center justify-between">
				<div className="w-20">
					{step > 1 && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setStep((s) => s - 1)}
							className="text-muted-foreground"
						>
							<ArrowLeft className="size-4" />
							Back
						</Button>
					)}
				</div>

				<span className="text-xs text-muted-foreground">
					Step {step} of {totalSteps}
				</span>

				<div className="flex w-20 justify-end">
					<Button
						size="sm"
						type="submit"
						form={currentAction.form}
						disabled={currentAction.disabled}
					>
						{currentAction.label}
						{!isLastStep && <ArrowRight className="size-4" />}
					</Button>
				</div>
			</div>

			<OnboardingProgress currentStep={step} totalSteps={totalSteps} />

			<div key={step} className="animate-fade-in-up">
				{match(currentStepName)
					.with("profile", () => (
						<ProfileStep
							initialName={initialName}
							onComplete={() => advance("profile")}
						/>
					))
					.with("region", () => (
						<RegionStep
							initialCountry={country}
							onComplete={(selectedCountry) => {
								setCountry(selectedCountry);
								advance("region");
							}}
						/>
					))
					.with("genre", () => (
						<GenreStep
							selectedGenres={selectedGenres}
							onSelectionChange={setSelectedGenres}
							onComplete={(genreIds) => {
								setSelectedGenres(genreIds);
								advance("genres");
							}}
						/>
					))
					.with("streaming", () => (
						<StreamingStep
							selectedProviders={selectedProviders}
							country={country}
							onComplete={(providerIds) => {
								setSelectedProviders(providerIds);
								advance("streaming");
							}}
						/>
					))
					.with("watchlist", () => (
						<WatchlistStep
							genreIds={selectedGenres}
							onComplete={() => advance("watchlist")}
						/>
					))
					.with("friends", () => (
						<FriendsStep
							onComplete={() => {
								capture("onboarding_step_completed", { step: "friends" });
								complete.mutate();
							}}
						/>
					))
					.with(undefined, () => null)
					.exhaustive()}
			</div>

			<div className="h-16 sm:h-24" aria-hidden="true" />
		</div>
	);
}
