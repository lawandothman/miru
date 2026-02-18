import { View, Text, StyleSheet } from "react-native";
import { Colors, fontSize, fontFamily, spacing } from "@/lib/constants";

interface UserStatsProps {
  followerCount: number;
  followingCount: number;
}

export function UserStats({ followerCount, followingCount }: UserStatsProps) {
  return (
    <View style={styles.stats}>
      <View style={styles.stat}>
        <Text style={styles.statValue}>{followerCount}</Text>
        <Text style={styles.statLabel}>Followers</Text>
      </View>
      <View style={styles.stat}>
        <Text style={styles.statValue}>{followingCount}</Text>
        <Text style={styles.statLabel}>Following</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stats: {
    flexDirection: "row",
    gap: spacing[8],
    marginTop: spacing[2],
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.sansBold,
    color: Colors.foreground,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: Colors.mutedForeground,
  },
});
