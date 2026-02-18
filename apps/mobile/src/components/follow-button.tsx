import { Pressable, Text, StyleSheet, ActivityIndicator } from "react-native";
import { trpc } from "@/lib/trpc";
import { Colors, fontSize, fontFamily, spacing, radius } from "@/lib/constants";

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
}

export function FollowButton({ userId, isFollowing }: FollowButtonProps) {
  const utils = trpc.useUtils();

  function invalidate() {
    utils.user.getById.invalidate({ id: userId });
    utils.social.getFollowers.invalidate();
    utils.social.getFollowing.invalidate();
  }

  const follow = trpc.social.follow.useMutation({ onSuccess: invalidate });
  const unfollow = trpc.social.unfollow.useMutation({ onSuccess: invalidate });

  const loading = follow.isPending || unfollow.isPending;

  function handlePress() {
    if (isFollowing) {
      unfollow.mutate({ friendId: userId });
    } else {
      follow.mutate({ friendId: userId });
    }
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        isFollowing ? styles.following : styles.notFollowing,
        pressed && styles.pressed,
      ]}
      onPress={handlePress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isFollowing ? Colors.foreground : Colors.primaryForeground}
        />
      ) : (
        <Text
          style={[
            styles.text,
            isFollowing ? styles.followingText : styles.notFollowingText,
          ]}
        >
          {isFollowing ? "Following" : "Follow"}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
  },
  notFollowing: {
    backgroundColor: Colors.primary,
  },
  following: {
    backgroundColor: Colors.secondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pressed: {
    opacity: 0.8,
  },
  text: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.sansSemibold,
  },
  notFollowingText: {
    color: Colors.primaryForeground,
  },
  followingText: {
    color: Colors.foreground,
  },
});
