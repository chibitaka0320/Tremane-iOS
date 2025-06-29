import { View, Text, StyleSheet, Dimensions } from "react-native";
import { ProgressChart } from "react-native-chart-kit";
import Value from "./Value";
import theme from "@/styles/theme";
import { Goal, Rate, Total } from "@/types/eating";
import { PFC_LABELS } from "@/constants/pfc";

const screenWidth = Dimensions.get("window").width / 2.4;

const chartConfig = {
  backgroundGradientFrom: "#FFFFFF",
  backgroundGradientTo: "#FFFFFF",
  color: (opacity = 1) => `rgba(99, 176, 242, ${opacity})`,
};

type Props = {
  total?: Total;
  goal?: Goal;
  rate?: Rate;
};

export default function Summary({ total, goal, rate }: Props) {
  const data = {
    data: [
      rate?.protein ? rate.protein : 0,
      rate?.fat ? rate.fat : 0,
      rate?.carbo ? rate.carbo : 0,
    ],
  };

  return (
    <View style={styles.summaryContainer}>
      <View>
        <ProgressChart
          data={data}
          width={screenWidth}
          height={screenWidth}
          strokeWidth={6}
          radius={40}
          chartConfig={chartConfig}
          hideLegend={true}
        />
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
              intake={total?.[key as keyof Total]}
              goal={goal?.[key as keyof Goal]}
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
