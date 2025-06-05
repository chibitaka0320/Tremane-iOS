import theme from "@/styles/theme";
import { StyleSheet, Text, View } from "react-native";

export default function EatingRow() {
  return (
    <View style={styles.row}>
      <Text style={styles.eating}>卵かけご飯</Text>
      <View style={styles.kcal}>
        <Text>400</Text>
        <Text style={styles.unit}>kcal</Text>
      </View>
      <View style={styles.pfc}>
        <Text>40</Text>
        <Text style={styles.unit}>g</Text>
      </View>
      <View style={styles.pfc}>
        <Text>40</Text>
        <Text style={styles.unit}>g</Text>
      </View>
      <View style={styles.pfc}>
        <Text>40</Text>
        <Text style={styles.unit}>g</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginBottom: theme.spacing[2],
  },
  eating: {
    width: "30%",
  },
  kcal: {
    width: "30%",
    flexDirection: "row",
    justifyContent: "center",
  },
  pfc: {
    width: "13%",
    textAlign: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  unit: {
    paddingLeft: theme.spacing[1],
  },
});
