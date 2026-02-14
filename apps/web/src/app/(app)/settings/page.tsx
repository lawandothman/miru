import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { UserAvatar } from "@/components/user-avatar";
import { EditProfileForm } from "./edit-profile-form";
import { ThemeSwitcher } from "./theme-switcher";
import { SessionsList } from "./sessions-list";
import { DangerZone } from "./danger-zone";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/signin");
	}

	const { user } = session;

	return (
		<div className="mx-auto max-w-2xl space-y-10">
			<h1 className="font-display text-2xl font-bold tracking-tight">
				Settings
			</h1>

			<div className="overflow-hidden rounded-2xl border bg-card">
				<div className="h-24 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent" />
				<div className="px-6 pb-6">
					<div className="-mt-10 flex items-end gap-4">
						<div className="shrink-0 rounded-full bg-card p-1">
							<UserAvatar
								name={user.name}
								image={user.image ?? null}
								size="xl"
							/>
						</div>
						<div className="min-w-0 pb-1">
							<h2 className="truncate font-display text-lg font-semibold">
								{user.name}
							</h2>
							<p className="truncate text-sm text-muted-foreground">
								{user.email}
							</p>
						</div>
					</div>
				</div>
			</div>

			<SettingsSection title="Profile">
				<EditProfileForm currentName={user.name} />
			</SettingsSection>

			<SettingsSection title="Appearance">
				<ThemeSwitcher />
			</SettingsSection>

			<SettingsSection title="Sessions">
				<SessionsList currentSessionId={session.session.id} />
			</SettingsSection>

			<DangerZone />
		</div>
	);
}

function SettingsSection({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-3">
			<h2 className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground">
				{title}
			</h2>
			<div className="rounded-2xl border bg-card p-5">{children}</div>
		</div>
	);
}
