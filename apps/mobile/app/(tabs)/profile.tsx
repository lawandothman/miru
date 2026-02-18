import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Settings } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useSession } from "@/lib/auth";
import { trpc } from "@/lib/trpc";
import { UserAvatar } from "@/components/user-avatar";
import { UserStats } from "@/components/user-stats";
import { MovieGrid } from "@/components/movie-grid";
import { Colors, fontSize, fontFamily, spacing, radius } from "@/lib/constants";
import { offsetPageParam } from "@/lib/pagination";

type Tab = "watchlist" | "watched";
const PAGE_SIZE = 30;

export default function ProfileScreen() {
  const { data: session } = useSession();
  const router = useRouter();
  const userId = session?.user?.id;
  const [activeTab, setActiveTab] = useState<Tab>("watchlist");

  const { data: profile } = trpc.user.getById.useQuery(
    { id: userId! },
    { enabled: Boolean(userId) },
  );

  const watchlist = trpc.watchlist.getMyWatchlist.useInfiniteQuery(
    { limit: PAGE_SIZE },
    {
      getNextPageParam: offsetPageParam(PAGE_SIZE),
      enabled: Boolean(userId),
    },
  );

  const watched = trpc.watched.getMyWatched.useInfiniteQuery(
    { limit: PAGE_SIZE },
    {
      getNextPageParam: offsetPageParam(PAGE_SIZE),
      enabled: Boolean(userId),
    },
  );

  const activeQuery = activeTab === "watchlist" ? watchlist : watched;
  const movies = activeQuery.data?.pages.flat() ?? [];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <MovieGrid
        movies={movies}
        isLoading={activeQuery.isLoading}
        hasNextPage={activeQuery.hasNextPage}
        fetchNextPage={activeQuery.fetchNextPage}
        isFetchingNextPage={activeQuery.isFetchingNextPage}
        onRefresh={activeQuery.refetch}
        isRefetching={activeQuery.isRefetching}
        ListHeaderComponent={
          <View style={styles.headerWrapper}>
            <View style={styles.settingsRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.settingsButton,
                  pressed && styles.pressed,
                ]}
                onPress={() => router.push("/settings")}
              >
                <Settings size={22} color={Colors.mutedForeground} />
              </Pressable>
            </View>
            <View style={styles.header}>
              <UserAvatar
                imageUrl={session?.user?.image}
                name={session?.user?.name}
                size={80}
              />
              <Text style={styles.name}>{session?.user?.name}</Text>
              <UserStats
                followerCount={profile?.followerCount ?? 0}
                followingCount={profile?.followingCount ?? 0}
              />
            </View>

            <View style={styles.tabs}>
              <Pressable
                style={[styles.tab, activeTab === "watchlist" && styles.tabActive]}
                onPress={() => setActiveTab("watchlist")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "watchlist" && styles.tabTextActive,
                  ]}
                >
                  Watchlist
                </Text>
              </Pressable>
              <Pressable
                style={[styles.tab, activeTab === "watched" && styles.tabActive]}
                onPress={() => setActiveTab("watched")}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === "watched" && styles.tabTextActive,
                  ]}
                >
                  Watched
                </Text>
              </Pressable>
            </View>

          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerWrapper: {
    gap: spacing[4],
    paddingBottom: spacing[4],
  },
  settingsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: spacing[2],
    paddingTop: spacing[2],
  },
  settingsButton: {
    padding: spacing[2],
  },
  pressed: {
    opacity: 0.7,
  },
  header: {
    alignItems: "center",
    gap: spacing[3],
  },
  name: {
    fontSize: fontSize["2xl"],
    fontFamily: fontFamily.displayBold,
    color: Colors.foreground,
  },
  tabs: {
    flexDirection: "row",
    marginHorizontal: spacing[4],
    backgroundColor: Colors.secondary,
    borderRadius: radius.lg,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing[2],
    alignItems: "center",
    borderRadius: radius.md,
  },
  tabActive: {
    backgroundColor: Colors.background,
  },
  tabText: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.sansMedium,
    color: Colors.mutedForeground,
  },
  tabTextActive: {
    color: Colors.foreground,
    fontFamily: fontFamily.sansSemibold,
  },
});
