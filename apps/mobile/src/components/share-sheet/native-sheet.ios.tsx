import type { ReactElement } from "react";
import { StyleSheet } from "react-native";
import {
	BottomSheet,
	Group,
	Host,
	RNHostView,
	VStack,
} from "@expo/ui/swift-ui";
import { presentationDragIndicator } from "@expo/ui/swift-ui/modifiers";

export function NativeSheet({
	visible,
	onClose,
	children,
}: {
	visible: boolean;
	onClose: () => void;
	children: ReactElement;
}) {
	return (
		<Host style={StyleSheet.absoluteFill}>
			<VStack>
				<BottomSheet
					isPresented={visible}
					onIsPresentedChange={(presented: boolean) => {
						if (!presented) onClose();
					}}
					fitToContents
				>
					<Group modifiers={[presentationDragIndicator("visible")]}>
						<RNHostView matchContents>{children}</RNHostView>
					</Group>
				</BottomSheet>
			</VStack>
		</Host>
	);
}
