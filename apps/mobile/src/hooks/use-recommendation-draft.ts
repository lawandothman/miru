import { useCallback, useState } from "react";

export type RecommendMode = "actions" | "picker" | "note";

export interface RecommendRecipient {
	id: string;
	name: string | null;
	image: string | null;
}

export function useRecommendationDraft() {
	const [mode, setMode] = useState<RecommendMode>("actions");
	const [recipient, setRecipient] = useState<RecommendRecipient | null>(null);
	const [message, setMessage] = useState("");

	const reset = useCallback(() => {
		setMode("actions");
		setRecipient(null);
		setMessage("");
	}, []);

	const startPicking = useCallback(() => {
		setMode("picker");
	}, []);

	const chooseRecipient = useCallback((next: RecommendRecipient) => {
		setRecipient(next);
		setMode("note");
	}, []);

	const back = useCallback(() => {
		setMode((current) => {
			if (current === "note") return "picker";
			if (current === "picker") return "actions";
			return current;
		});
	}, []);

	return {
		back,
		chooseRecipient,
		message,
		mode,
		recipient,
		reset,
		setMessage,
		startPicking,
	};
}
