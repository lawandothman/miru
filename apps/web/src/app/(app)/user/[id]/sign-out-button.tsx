"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export function SignOutButton() {
	const router = useRouter();

	return (
		<Button
			variant="outline"
			size="sm"
			className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
			onClick={async () => {
				await signOut();
				router.push("/");
			}}
		>
			<LogOut className="size-3.5" />
			Sign Out
		</Button>
	);
}
