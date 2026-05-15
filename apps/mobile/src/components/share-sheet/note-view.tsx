import {
	ActivityIndicator,
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";
import { ChevronLeft } from "lucide-react-native";
import type { RecommendRecipient } from "@/hooks/use-recommendation-draft";
import { UserAvatar } from "@/components/user-avatar";
import { Colors, fontFamily, fontSize, radius, spacing } from "@/lib/constants";

const MAX_NOTE_LENGTH = 280;

interface NoteViewProps {
	recipient: RecommendRecipient;
	message: string;
	onMessageChange: (next: string) => void;
	sending: boolean;
	onBack: () => void;
	onSend: () => void;
}

export function NoteView({
	recipient,
	message,
	onMessageChange,
	sending,
	onBack,
	onSend,
}: NoteViewProps) {
	const remaining = MAX_NOTE_LENGTH - message.length;
	const overLimit = remaining < 0;

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Pressable
					style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
					onPress={onBack}
					disabled={sending}
					accessibilityRole="button"
					accessibilityLabel="Back"
				>
					<ChevronLeft size={22} color={Colors.foreground} />
				</Pressable>
				<Text style={styles.title}>Add a note</Text>
				<View style={styles.headerSpacer} />
			</View>

			<View style={styles.recipientCard}>
				<UserAvatar imageUrl={recipient.image} name={recipient.name} size={56} />
				<Text style={styles.recipientName}>{recipient.name}</Text>
			</View>

			<View style={styles.noteWrapper}>
				<TextInput
					style={styles.input}
					value={message}
					onChangeText={onMessageChange}
					placeholder="You'll love this..."
					placeholderTextColor={Colors.mutedForeground}
					multiline
					maxLength={MAX_NOTE_LENGTH + 20}
					editable={!sending}
				/>
				<Text
					style={[
						styles.counter,
						overLimit && styles.counterOver,
					]}
				>
					{remaining}
				</Text>
			</View>

			<Pressable
				style={({ pressed }) => [
					styles.sendBtn,
					pressed && !sending && styles.sendBtnPressed,
					(sending || overLimit) && styles.sendBtnDisabled,
				]}
				onPress={onSend}
				disabled={sending || overLimit}
				accessibilityRole="button"
				accessibilityLabel={`Send to ${recipient.name ?? "friend"}`}
			>
				{sending ? (
					<ActivityIndicator size="small" color={Colors.primaryForeground} />
				) : (
					<Text style={styles.sendLabel}>Send</Text>
				)}
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingTop: spacing[2],
		paddingHorizontal: spacing[4],
		paddingBottom: spacing[4],
		gap: spacing[4],
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacing[2],
	},
	backBtn: {
		width: 36,
		height: 36,
		borderRadius: 18,
		justifyContent: "center",
		alignItems: "center",
	},
	headerSpacer: {
		width: 36,
	},
	title: {
		flex: 1,
		fontSize: fontSize.lg,
		fontFamily: fontFamily.displaySemibold,
		color: Colors.foreground,
		textAlign: "center",
	},
	recipientCard: {
		alignItems: "center",
		gap: spacing[2],
		paddingVertical: spacing[2],
	},
	recipientName: {
		fontSize: fontSize.lg,
		fontFamily: fontFamily.displaySemibold,
		color: Colors.foreground,
	},
	noteWrapper: {
		backgroundColor: Colors.card,
		borderRadius: radius.lg,
		borderWidth: 1,
		borderColor: Colors.border,
		paddingHorizontal: spacing[3],
		paddingTop: spacing[3],
		paddingBottom: spacing[2],
		gap: spacing[1],
	},
	input: {
		minHeight: 96,
		fontSize: fontSize.base,
		fontFamily: fontFamily.sans,
		color: Colors.foreground,
		textAlignVertical: "top",
	},
	counter: {
		alignSelf: "flex-end",
		fontSize: fontSize.xs,
		fontFamily: fontFamily.sans,
		color: Colors.mutedForeground,
	},
	counterOver: {
		color: Colors.destructive,
	},
	sendBtn: {
		paddingVertical: spacing[3],
		borderRadius: radius.lg,
		backgroundColor: Colors.primary,
		alignItems: "center",
		justifyContent: "center",
	},
	sendBtnPressed: {
		opacity: 0.8,
	},
	sendBtnDisabled: {
		opacity: 0.4,
	},
	sendLabel: {
		fontSize: fontSize.base,
		fontFamily: fontFamily.sansSemibold,
		color: Colors.primaryForeground,
	},
	pressed: {
		opacity: 0.6,
	},
});
