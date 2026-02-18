import { ScrollView, RefreshControl, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { trpc } from "@/lib/trpc";
import { SearchBar } from "@/components/search-bar";
import { MovieCarousel } from "@/components/movie-carousel";
import { Colors, spacing } from "@/lib/constants";

export default function DiscoverScreen() {
  const {
    data: sections,
    refetch,
    isRefetching,
  } = trpc.movie.getDiscoverSections.useQuery();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.mutedForeground}
          />
        }
      >
        <SearchBar />

        {sections && (
          <>
            <MovieCarousel title="Trending" movies={sections.trending} />
            <MovieCarousel title="New Releases" movies={sections.newReleases} />
            <MovieCarousel
              title="Popular on Miru"
              movies={sections.popularOnMiru}
            />
            <MovieCarousel
              title="Friends Watching"
              movies={sections.friendsWatching}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingTop: spacing[4],
    paddingBottom: spacing[8],
    gap: spacing[6],
  },
});
