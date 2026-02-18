import { View, ActivityIndicator, StyleSheet } from "react-native";
import { Colors } from "@/lib/constants";

export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={Colors.primary} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
});
