import EatingRow from "@/components/eating/EatingRow";
import Summary from "@/components/eating/Summary";
import theme from "@/styles/theme";
import { EatType } from "@/types/eating";
import { View, StyleSheet, ScrollView, Text } from "react-native";

const data: EatType = {
  date: "2025-06-05",
  total: {
    kcal: 807,
    protein: 51,
    fat: 14,
    carbo: 121,
  },
  goal: {
    kcal: 1528,
    protein: 153,
    fat: 34,
    carbo: 153,
  },
  meals: [
    {
      id: 1,
      name: "卵かけ納豆ご飯",
      kcal: 423,
      protein: 19,
      fat: 10,
      carbo: 65,
    },
    {
      id: 2,
      name: "プロテイン",
      kcal: 103,
      protein: 21,
      fat: 2,
      carbo: 2,
    },
    {
      id: 3,
      name: "そば",
      kcal: 281,
      protein: 11,
      fat: 2,
      carbo: 54,
    },
  ],
};

export default function EatingScreen() {
  return (
    <ScrollView style={styles.container}>
      <Summary />
      <View style={styles.eatingContainer}>
        <View style={styles.row}>
          <Text style={styles.eating}>食べ物</Text>
          <Text style={styles.kcal}>カロリー</Text>
          <Text style={styles.pfc}>P</Text>
          <Text style={styles.pfc}>F</Text>
          <Text style={styles.pfc}>C</Text>
        </View>
        <View style={styles.border}></View>
        <EatingRow />
        <EatingRow />
        <EatingRow />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.main,
    paddingVertical: theme.spacing[4],
  },
  eatingContainer: {
    borderRadius: 8,
    width: "90%",
    alignSelf: "center",
    backgroundColor: theme.colors.background.light,
    marginBottom: theme.spacing[4],
    padding: theme.spacing[3],
  },
  row: {
    flexDirection: "row",
  },
  eating: {
    width: "30%",
    textAlign: "center",
    fontWeight: "bold",
  },
  kcal: {
    width: "30%",
    textAlign: "center",
    fontWeight: "bold",
  },
  pfc: {
    width: "13%",
    textAlign: "center",
    fontWeight: "bold",
  },
  border: {
    width: "100%",
    height: 1,
    backgroundColor: theme.colors.black,
    marginVertical: theme.spacing[3],
  },
});
