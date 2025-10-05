import { PFC_LABELS } from "@/constants/pfc";
import theme from "@/styles/theme";
import { Nutrition } from "@/types/dto/eatingDto";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import CircleProgress from "../common/CircleProgress";
import Value from "./Value";

const screenWidth = Dimensions.get("window").width / 2.4;

type Props = {
  total?: Nutrition;
  goal?: Nutrition;
  rate?: Nutrition;
};

export default function Summary({ total, goal, rate }: Props) {
  const data = [
    rate?.protein ? rate.protein : 0,
    rate?.fat ? rate.fat : 0,
    rate?.carbo ? rate.carbo : 0,
  ];

  return (
    <View style={styles.summaryContainer}>
      <View>
        <CircleProgress size={screenWidth} percentages={data} />
      </View>
      <View style={styles.values}>
        <Text>総摂取カロリー/目標値</Text>
        <View style={styles.totalValues}>
          <Value intake={total?.calories} goal={goal?.calories} />
          <Text>kcal</Text>
        </View>
        <View style={styles.border}></View>
        {PFC_LABELS.map(({ key, label }) => (
          <View style={styles.pfcValue} key={key}>
            <Text>{label}</Text>
            <Value
              intake={total?.[key as keyof Nutrition]}
              goal={goal?.[key as keyof Nutrition]}
            />
            <Text>g</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryContainer: {
    borderRadius: 8,
    width: "90%",
    alignSelf: "center",
    backgroundColor: theme.colors.background.light,
    marginBottom: theme.spacing[5],
    padding: theme.spacing[3],
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  values: {
    width: "45%",
  },
  totalValues: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: theme.spacing[2],
  },
  border: {
    width: "100%",
    height: 1,
    backgroundColor: theme.colors.black,
  },
  pfcValue: {
    flexDirection: "row",
    paddingHorizontal: theme.spacing[2],
    paddingTop: theme.spacing[2],
    justifyContent: "space-between",
  },
});
