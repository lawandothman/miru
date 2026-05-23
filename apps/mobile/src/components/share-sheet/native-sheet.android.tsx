import { useEffect, useRef, useState, type ReactElement } from "react";
import { StyleSheet } from "react-native";
import {
	Host,
	ModalBottomSheet,
	type ModalBottomSheetRef,
	RNHostView,
} from "@expo/ui/jetpack-compose";

export function NativeSheet({
	visible,
	onClose,
	children,
}: {
	visible: boolean;
	onClose: () => void;
	children: ReactElement;
}) {
	const ref = useRef<ModalBottomSheetRef>(null);
	const [mounted, setMounted] = useState(visible);

	useEffect(() => {
		if (visible) {
			setMounted(true);
			return;
		}
		if (!mounted) return;
		// Play Compose's hide animation before unmounting on programmatic close.
		ref.current
			?.hide()
			.catch(() => undefined)
			.finally(() => setMounted(false));
	}, [visible, mounted]);

	if (!mounted) return null;

	return (
		<Host style={StyleSheet.absoluteFill} pointerEvents="box-none">
			<ModalBottomSheet
				ref={ref}
				onDismissRequest={() => {
					setMounted(false);
					onClose();
				}}
			>
				<RNHostView matchContents>{children}</RNHostView>
			</ModalBottomSheet>
		</Host>
	);
}
