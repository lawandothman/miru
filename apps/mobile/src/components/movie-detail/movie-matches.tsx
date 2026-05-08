import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { UserAvatar } from "@/components/user-avatar";
import { Colors, fontSize, fontFamily, spacing } from "@/lib/constants";

interface MatchUser {
	id: string;
	name: string | null;
	image: string | null;
}

interface MovieMatchesProps {
	matches: MatchUser[];
}

export function MovieMatches({ matches }: MovieMatchesProps) {
	const router = useRouter();

	if (matches.length === 0) {
		return null;
	}

	return (
		<View style={styles.section}>
			<Text style={styles.sectionTitle}>Watch with</Text>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.matchesScroll}
			>
				{matches.map((match) => (
					<Pressable
						key={match.id}
						style={({ pressed }) => [
							styles.matchCard,
							pressed && styles.pressed,
						]}
						onPress={() => router.push(`/user/${match.id}`)}
					>
						<UserAvatar imageUrl={match.image} name={match.name} size={40} />
						<Text style={styles.matchName} numberOfLines={1}>
							{match.name?.split(" ")[0]}
						</Text>
					</Pressable>
				))}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	section: {
		gap: spacing[3],
	},
	sectionTitle: {
		fontSize: fontSize.base,
		fontFamily: fontFamily.displaySemibold,
		color: Colors.foreground,
	},
	matchesScroll: {
		gap: spacing[3],
	},
	matchCard: {
		alignItems: "center",
		gap: spacing[1],
		width: 64,
	},
	matchName: {
		fontSize: fontSize.xs,
		fontFamily: fontFamily.sans,
		color: Colors.mutedForeground,
		textAlign: "center",
	},
	pressed: {
		opacity: 0.7,
	},
});
