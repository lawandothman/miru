import { View, Text, Pressable, StyleSheet, Linking } from "react-native";
import { Image } from "expo-image";
import {
	Colors,
	providerLogoUrl,
	fontSize,
	fontFamily,
	spacing,
	radius,
} from "@/lib/constants";

interface StreamProvider {
	provider: { id: number; name: string; logoPath: string | null };
	url: string | null;
}

interface MovieProvidersProps {
	providers: StreamProvider[];
}

export function MovieProviders({ providers }: MovieProvidersProps) {
	if (providers.length === 0) {
		return null;
	}

	return (
		<View style={styles.section}>
			<Text style={styles.sectionTitle}>Available on</Text>
			<View style={styles.providers}>
				{providers.map((sp) => {
					const { url } = sp;
					return (
						<Pressable
							key={sp.provider.id}
							style={styles.providerCard}
							onPress={url ? () => Linking.openURL(url) : undefined}
						>
							<Image
								source={{ uri: providerLogoUrl(sp.provider.logoPath) }}
								style={styles.providerLogo}
								contentFit="cover"
							/>
							<Text style={styles.providerName} numberOfLines={1}>
								{sp.provider.name}
							</Text>
						</Pressable>
					);
				})}
			</View>
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
	providers: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: spacing[3],
	},
	providerCard: {
		alignItems: "center",
		gap: spacing[1],
		width: 64,
	},
	providerLogo: {
		width: 48,
		height: 48,
		borderRadius: radius.lg,
		backgroundColor: Colors.secondary,
	},
	providerName: {
		fontSize: 10,
		fontFamily: fontFamily.sans,
		color: Colors.mutedForeground,
		textAlign: "center",
	},
});
