import type { Metadata } from "next";
import { SentryTestButtons } from "./sentry-test-buttons";

export const metadata: Metadata = { title: "Sentry Test" };

function triggerServerError(): never {
	throw new Error("Sentry Test: Server Component error");
}

export default async function SentryTestPage({
	searchParams,
}: {
	searchParams: Promise<Record<string, string | undefined>>;
}) {
	const params = await searchParams;

	if (params["server-error"] === "1") {
		triggerServerError();
	}

	return (
		<div className="mx-auto max-w-2xl space-y-8">
			<div>
				<h1 className="font-display text-2xl font-bold tracking-tight">
					Sentry Test
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Trigger errors across different runtimes to verify Sentry is capturing
					them.
				</p>
			</div>

			<SentryTestButtons />
		</div>
	);
}
