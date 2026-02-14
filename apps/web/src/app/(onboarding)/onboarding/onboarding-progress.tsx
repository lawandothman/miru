import { cn } from "@/lib/utils";

interface OnboardingProgressProps {
	currentStep: number;
	totalSteps: number;
}

export function OnboardingProgress({
	currentStep,
	totalSteps,
}: OnboardingProgressProps) {
	return (
		<div className="flex items-center gap-2">
			{Array.from({ length: totalSteps }, (_, i) => (
				<div
					key={i}
					className={cn(
						"h-1.5 flex-1 rounded-full transition-colors duration-300",
						i < currentStep ? "bg-primary" : "bg-muted",
					)}
				/>
			))}
		</div>
	);
}
