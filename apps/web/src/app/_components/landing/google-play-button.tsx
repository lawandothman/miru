import Image from "next/image";
import { PLAY_STORE_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function GooglePlayButton({ className }: { className?: string }) {
	return (
		<a
			href={PLAY_STORE_URL}
			target="_blank"
			rel="noreferrer"
			aria-label="Get Miru on Google Play"
			className={cn(
				"inline-flex rounded-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
				className,
			)}
		>
			<Image
				src="/play-store-badge.svg"
				alt="Get it on Google Play"
				width={175}
				height={52}
				className="h-[52px] w-auto"
			/>
		</a>
	);
}
