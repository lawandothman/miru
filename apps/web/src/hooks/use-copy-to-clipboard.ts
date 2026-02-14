import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function useCopyToClipboard() {
	const [copied, setCopied] = useState(false);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	const copy = useCallback(async (text: string) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			toast("Link copied");

			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
			timeoutRef.current = setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Unable to copy link");
		}
	}, []);

	return { copied, copy };
}
