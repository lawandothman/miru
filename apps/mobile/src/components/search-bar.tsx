import { Text, Pressable, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Search } from "lucide-react-native";
import { Colors, fontSize, fontFamily, spacing, radius } from "@/lib/constants";

export function SearchBar() {
	const router = useRouter();

	return (
		<Pressable
			style={({ pressed }) => [styles.container, pressed && styles.pressed]}
			onPress={() => router.push("/discover/search")}
		>
			<Search size={18} color={Colors.mutedForeground} />
			<Text style={styles.placeholder}>Search movies & people...</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: Colors.secondary,
		borderRadius: radius.lg,
		paddingHorizontal: spacing[3],
		marginHorizontal: spacing[4],
		height: 44,
		gap: spacing[2],
	},
	pressed: {
		opacity: 0.7,
	},
	placeholder: {
		flex: 1,
		color: Colors.mutedForeground,
		fontSize: fontSize.base,
		fontFamily: fontFamily.sans,
	},
});
