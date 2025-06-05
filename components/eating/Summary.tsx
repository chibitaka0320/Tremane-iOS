import { View, Text, StyleSheet, Dimensions } from "react-native";
import { ProgressChart } from "react-native-chart-kit";
import Value from "./Value";
import theme from "@/styles/theme";

const data = {
  data: [0.4, 0.6, 0.8],
};

const screenWidth = Dimensions.get("window").width / 2.4;

const chartConfig = {
  backgroundGradientFrom: "#FFFFFF",
  backgroundGradientTo: "#FFFFFF",
  color: (opacity = 1) => `rgba(99, 176, 242, ${opacity})`,
};

export default function Summary() {
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
          <Value intake={900} goal={2000} />
          <Text>kcal</Text>
        </View>
        <View style={styles.border}></View>
        <View style={styles.pfcValue}>
          <Text>P</Text>
          <Value intake={51} goal={153} />
          <Text>g</Text>
        </View>
        <View style={styles.pfcValue}>
          <Text>F</Text>
          <Value intake={14} goal={34} />
          <Text>g</Text>
        </View>
        <View style={styles.pfcValue}>
          <Text>P</Text>
          <Value intake={121} goal={153} />
          <Text>g</Text>
        </View>
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
    marginBottom: theme.spacing[4],
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
