"use client";

import { useEffect, useState } from "react";
import { Monitor, Smartphone, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

interface SessionData {
	id: string;
	token: string;
	createdAt: string;
	updatedAt: string;
	expiresAt: string;
	ipAddress: string | null;
	userAgent: string | null;
}

interface SessionsListProps {
	currentSessionId: string;
}

function parseUserAgent(ua: string | null): {
	browser: string;
	os: string;
	isMobile: boolean;
} {
	if (!ua) {
		return { browser: "Unknown", isMobile: false, os: "Unknown" };
	}

	let browser = "Unknown";
	let os = "Unknown";
	const isMobile = /iPhone|iPad|Android|Mobile/i.test(ua);

	if (ua.includes("Edg/")) {
		browser = "Edge";
	} else if (ua.includes("Chrome/")) {
		browser = "Chrome";
	} else if (ua.includes("Firefox/")) {
		browser = "Firefox";
	} else if (ua.includes("Safari/")) {
		browser = "Safari";
	}

	if (ua.includes("Mac OS")) {
		os = "macOS";
	} else if (ua.includes("Windows")) {
		os = "Windows";
	} else if (ua.includes("iPhone") || ua.includes("iPad")) {
		os = "iOS";
	} else if (ua.includes("Android")) {
		os = "Android";
	} else if (ua.includes("Linux")) {
		os = "Linux";
	}

	return { browser, isMobile, os };
}

function timeAgo(dateStr: string): string {
	const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
	if (seconds < 60) {
		return "just now";
	}
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) {
		return `${minutes}m ago`;
	}
	const hours = Math.floor(minutes / 60);
	if (hours < 24) {
		return `${hours}h ago`;
	}
	const days = Math.floor(hours / 24);
	return `${days}d ago`;
}

export function SessionsList({ currentSessionId }: SessionsListProps) {
	const [sessions, setSessions] = useState<SessionData[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [revokingId, setRevokingId] = useState<string | null>(null);
	const [revokingAll, setRevokingAll] = useState(false);

	useEffect(() => {
		async function loadSessions() {
			try {
				const result = await authClient.listSessions();
				if (result.data) {
					setSessions(result.data as unknown as SessionData[]);
				}
			} catch {
				toast.error("Failed to load sessions");
			} finally {
				setIsLoading(false);
			}
		}
		loadSessions();
	}, []);

	async function revokeSession(token: string, sessionId: string) {
		setRevokingId(sessionId);
		try {
			await authClient.revokeSession({ token });
			setSessions((prev) => prev.filter((s) => s.id !== sessionId));
			toast.success("Session revoked");
		} catch {
			toast.error("Failed to revoke session");
		} finally {
			setRevokingId(null);
		}
	}

	async function revokeAllOther() {
		setRevokingAll(true);
		try {
			await authClient.revokeOtherSessions();
			setSessions((prev) => prev.filter((s) => s.id === currentSessionId));
			toast.success("All other sessions revoked");
		} catch {
			toast.error("Failed to revoke sessions");
		} finally {
			setRevokingAll(false);
		}
	}

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-8">
				<Spinner className="size-5 text-muted-foreground" />
			</div>
		);
	}

	const otherSessions = sessions.filter((s) => s.id !== currentSessionId);

	return (
		<div className="space-y-4">
			<p className="text-sm text-muted-foreground">
				Devices where you&apos;re signed in.
			</p>

			<div className="divide-y divide-border/50">
				{sessions.map((session) => {
					const { browser, os, isMobile } = parseUserAgent(session.userAgent);
					const isCurrent = session.id === currentSessionId;
					const DeviceIcon = isMobile ? Smartphone : Monitor;

					return (
						<div
							key={session.id}
							className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
						>
							<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
								<DeviceIcon className="size-5 text-muted-foreground" />
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-sm font-medium">
									{browser} on {os}
								</p>
								<p className="text-xs text-muted-foreground">
									{isCurrent
										? "Current session"
										: `Active ${timeAgo(session.updatedAt)}`}
									{session.ipAddress && ` · ${session.ipAddress}`}
								</p>
							</div>
							{isCurrent ? (
								<Badge
									variant="secondary"
									className="bg-primary/10 text-primary"
								>
									Current
								</Badge>
							) : (
								<Button
									variant="ghost"
									size="icon-xs"
									onClick={() => revokeSession(session.token, session.id)}
									disabled={revokingId === session.id}
									className="shrink-0 text-muted-foreground hover:text-destructive"
								>
									{revokingId === session.id ? (
										<Spinner className="size-3.5" />
									) : (
										<X className="size-3.5" />
									)}
								</Button>
							)}
						</div>
					);
				})}
			</div>

			{otherSessions.length > 0 && (
				<Button
					variant="outline"
					onClick={revokeAllOther}
					disabled={revokingAll}
					className="w-full"
				>
					{revokingAll && <Spinner />}
					Sign out of all other sessions
				</Button>
			)}
		</div>
	);
}
