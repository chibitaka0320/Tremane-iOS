import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import theme from "@/styles/theme";
import { LineChart } from "react-native-chart-kit";
import { selectLabel } from "@/types/common";
import { getBodyPartsWithExercises } from "@/localDb/service/bodyPartService";
import { getTrainingByMaxWeight } from "@/localDb/service/trainingService";
import { TrainingAnalysis } from "@/types/training";
import { Octicons } from "@expo/vector-icons";
import { partsColors } from "@/styles/partsColor";

export default function AnalysisScreen() {
  const [bodyParts, setbodyParts] = useState("1");
  const [bodyPartOptions, setBodyPartOptions] = useState<selectLabel[]>([]);
  const [datas, setDatas] = useState<TrainingAnalysis[]>([]);

  // 部位・種別情報取得
  useEffect(() => {
    const fetchBodyParts = async () => {
      const res = await getBodyPartsWithExercises();
      if (res) {
        setBodyPartOptions(
          res.map((part) => ({
            label: part.name,
            value: String(part.partsId),
          }))
        );
      }
    };
    fetchBodyParts();
  }, []);

  const screenWidth = Dimensions.get("window").width;

  const chartConfig = {
    backgroundGradientFrom: theme.colors.background.light,
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: theme.colors.background.light,
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: theme.colors.primary,
      fill: theme.colors.primary,
    },
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getTrainingByMaxWeight(bodyParts);
        if (res) {
          setDatas(res);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetch();
  }, [bodyParts]);

  const dataRange = (target: TrainingAnalysis) => {
    const targetData = target.datasets[0].data;
    if (targetData.length === 0) return 0;
    const max = Math.max(...targetData);
    const min = Math.min(...targetData);

    return max - min;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.selectContainer}>
        {bodyPartOptions.map((item) => (
          <TouchableOpacity
            key={item.value}
            style={[
              styles.selectButton,
              bodyParts === item.value && {
                backgroundColor: partsColors[Number(item.value)],
              },
            ]}
            onPress={() => setbodyParts(item.value)}
          >
            <Text
              style={[
                styles.selectText,
                bodyParts === item.value && styles.selectedText,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {datas.length === 0 ? (
        <View style={styles.itemContainer}>
          <View style={styles.noContent}>
            <Octicons name="graph" size={56} color="black" />
            <Text style={styles.exercise}>データが存在しません</Text>
          </View>
        </View>
      ) : (
        datas.map((data) => (
          <View style={styles.itemContainer} key={data.name}>
            <Text style={styles.exercise}>{data.name}</Text>
            <LineChart
              data={data}
              width={screenWidth}
              height={200}
              chartConfig={chartConfig}
              withVerticalLines={false}
              withHorizontalLines={false}
              xLabelsOffset={5}
              yLabelsOffset={18}
              segments={dataRange(data) == 0 ? 2 : 4}
              bezier
            />
          </View>
        ))
      )}

      <View style={styles.footer}></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.main,
    padding: theme.spacing[3],
  },
  itemContainer: {
    backgroundColor: theme.colors.background.light,
    padding: theme.spacing[2],
    marginTop: theme.spacing[5],
    borderRadius: 5,
  },
  exercise: {
    textAlign: "center",
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
    marginVertical: theme.spacing[3],
  },
  noContent: {
    alignItems: "center",
    paddingVertical: theme.spacing[5],
  },

  // 選択肢レイアウト
  selectContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    borderRadius: 5,
    overflow: "hidden",
    backgroundColor: theme.colors.background.light,
    padding: theme.spacing[2],
  },
  selectButton: {
    padding: theme.spacing[2],
    margin: theme.spacing[2],
    backgroundColor: "#DDDDDD",
    width: 70,
  },
  selectedButton: {
    backgroundColor: theme.colors.primary,
  },
  selectText: {
    textAlign: "center",
  },
  selectedText: {
    color: theme.colors.white,
    fontWeight: "bold",
  },

  footer: {
    height: theme.spacing[7],
  },
});
