import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Colors, fontFamily } from "@/lib/constants";

interface UserAvatarProps {
  imageUrl: string | null | undefined;
  name: string | null | undefined;
  size?: number;
}

export function UserAvatar({ imageUrl, name, size = 40 }: UserAvatarProps) {
  const initials = (name ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        contentFit="cover"
        transition={200}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.4 }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: Colors.secondary,
  },
  fallback: {
    backgroundColor: Colors.secondary,
    justifyContent: "center",
    alignItems: "center",
  },
  initials: {
    color: Colors.mutedForeground,
    fontFamily: fontFamily.sansSemibold,
  },
});
