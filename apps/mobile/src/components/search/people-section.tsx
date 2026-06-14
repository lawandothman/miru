import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { FollowButton } from "@/components/follow-button";
import { UserAvatar } from "@/components/user-avatar";
import { fontFamily, fontSize, spacing } from "@/lib/constants";
import { useThemedStyles, type ThemeColors } from "@/lib/theme";

export interface SearchPerson {
	id: string;
	name: string | null;
	image: string | null;
	isFollowing: boolean;
}

export function PeopleSection({ people }: { people: SearchPerson[] }) {
	const router = useRouter();
	const styles = useThemedStyles(createStyles);

	return (
		<View style={styles.section}>
			<Text style={styles.sectionTitle}>People</Text>
			{people.map((user) => (
				<Pressable
					key={user.id}
					style={({ pressed }) => [
						styles.userRow,
						pressed && styles.userRowPressed,
					]}
					onPress={() => router.push(`/user/${user.id}`)}
				>
					<View style={styles.userInfo}>
						<UserAvatar imageUrl={user.image} name={user.name} size={40} />
						<Text style={styles.userName} numberOfLines={1}>
							{user.name ?? "Unknown"}
						</Text>
					</View>
					<FollowButton userId={user.id} isFollowing={user.isFollowing} />
				</Pressable>
			))}
		</View>
	);
}

const createStyles = (colors: ThemeColors) =>
	StyleSheet.create({
		section: {
			marginBottom: spacing[4],
		},
		sectionTitle: {
			color: colors.foreground,
			fontSize: fontSize.lg,
			fontFamily: fontFamily.displaySemibold,
			marginBottom: spacing[3],
		},
		userRow: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			paddingVertical: spacing[2.5],
		},
		userRowPressed: {
			opacity: 0.7,
		},
		userInfo: {
			flexDirection: "row",
			alignItems: "center",
			gap: spacing[3],
			flex: 1,
			marginRight: spacing[3],
		},
		userName: {
			color: colors.foreground,
			fontSize: fontSize.base,
			fontFamily: fontFamily.sansMedium,
			flex: 1,
		},
	});
