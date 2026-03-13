import Image from "next/image";
import { APP_STORE_URL } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function AppStoreButton({ className }: { className?: string }) {
	return (
		<a
			href={APP_STORE_URL}
			target="_blank"
			rel="noreferrer"
			aria-label="Download Miru on the App Store"
			className={cn(
				"inline-flex rounded-[13px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
				className,
			)}
		>
			<Image
				src="/app-store-badge.svg"
				alt="Download on the App Store"
				width={156}
				height={52}
				className="h-[52px] w-auto dark:hidden"
			/>
			<Image
				src="/app-store-badge-dark.svg"
				alt="Download on the App Store"
				width={156}
				height={52}
				className="hidden h-[52px] w-auto dark:block"
			/>
		</a>
	);
}
