import theme from "@/styles/theme";
import { Meal } from "@/types/eating";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  meal: Meal;
};

export default function EatingRow({ meal }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.eating}>{meal.name}</Text>
      <View style={styles.kcal}>
        <Text>{meal.kcal}</Text>
        <Text style={styles.unit}>kcal</Text>
      </View>
      <View style={styles.pfc}>
        <Text>{meal.protein}</Text>
        <Text style={styles.unit}>g</Text>
      </View>
      <View style={styles.pfc}>
        <Text>{meal.fat}</Text>
        <Text style={styles.unit}>g</Text>
      </View>
      <View style={styles.pfc}>
        <Text>{meal.carb}</Text>
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
