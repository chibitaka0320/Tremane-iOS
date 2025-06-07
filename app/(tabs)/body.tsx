import theme from "@/styles/theme";
import { View, Text, StyleSheet, Image } from "react-native";

export default function BodyScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.bodyContainer}>
        <View style={styles.item}>
          <Text style={styles.center}>FRONT</Text>
          <Image
            style={styles.img}
            source={require("@/images/noimage.jpg")}
            resizeMode="contain"
          />
        </View>
        <View style={styles.borderStyle}></View>
        <View style={styles.item}>
          <Text style={styles.center}>BACK</Text>
          <Image
            style={styles.img}
            source={require("@/images/noimage.jpg")}
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.main,
    paddingVertical: theme.spacing[4],
  },
  bodyContainer: {
    borderRadius: 8,
    width: "90%",
    height: 250,
    alignSelf: "center",
    backgroundColor: theme.colors.background.light,
    marginBottom: theme.spacing[4],
    padding: theme.spacing[3],
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
  },
  item: {
    height: "100%",
    width: "48%",
    alignItems: "center",
  },
  center: {
    textAlign: "center",
  },
  img: {
    width: "95%",
    height: "100%",
  },
  borderStyle: {
    height: "85%",
    width: 1,
    backgroundColor: theme.colors.black,
  },
});
