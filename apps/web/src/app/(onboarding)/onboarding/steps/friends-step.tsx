"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc/client";
import { UserAvatar } from "@/components/user-avatar";
import { FollowButton } from "@/components/follow-button";

interface FriendsStepProps {
	onComplete: () => void;
}

function useDebounce(value: string, delay: number) {
	const [debouncedValue, setDebouncedValue] = useState(value);
	useEffect(() => {
		const timer = setTimeout(() => setDebouncedValue(value), delay);
		return () => clearTimeout(timer);
	}, [value, delay]);
	return debouncedValue;
}

export function FriendsStep({ onComplete }: FriendsStepProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [copied, setCopied] = useState(false);
	const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const debouncedQuery = useDebounce(searchQuery, 300);

	const { data: suggestedUsers } =
		trpc.onboarding.getSuggestedUsers.useQuery();

	const { data: searchResults } = trpc.social.searchUsers.useQuery(
		{ query: debouncedQuery },
		{ enabled: debouncedQuery.length > 0 },
	);

	const handleShare = async () => {
		const url = `${window.location.origin}/dashboard`;
		if (navigator.share) {
			try {
				await navigator.share({
					title: "Join me on Miru",
					text: "Find movies to watch together on Miru!",
					url,
				});
				return;
			} catch (error) {
				if (error instanceof Error && error.name === "AbortError") return;
			}
		}

		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			toast("Link copied");
			if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
			copiedTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Unable to copy link");
		}
	};

	useEffect(() => {
		return () => {
			if (copiedTimeoutRef.current) clearTimeout(copiedTimeoutRef.current);
		};
	}, []);

	const usersToShow = debouncedQuery.length > 0 ? searchResults : suggestedUsers;

	return (
		<div className="space-y-6">
			<div className="space-y-2 text-center">
				<h2 className="font-display text-2xl font-bold tracking-tight">
					Find friends
				</h2>
				<p className="text-sm text-muted-foreground">
					Follow friends to discover movies you both want to watch.
				</p>
			</div>

			<div className="relative">
				<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder="Search by name..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="pl-9"
				/>
			</div>

			<div className="space-y-1">
				{!debouncedQuery && (
					<p className="px-1 text-xs font-medium text-muted-foreground">
						Suggested
					</p>
				)}
				<div className="max-h-64 space-y-1 overflow-y-auto rounded-xl border bg-card p-2">
					{usersToShow && usersToShow.length > 0 ? (
						usersToShow.map((user) => (
							<div
								key={user.id}
								className="flex items-center gap-3 rounded-lg p-2"
							>
								<UserAvatar
									name={user.name ?? "?"}
									image={user.image}
									size="sm"
								/>
								<span className="flex-1 truncate text-sm font-medium">
									{user.name}
								</span>
								<FollowButton
									userId={user.id}
									isFollowing={user.isFollowing}
								/>
							</div>
						))
					) : (
						<p className="py-6 text-center text-sm text-muted-foreground">
							{debouncedQuery ? "No users found" : "No suggestions yet"}
						</p>
					)}
				</div>
			</div>

			<div className="space-y-2">
				<p className="text-center text-xs text-muted-foreground">
					Or invite friends to join
				</p>
				<Button
					variant="outline"
					onClick={handleShare}
					className="w-full gap-2"
				>
					{copied ? (
						<Check className="size-4" />
					) : (
						<Copy className="size-4" />
					)}
					{copied ? "Copied!" : "Copy invite link"}
				</Button>
			</div>

			<Button onClick={onComplete} className="w-full" size="lg">
				Finish
			</Button>
		</div>
	);
}
