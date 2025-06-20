import theme from "@/styles/theme";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function Indicator() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator color={theme.colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
