import { PFC_LABELS } from "@/constants/pfc";
import theme from "@/styles/theme";
import { Meal, Nutrition } from "@/types/dto/eatingDto";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  meal: Meal;
  total: Nutrition;
  foodCount: number;
};

export default function MealRow({ meal, total, foodCount }: Props) {
  const onPress = () => {
    router.push({
      pathname: "/(main)/(edit)/meal/detail",
      params: { mealId: meal.mealId },
    });
  };

  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={styles.eating}>
        <Text style={styles.name} numberOfLines={1}>
          {meal.name}
        </Text>
      </View>
      <View style={styles.calories}>
        <Text>{total.calories}</Text>
        <Text style={styles.unit}>kcal</Text>
      </View>
      {PFC_LABELS.map(({ key }) => (
        <View style={styles.pfc} key={key}>
          <Text style={styles.center}>{total[key]}</Text>
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
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[1],
  },
  name: {
    flexShrink: 1,
  },
  foodCount: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
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
