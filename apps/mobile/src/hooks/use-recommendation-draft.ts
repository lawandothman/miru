import { useCallback, useState } from "react";

export type RecommendMode = "actions" | "picker";

export interface RecommendRecipient {
	id: string;
	name: string | null;
	image: string | null;
}

export function useRecommendationDraft() {
	const [mode, setMode] = useState<RecommendMode>("actions");

	const reset = useCallback(() => {
		setMode("actions");
	}, []);

	const startPicking = useCallback(() => {
		setMode("picker");
	}, []);

	const back = useCallback(() => {
		setMode("actions");
	}, []);

	return {
		back,
		mode,
		reset,
		startPicking,
	};
}
