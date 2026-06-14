import {
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { fontFamily, fontSize, radius, spacing } from "@/lib/constants";
import { useTheme, useThemedStyles, type ThemeColors } from "@/lib/theme";

interface ProfileStepProps {
	name: string;
	onChange: (name: string) => void;
}

export function ProfileStep({ name, onChange }: ProfileStepProps) {
	const { colors } = useTheme();
	const styles = useThemedStyles(createStyles);
	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : undefined}
			style={styles.container}
		>
			<View style={styles.header}>
				<Text style={styles.title}>What should we call you?</Text>
			</View>
			<TextInput
				style={styles.input}
				value={name}
				onChangeText={onChange}
				placeholder="e.g. Alex Doe"
				placeholderTextColor={colors.mutedForeground}
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

const createStyles = (colors: ThemeColors) =>
	StyleSheet.create({
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
			color: colors.foreground,
		},
		input: {
			backgroundColor: colors.muted,
			borderRadius: radius.lg,
			color: colors.foreground,
			fontFamily: fontFamily.sans,
			fontSize: fontSize.lg,
			paddingHorizontal: spacing[4],
			paddingVertical: spacing[4],
		},
	});
