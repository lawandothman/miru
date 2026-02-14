"use client";

import { useState } from "react";
import { Check, Copy, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useDebounce } from "@/hooks/use-debounce";
import { trpc } from "@/lib/trpc/client";
import { UserAvatar } from "@/components/user-avatar";
import { FollowButton } from "@/components/follow-button";

interface FriendsStepProps {
	onComplete: () => void;
}

export function FriendsStep({ onComplete }: FriendsStepProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const { copied, copy } = useCopyToClipboard();
	const debouncedQuery = useDebounce(searchQuery, 300);

	const { data: suggestedUsers, isLoading: isSuggestedLoading } =
		trpc.onboarding.getSuggestedUsers.useQuery();

	const { data: searchResults, isFetching: isSearchLoading } =
		trpc.social.searchUsers.useQuery(
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
				if (error instanceof Error && error.name === "AbortError") {
					return;
				}
			}
		}

		await copy(url);
	};

	const usersToShow =
		debouncedQuery.length > 0 ? searchResults : suggestedUsers;

	return (
		<form
			id="onboarding-friends-form"
			onSubmit={(event) => {
				event.preventDefault();
				onComplete();
			}}
			className="space-y-6"
		>
			<div className="space-y-3 text-center">
				<div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-200">
					<Sparkles className="size-3.5" />
					Better together
				</div>
				<h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
					Find your friends
				</h2>
				<p className="text-sm text-muted-foreground sm:text-base">
					Follow friends to see their watchlists. When you both save the same
					movie, we&apos;ll let you know.
				</p>
			</div>

			<div className="relative">
				<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder="Search by name..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className="h-11 pl-9"
				/>
			</div>

			<div className="space-y-1">
				{!debouncedQuery && (
					<p className="px-1 text-xs font-medium text-muted-foreground">
						Suggested
					</p>
				)}
				<div className="max-h-72 space-y-1 overflow-y-auto rounded-xl border border-border/70 bg-card/40 p-2">
					{(isSuggestedLoading || isSearchLoading) && (
						<div className="space-y-2 p-1">
							{Array.from({ length: 4 }, (_, i) => (
								<div
									key={`friend-skeleton-${i}`}
									className="h-14 animate-pulse rounded-lg bg-muted"
								/>
							))}
						</div>
					)}

					{usersToShow && usersToShow.length > 0 ? (
						usersToShow.map((user) => (
							<div
								key={user.id}
								className="flex items-center gap-3 rounded-lg border border-transparent p-2 transition-colors hover:border-border/60 hover:bg-card"
							>
								<UserAvatar
									name={user.name ?? "?"}
									image={user.image}
									size="sm"
								/>
								<span className="flex-1 truncate text-sm font-medium">
									{user.name}
								</span>
								<FollowButton userId={user.id} isFollowing={user.isFollowing} />
							</div>
						))
					) : !isSuggestedLoading && !isSearchLoading ? (
						<p className="py-6 text-center text-sm text-muted-foreground">
							{debouncedQuery ? "No users found" : "No suggestions yet"}
						</p>
					) : null}
				</div>
			</div>

			<div className="space-y-2">
				<p className="text-center text-xs text-muted-foreground">
					Know someone who&apos;d like Miru?
				</p>
				<Button
					type="button"
					variant="outline"
					onClick={handleShare}
					className="h-11 w-full gap-2"
				>
					{copied ? <Check className="size-4" /> : <Copy className="size-4" />}
					{copied ? "Copied!" : "Copy invite link"}
				</Button>
			</div>
		</form>
	);
}
