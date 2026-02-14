"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";
import { OnboardingProgress } from "./onboarding-progress";
import { GenreStep } from "./steps/genre-step";
import { StreamingStep } from "./steps/streaming-step";
import { WatchlistStep } from "./steps/watchlist-step";
import { FriendsStep } from "./steps/friends-step";

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
	const router = useRouter();
	const [step, setStep] = useState(1);
	const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
	const [selectedProviders, setSelectedProviders] = useState<number[]>([]);
	const [country, setCountry] = useState<string | null>(null);

	const complete = trpc.onboarding.complete.useMutation({
		onSuccess: () => router.push("/dashboard"),
		onError: () => toast.error("Something went wrong"),
	});

	const skip = trpc.onboarding.skip.useMutation({
		onSuccess: () => router.push("/dashboard"),
		onError: () => toast.error("Something went wrong"),
	});

	return (
		<div className="space-y-8">
			<div className="flex items-center justify-between">
				<OnboardingProgress currentStep={step} totalSteps={TOTAL_STEPS} />
				<Button
					variant="ghost"
					size="sm"
					onClick={() => skip.mutate()}
					disabled={skip.isPending}
					className="ml-4 shrink-0 text-muted-foreground"
				>
					Skip
				</Button>
			</div>

			<div key={step} className="animate-fade-in-up">
				{step === 1 && (
					<GenreStep
						selectedGenres={selectedGenres}
						onComplete={(genreIds) => {
							setSelectedGenres(genreIds);
							setStep(2);
						}}
					/>
				)}

				{step === 2 && (
					<StreamingStep
						selectedProviders={selectedProviders}
						initialCountry={country}
						onComplete={(providerIds, c) => {
							setSelectedProviders(providerIds);
							setCountry(c);
							setStep(3);
						}}
					/>
				)}

				{step === 3 && (
					<WatchlistStep
						genreIds={selectedGenres}
						onComplete={() => setStep(4)}
					/>
				)}

				{step === 4 && (
					<FriendsStep
						onComplete={() => complete.mutate()}
					/>
				)}
			</div>
		</div>
	);
}
