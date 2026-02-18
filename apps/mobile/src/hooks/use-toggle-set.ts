import { useMemo, useState } from "react";

export function useToggleSet(initialIds: number[] | undefined) {
	const stableKey = initialIds?.join(",") ?? "";
	// oxlint-disable-next-line exhaustive-deps
	const initialSet = useMemo(() => new Set(initialIds ?? []), [stableKey]);
	const [selected, setSelected] = useState<Set<number>>(new Set());
	const [appliedKey, setAppliedKey] = useState("");

	if (stableKey && stableKey !== appliedKey) {
		setAppliedKey(stableKey);
		setSelected(initialSet);
	}

	function toggle(id: number) {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	}

	function hasChanged(original: number[] | undefined): boolean {
		if (!original) {
			return false;
		}
		return (
			selected.size !== original.length ||
			[...selected].some((id) => !original.includes(id))
		);
	}

	return { selected, toggle, hasChanged } as const;
}
