import { View, Text, Pressable, StyleSheet } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { Colors, fontSize, fontFamily, spacing, radius } from "@/lib/constants";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Icon size={48} color={Colors.mutedForeground} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction && (
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.pressed]}
          onPress={onAction}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing[8],
    gap: spacing[3],
  },
  title: {
    fontSize: fontSize.xl,
    fontFamily: fontFamily.sansSemibold,
    color: Colors.foreground,
    marginTop: spacing[2],
  },
  description: {
    fontSize: fontSize.sm,
    color: Colors.mutedForeground,
    textAlign: "center",
    lineHeight: 20,
  },
  button: {
    marginTop: spacing[4],
    backgroundColor: Colors.primary,
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    borderRadius: radius.lg,
  },
  pressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: Colors.primaryForeground,
    fontSize: fontSize.sm,
    fontFamily: fontFamily.sansSemibold,
  },
});
