"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Trash2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { authClient, signOut } from "@/lib/auth-client";

export function DangerZone() {
	const router = useRouter();
	const [isSigningOut, setIsSigningOut] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteConfirmation, setDeleteConfirmation] = useState("");
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	async function handleSignOut() {
		setIsSigningOut(true);
		try {
			await signOut();
			router.push("/");
		} catch {
			toast.error("Failed to sign out");
			setIsSigningOut(false);
		}
	}

	async function handleDeleteAccount() {
		setIsDeleting(true);
		try {
			await authClient.deleteUser({
				callbackURL: "/",
			});
			router.push("/");
		} catch {
			toast.error("Failed to delete account");
			setIsDeleting(false);
		}
	}

	return (
		<div className="space-y-3">
			<h2 className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
				Account
			</h2>
			<div className="space-y-3">
				<Button
					variant="outline"
					onClick={handleSignOut}
					disabled={isSigningOut}
					className="w-full justify-start gap-3"
					size="lg"
				>
					{isSigningOut ? <Spinner /> : <LogOut className="size-4" />}
					Sign out
				</Button>

				<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
					<DialogTrigger asChild>
						<Button
							variant="outline"
							className="w-full justify-start gap-3 border-destructive/30 text-destructive hover:bg-destructive/5 hover:text-destructive"
							size="lg"
						>
							<Trash2 className="size-4" />
							Delete account
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Delete account</DialogTitle>
							<DialogDescription>
								This will permanently delete your account, watchlist, watch
								history, and all associated data. This action cannot be undone.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-2">
							<p className="text-sm text-muted-foreground">
								Type{" "}
								<strong className="text-foreground">delete my account</strong>{" "}
								to confirm.
							</p>
							<Input
								value={deleteConfirmation}
								onChange={(e) => setDeleteConfirmation(e.target.value)}
								placeholder="delete my account"
								autoComplete="off"
							/>
						</div>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => {
									setShowDeleteDialog(false);
									setDeleteConfirmation("");
								}}
							>
								Cancel
							</Button>
							<Button
								variant="destructive"
								onClick={handleDeleteAccount}
								disabled={
									deleteConfirmation !== "delete my account" || isDeleting
								}
							>
								{isDeleting && <Spinner className="size-3.5" />}
								Delete account
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
