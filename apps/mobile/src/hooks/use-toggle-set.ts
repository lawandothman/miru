import { useState, useEffect } from "react";

export function useToggleSet(initialIds: number[] | undefined) {
	const [selected, setSelected] = useState<Set<number>>(new Set());

	useEffect(() => {
		if (initialIds) {
			setSelected(new Set(initialIds));
		}
	}, [initialIds]);

	function toggle(id: number) {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}

	function hasChanged(original: number[] | undefined): boolean {
		if (!original) return false;
		return (
			selected.size !== original.length ||
			[...selected].some((id) => !original.includes(id))
		);
	}

	return { selected, toggle, hasChanged } as const;
}
