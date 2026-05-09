import {
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { Colors, fontFamily, fontSize, radius, spacing } from "@/lib/constants";

interface ProfileStepProps {
	name: string;
	onChange: (name: string) => void;
}

export function ProfileStep({ name, onChange }: ProfileStepProps) {
	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : undefined}
			style={styles.container}
		>
			<View style={styles.header}>
				<Text style={styles.title}>What should we call you?</Text>
				<Text style={styles.subtitle}>
					Your name is shown to friends you follow.
				</Text>
			</View>
			<TextInput
				style={styles.input}
				value={name}
				onChangeText={onChange}
				placeholder="e.g. Alex Doe"
				placeholderTextColor={Colors.mutedForeground}
				autoComplete="name"
				autoCapitalize="words"
				autoCorrect={false}
				autoFocus
				maxLength={60}
				returnKeyType="done"
				accessibilityLabel="Your name"
			/>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: spacing[4],
		gap: spacing[6],
	},
	header: {
		gap: spacing[2],
	},
	title: {
		fontSize: fontSize["2xl"],
		fontFamily: fontFamily.displayBold,
		color: Colors.foreground,
	},
	subtitle: {
		fontSize: fontSize.base,
		fontFamily: fontFamily.sans,
		color: Colors.mutedForeground,
		lineHeight: 22,
	},
	input: {
		backgroundColor: Colors.muted,
		borderRadius: radius.lg,
		color: Colors.foreground,
		fontFamily: fontFamily.sans,
		fontSize: fontSize.lg,
		paddingHorizontal: spacing[4],
		paddingVertical: spacing[4],
	},
});
