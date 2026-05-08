import { useState } from "react";
import {
	View,
	Text,
	TextInput,
	Pressable,
	Alert,
	StyleSheet,
} from "react-native";
import { authClient } from "@/lib/auth";
import { Spinner } from "@/components/spinner";
import { Colors, fontSize, fontFamily, spacing, radius } from "@/lib/constants";

interface EditNameFormProps {
	currentName: string;
}

export function EditNameForm({ currentName }: EditNameFormProps) {
	const [name, setName] = useState(currentName);
	const [isPending, setIsPending] = useState(false);

	const hasChanged = name.trim() !== currentName && name.trim().length > 0;

	async function handleSave() {
		setIsPending(true);
		try {
			await authClient.updateUser({ name: name.trim() });
			Alert.alert("Profile updated");
		} catch {
			Alert.alert("Error", "Failed to update profile");
		} finally {
			setIsPending(false);
		}
	}

	return (
		<View style={styles.nameRow}>
			<TextInput
				style={styles.textInput}
				value={name}
				onChangeText={setName}
				placeholder="Your name"
				placeholderTextColor={Colors.mutedForeground}
				returnKeyType="done"
				onSubmitEditing={() => hasChanged && handleSave()}
			/>
			{hasChanged && (
				<Pressable
					style={({ pressed }) => [
						styles.saveButton,
						pressed && styles.pressed,
					]}
					onPress={handleSave}
					disabled={isPending}
				>
					{isPending ? (
						<Spinner size={16} color={Colors.primaryForeground} />
					) : (
						<Text style={styles.saveButtonText}>Save</Text>
					)}
				</Pressable>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	nameRow: {
		flexDirection: "row",
		gap: spacing[3],
		alignItems: "center",
	},
	textInput: {
		flex: 1,
		backgroundColor: Colors.secondary,
		borderRadius: radius.lg,
		paddingHorizontal: spacing[3],
		paddingVertical: spacing[2],
		fontSize: fontSize.base,
		fontFamily: fontFamily.sans,
		color: Colors.foreground,
	},
	saveButton: {
		backgroundColor: Colors.primary,
		borderRadius: radius.lg,
		paddingHorizontal: spacing[4],
		paddingVertical: spacing[2],
		alignItems: "center",
		justifyContent: "center",
	},
	saveButtonText: {
		fontSize: fontSize.sm,
		fontFamily: fontFamily.sansSemibold,
		color: Colors.primaryForeground,
	},
	pressed: {
		opacity: 0.7,
	},
});
