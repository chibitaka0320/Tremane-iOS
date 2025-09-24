import { PFC_LABELS } from "@/constants/pfc";
import theme from "@/styles/theme";
import { MealRecord } from "@/types/dto/eatingDto";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  meal: MealRecord;
};

export default function EatingRow({ meal }: Props) {
  const onEating = () => {
    router.push({
      pathname: "/(main)/(edit)/eating/edit",
      params: { eatingId: meal.eatingId },
    });
  };

  return (
    <TouchableOpacity style={styles.row} onPress={onEating}>
      <Text style={styles.eating}>{meal.name}</Text>
      <View style={styles.calories}>
        <Text>{meal.calories}</Text>
        <Text style={styles.unit}>kcal</Text>
      </View>
      {PFC_LABELS.map(({ key }) => (
        <View style={styles.pfc} key={key}>
          <Text style={styles.center}>{meal[key as keyof MealRecord]}</Text>
          <Text style={styles.unit}>g</Text>
        </View>
      ))}
    </TouchableOpacity>
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
  calories: {
    width: "30%",
    flexDirection: "row",
    justifyContent: "center",
  },
  pfc: {
    width: "13%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  unit: {
    marginLeft: theme.spacing[1],
  },
  center: {
    textAlign: "center",
  },
});
