"use client";

import { useState } from "react";
import { Sparkles, User } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

interface ProfileStepProps {
	initialName: string;
	onComplete: (name: string) => void;
}

export function ProfileStep({ initialName, onComplete }: ProfileStepProps) {
	const [name, setName] = useState(initialName);
	const [pending, setPending] = useState(false);

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault();
		const trimmed = name.trim();
		if (!trimmed) return;

		setPending(true);
		const result = await authClient.updateUser({ name: trimmed });
		setPending(false);

		if (result.error) {
			toast.error(result.error.message ?? "Failed to save name");
			return;
		}
		onComplete(trimmed);
	}

	return (
		<form
			id="onboarding-profile-form"
			onSubmit={handleSubmit}
			className="space-y-8"
		>
			<div className="space-y-3 text-center">
				<div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-200">
					<Sparkles className="size-3.5" />
					Welcome to Miru
				</div>
				<h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
					What should we call you?
				</h2>
				<p className="text-sm text-muted-foreground sm:text-base">
					Your name is shown to friends you follow.
				</p>
			</div>

			<div className="rounded-2xl border border-border/70 bg-card/40 p-4 sm:p-5">
				<div className="space-y-2">
					<Label htmlFor="onboarding-name">Your name</Label>
					<Input
						id="onboarding-name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="e.g. Alex Doe"
						autoComplete="name"
						autoFocus
						maxLength={60}
						required
						disabled={pending}
						className="h-12 rounded-xl"
					/>
				</div>

				<div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
					<User className="size-3.5" />
					You can change this later in Settings.
				</div>
			</div>
		</form>
	);
}
