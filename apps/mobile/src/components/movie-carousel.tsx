import { View, Text, FlatList, StyleSheet } from "react-native";
import { MoviePoster } from "./movie-poster";
import { Colors, fontSize, fontFamily, spacing } from "@/lib/constants";
import type { MovieSummary } from "@/lib/types";

interface MovieCarouselProps {
  title: string;
  movies: MovieSummary[];
}

export function MovieCarousel({ title, movies }: MovieCarouselProps) {
  if (movies.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        data={movies}
        keyExtractor={(item) => String(item.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <MoviePoster
            id={item.id}
            posterPath={item.posterPath}
            title={item.title}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[3],
  },
  title: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.sansSemibold,
    color: Colors.foreground,
    paddingHorizontal: spacing[4],
  },
  list: {
    paddingHorizontal: spacing[4],
    gap: spacing[3],
  },
});
