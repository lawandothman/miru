"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { UserAvatar } from "@/components/user-avatar";

const MAX_SIZE = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
]);

interface AvatarUploadProps {
	name: string;
	image: string | null;
}

export function AvatarUpload({ name, image }: AvatarUploadProps) {
	const [isUploading, setIsUploading] = useState(false);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const router = useRouter();

	async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!ALLOWED_TYPES.has(file.type)) {
			toast.error("Please select a JPEG, PNG, WebP, or GIF image");
			return;
		}
		if (file.size > MAX_SIZE) {
			toast.error("Image must be under 4MB");
			return;
		}

		const objectUrl = URL.createObjectURL(file);
		setPreviewUrl(objectUrl);
		setIsUploading(true);

		try {
			const formData = new FormData();
			formData.append("file", file);

			const res = await fetch("/api/upload-avatar", {
				method: "POST",
				body: formData,
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Upload failed");
			}

			toast.success("Photo updated");
			router.refresh();
		} catch (err) {
			setPreviewUrl(null);
			toast.error(
				err instanceof Error ? err.message : "Failed to upload photo",
			);
		} finally {
			setIsUploading(false);
			URL.revokeObjectURL(objectUrl);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	}

	return (
		<button
			type="button"
			onClick={() => fileInputRef.current?.click()}
			disabled={isUploading}
			className="group relative shrink-0 rounded-full bg-card p-1"
			aria-label="Change profile photo"
		>
			<UserAvatar name={name} image={previewUrl ?? image} size="xl" />
			<div className="absolute inset-1 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
				{isUploading ? (
					<Spinner className="size-5 text-white" />
				) : (
					<Camera className="size-5 text-white" />
				)}
			</div>
			<input
				ref={fileInputRef}
				type="file"
				accept="image/jpeg,image/png,image/webp,image/gif"
				onChange={handleFileChange}
				className="hidden"
				aria-hidden="true"
			/>
		</button>
	);
}
