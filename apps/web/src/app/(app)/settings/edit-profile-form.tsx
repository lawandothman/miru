"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

interface EditProfileFormProps {
	currentName: string;
}

export function EditProfileForm({ currentName }: EditProfileFormProps) {
	const [name, setName] = useState(currentName);
	const [isPending, setIsPending] = useState(false);
	const router = useRouter();

	const hasChanged = name.trim() !== currentName && name.trim().length > 0;

	async function handleSave() {
		setIsPending(true);
		try {
			await authClient.updateUser({ name: name.trim() });
			toast.success("Profile updated");
			router.refresh();
		} catch {
			toast.error("Failed to update profile");
		} finally {
			setIsPending(false);
		}
	}

	return (
		<div className="space-y-2">
			<Label htmlFor="display-name">Display name</Label>
			<div className="flex gap-3">
				<Input
					id="display-name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="Your name"
					onKeyDown={(e) => {
						if (e.key === "Enter" && hasChanged) {
							handleSave();
						}
					}}
				/>
				<Button
					onClick={handleSave}
					disabled={!hasChanged || isPending}
					size="sm"
					className="shrink-0 self-center"
				>
					{isPending && <Loader2 className="size-3.5 animate-spin" />}
					Save
				</Button>
			</div>
		</div>
	);
}
