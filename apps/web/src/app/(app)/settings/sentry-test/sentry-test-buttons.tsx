"use client";

import { useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { triggerServerActionError } from "./actions";

export function SentryTestButtons() {
	const router = useRouter();
	const [status, setStatus] = useState<Record<string, string>>({});

	const setResult = (key: string, value: string) => {
		setStatus((prev) => ({ ...prev, [key]: value }));
	};

	return (
		<div className="space-y-6">
			{/* Client-side errors */}
			<Section title="Client-side" description="Errors thrown in the browser">
				<Button
					variant="destructive"
					onClick={() => {
						throw new Error("Sentry Test: Client-side unhandled error");
					}}
				>
					Unhandled throw
				</Button>
				<Button
					variant="destructive"
					onClick={() => {
						Sentry.captureException(
							new Error("Sentry Test: Client-side captureException"),
						);
						setResult("captureException", "Sent via captureException()");
					}}
				>
					captureException
				</Button>
				<Button
					variant="destructive"
					onClick={() => {
						Sentry.captureMessage("Sentry Test: Client-side captureMessage");
						setResult("captureMessage", "Sent via captureMessage()");
					}}
				>
					captureMessage
				</Button>
				<StatusLine value={status["captureException"]} />
				<StatusLine value={status["captureMessage"]} />
			</Section>

			{/* Server Component error */}
			<Section
				title="Server Component"
				description="Error thrown during RSC render"
			>
				<Button
					variant="destructive"
					onClick={() => {
						router.push("/settings/sentry-test?server-error=1");
					}}
				>
					Trigger server component error
				</Button>
			</Section>

			{/* Server Action error */}
			<Section
				title="Server Action"
				description="Error thrown inside a server action"
			>
				<form action={triggerServerActionError}>
					<Button type="submit" variant="destructive">
						Trigger server action error
					</Button>
				</form>
			</Section>

			{/* API Route / Edge */}
			<Section
				title="API Route (Edge)"
				description="Error from an Edge API route"
			>
				<Button
					variant="destructive"
					onClick={async () => {
						setResult("edge", "Loading...");
						try {
							const res = await fetch("/api/sentry-test?type=error");
							const data = (await res.json()) as { error?: string };
							setResult("edge", `${res.status}: ${data.error ?? "unknown"}`);
						} catch (e) {
							setResult(
								"edge",
								`Fetch failed: ${e instanceof Error ? e.message : "unknown"}`,
							);
						}
					}}
				>
					Trigger Edge API error
				</Button>
				<Button
					variant="outline"
					onClick={async () => {
						setResult("edge", "Loading...");
						const res = await fetch("/api/sentry-test?type=capture");
						const data = (await res.json()) as { message?: string };
						setResult("edge", `${res.status}: ${data.message ?? "unknown"}`);
					}}
				>
					Edge captureException (non-throwing)
				</Button>
				<StatusLine value={status["edge"]} />
			</Section>

			{/* API Route (Node.js) */}
			<Section
				title="API Route (Node.js)"
				description="Error from a Node.js API route"
			>
				<Button
					variant="destructive"
					onClick={async () => {
						setResult("node", "Loading...");
						try {
							const res = await fetch("/api/sentry-test-node");
							const data = (await res.json()) as {
								error?: string;
								message?: string;
							};
							setResult(
								"node",
								`${res.status}: ${data.error ?? data.message ?? "unknown"}`,
							);
						} catch (e) {
							setResult(
								"node",
								`Fetch failed: ${e instanceof Error ? e.message : "unknown"}`,
							);
						}
					}}
				>
					Trigger Node.js API error
				</Button>
				<StatusLine value={status["node"]} />
			</Section>
		</div>
	);
}

function Section({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-3 rounded-2xl border bg-card p-5">
			<div>
				<h2 className="font-display text-sm font-semibold">{title}</h2>
				<p className="text-xs text-muted-foreground">{description}</p>
			</div>
			<div className="flex flex-wrap items-center gap-2">{children}</div>
		</div>
	);
}

function StatusLine({ value }: { value: string | undefined }) {
	if (!value) {
		return null;
	}
	return <p className="w-full text-xs text-muted-foreground">{value}</p>;
}
