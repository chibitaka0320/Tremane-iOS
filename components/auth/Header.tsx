import theme from "@/styles/theme";
import { View, StyleSheet, Image } from "react-native";

export const Header = () => {
  return (
    <View style={styles.container}>
      <Image style={styles.image} source={require("@/images/logo.png")} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
  },
  image: {
    width: "100%",
    height: 50,
    top: "55%",
  },
});
