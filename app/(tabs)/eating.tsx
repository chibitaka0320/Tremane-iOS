import EatingRow from "@/components/eating/EatingRow";
import Summary from "@/components/eating/Summary";
import { PFC_LABELS } from "@/constants/pfc";
import theme from "@/styles/theme";
import { EatType } from "@/types/eating";
import { View, StyleSheet, ScrollView, Text, FlatList } from "react-native";

const data: EatType = {
  date: "2025-06-05",
  total: {
    calories: 807,
    protein: 51,
    fat: 14,
    carb: 121,
  },
  goal: {
    calories: 1528,
    protein: 153,
    fat: 34,
    carb: 153,
  },
  rate: {
    calories: 1,
    protein: 0.4,
    fat: 0.2,
    carb: 0.8,
  },
  meals: [
    {
      id: 1,
      name: "卵かけ納豆ご飯",
      calories: 423,
      protein: 19,
      fat: 10,
      carb: 65,
    },
    {
      id: 2,
      name: "プロテイン",
      calories: 103,
      protein: 21,
      fat: 2,
      carb: 2,
    },
    {
      id: 3,
      name: "そば",
      calories: 281,
      protein: 11,
      fat: 2,
      carb: 54,
    },
  ],
};

export default function EatingScreen() {
  return (
    <ScrollView style={styles.container}>
      <Summary total={data.total} goal={data.goal} rate={data.rate} />
      <View style={styles.eatingContainer}>
        <View style={styles.row}>
          <Text style={styles.eating}>食べ物</Text>
          <Text style={styles.calories}>カロリー</Text>
          {PFC_LABELS.map(({ key, label }) => (
            <Text style={styles.pfc} key={key}>
              {label}
            </Text>
          ))}
        </View>
        <View style={styles.border}></View>
        <FlatList
          data={data.meals}
          renderItem={({ item }) => <EatingRow meal={item} />}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.main,
    paddingVertical: theme.spacing[5],
  },
  eatingContainer: {
    borderRadius: 8,
    width: "90%",
    alignSelf: "center",
    backgroundColor: theme.colors.background.light,
    marginBottom: theme.spacing[5],
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
  calories: {
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
