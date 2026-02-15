import { del, put } from "@vercel/blob";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const MAX_SIZE = 4 * 1024 * 1024; // 4MB
const ALLOWED_TYPES = new Set([
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
]);

const EXT_MAP: Record<string, string> = {
	"image/gif": "gif",
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp",
};

function isVercelBlobUrl(url: string): boolean {
	try {
		return new URL(url).hostname.endsWith(".public.blob.vercel-storage.com");
	} catch {
		return false;
	}
}

export async function POST(request: Request) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const formData = await request.formData();
	const file = formData.get("file") as File | null;

	if (!file) {
		return NextResponse.json({ error: "No file provided" }, { status: 400 });
	}

	if (!ALLOWED_TYPES.has(file.type)) {
		return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
	}

	if (file.size > MAX_SIZE) {
		return NextResponse.json(
			{ error: "File too large (max 4MB)" },
			{ status: 400 },
		);
	}

	try {
		const ext = EXT_MAP[file.type] ?? "jpg";
		const blob = await put(
			`avatars/${session.user.id}/${Date.now()}.${ext}`,
			file,
			{ access: "public" },
		);

		const oldImage = session.user.image;

		await auth.api.updateUser({
			headers: await headers(),
			body: { image: blob.url },
		});

		if (oldImage && isVercelBlobUrl(oldImage)) {
			try {
				await del(oldImage);
			} catch {
				// Non-fatal: old blob becomes orphaned
			}
		}

		return NextResponse.json({ url: blob.url });
	} catch {
		return NextResponse.json(
			{ error: "Failed to upload photo" },
			{ status: 500 },
		);
	}
}
