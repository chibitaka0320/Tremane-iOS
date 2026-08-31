import { SelectLabel } from "@/components/common/PickerModal";
import { bodyPartImages } from "@/constants/bodyPartImages";
import { calcTrainingCalories } from "@/lib/calc";
import * as bodyPartService from "@/service/bodyPartService";
import * as trainingAnalysisService from "@/service/trainingAnalysisService";
import * as userProfileService from "@/service/userProfileService";
import { partsColors } from "@/styles/partsColor";
import theme from "@/styles/theme";
import {
  BodyPartSetShare,
  MonthlySummary,
  TrainingAnalysisChart,
  WeeklyVolume,
} from "@/types/dto/trainingDto";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";

const ALL_BODY_PARTS_VALUE = "0";

// トレーニング分析一覧画面
export default function AnalysisScreen() {
  const [bodyParts, setbodyParts] = useState(ALL_BODY_PARTS_VALUE);
  const [bodyPartOptions, setBodyPartOptions] = useState<SelectLabel[]>([]);
  const [datas, setDatas] = useState<TrainingAnalysisChart[]>([]);
  const [week, setWeek] = useState(0);
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(0);

  // 全体タブ用
  const [weightKg, setWeightKg] = useState<number | null>(null);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(
    null
  );
  const [weeklyVolume, setWeeklyVolume] = useState<WeeklyVolume[]>([]);
  const [bodyPartShare, setBodyPartShare] = useState<BodyPartSetShare[]>([]);

  const isAllBodyParts = bodyParts === ALL_BODY_PARTS_VALUE;

  // 部位・種別情報取得
  useEffect(() => {
    const fetchBodyParts = async () => {
      const res = await bodyPartService.getBodyPartsWithExercises();
      if (res) {
        setBodyPartOptions([
          { label: "全体", value: ALL_BODY_PARTS_VALUE },
          ...res.map((part) => ({
            label: part.partName,
            value: String(part.partsId),
          })),
        ]);
      }
    };
    fetchBodyParts();
  }, []);

  // ユーザープロフィール（体重）取得
  useEffect(() => {
    const fetchWeight = async () => {
      try {
        const profile = await userProfileService.getUserProfile();
        setWeightKg(profile ? profile.weight : null);
      } catch (e) {
        console.error(e);
      }
    };
    fetchWeight();
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

  const barChartConfig = {
    ...chartConfig,
    color: (opacity = 1) => `rgba(66, 169, 230, ${opacity})`,
    decimalPlaces: 0,
    barPercentage: 1.6,
  };

  // 総負荷量の推移グラフのY軸ラベル省略表示（例: 8000 → 8k）
  const formatVolumeLabel = (label: string) => {
    const value = Number(label);
    if (!Number.isFinite(value)) return label;
    if (Math.abs(value) >= 1000) {
      const kValue = value / 1000;
      return `${kValue % 1 === 0 ? kValue.toFixed(0) : kValue.toFixed(1)}k`;
    }
    return String(Math.round(value));
  };

  useEffect(() => {
    if (isAllBodyParts) return;

    const fetch = async () => {
      try {
        const res = await trainingAnalysisService.getTrainingByMaxWeight(
          Number(bodyParts)
        );
        if (res) {
          setDatas(res);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetch();
  }, [bodyParts, isAllBodyParts]);

  useEffect(() => {
    if (isAllBodyParts) return;

    const fetch = async () => {
      try {
        const res = await trainingAnalysisService.getWorkoutCount(
          Number(bodyParts)
        );
        if (res) {
          setWeek(res.week);
          setMonth(res.month);
          setYear(res.year);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetch();
  }, [bodyParts, isAllBodyParts]);

  // 全体タブ用サマリーデータ取得
  useEffect(() => {
    if (!isAllBodyParts) return;

    const fetch = async () => {
      try {
        const [summary, weeklyVolumeRes, bodyPartShareRes] =
          await Promise.all([
            trainingAnalysisService.getMonthlySummary(),
            trainingAnalysisService.getWeeklyVolumeTrend(),
            trainingAnalysisService.getBodyPartSetShare(),
          ]);
        setMonthlySummary(summary);
        setWeeklyVolume(weeklyVolumeRes);
        setBodyPartShare(bodyPartShareRes);
      } catch (e) {
        console.error(e);
      }
    };
    fetch();
  }, [isAllBodyParts]);

  const dataRange = (target: TrainingAnalysisChart) => {
    const targetData = target.datasets[0].data;
    if (targetData.length === 0) return 0;
    const max = Math.max(...targetData);
    const min = Math.min(...targetData);

    return max - min;
  };

  const estimatedCalories =
    monthlySummary && weightKg !== null
      ? calcTrainingCalories(monthlySummary.totalSets, weightKg)
      : null;

  return (
    <ScrollView style={styles.container}>
      {!isAllBodyParts && (
        <View style={styles.totalContainer}>
          <View>
            <Text style={styles.sumTitle}>WEEK</Text>
            <Text style={styles.sumResult}>
              {week} <Text style={styles.days}> days</Text>
            </Text>
          </View>
          <View>
            <Text style={styles.sumTitle}>MONTH</Text>
            <Text style={styles.sumResult}>
              {month} <Text style={styles.days}> days</Text>
            </Text>
          </View>
          <View>
            <Text style={styles.sumTitle}>YEAR</Text>
            <Text style={styles.sumResult}>
              {year} <Text style={styles.days}> days</Text>
            </Text>
          </View>
        </View>
      )}
      <View style={styles.analysisContainer}>
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

        {isAllBodyParts ? (
          <>
            <Text style={styles.sectionTitle}>今月のサマリー</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={theme.colors.secondary}
                />
                <Text style={styles.summaryLabel}>トレーニング日数</Text>
                <Text style={styles.summaryValue}>
                  {monthlySummary?.trainingDays ?? 0} 日
                </Text>
                <Text style={styles.summarySubText}>
                  週平均{monthlySummary?.weeklyAverage ?? 0}日
                </Text>
              </View>
              <View style={styles.summaryCard}>
                <Ionicons
                  name="barbell-outline"
                  size={20}
                  color={theme.colors.secondary}
                />
                <Text style={styles.summaryLabel}>総負荷量</Text>
                <Text style={styles.summaryValue}>
                  {(monthlySummary?.totalVolume ?? 0).toLocaleString()} kg
                </Text>
              </View>
              <View style={styles.summaryCard}>
                <Ionicons
                  name="list-outline"
                  size={20}
                  color={theme.colors.secondary}
                />
                <Text style={styles.summaryLabel}>総セット数</Text>
                <Text style={styles.summaryValue}>
                  {monthlySummary?.totalSets ?? 0} セット
                </Text>
              </View>
              <View style={styles.summaryCard}>
                <Ionicons
                  name="flame-outline"
                  size={20}
                  color={theme.colors.secondary}
                />
                <Text style={styles.summaryLabel}>消費カロリー</Text>
                {estimatedCalories !== null ? (
                  <Text style={styles.summaryValue}>
                    {estimatedCalories.toLocaleString()} kcal
                  </Text>
                ) : (
                  <Text style={styles.summaryNotice}>体重未設定</Text>
                )}
              </View>
            </View>

            <Text style={styles.sectionTitle}>総負荷量の推移（週別）</Text>
            <View style={[styles.itemContainer, styles.noMarginTop]}>
              <BarChart
                data={{
                  labels: weeklyVolume.map((w) => w.weekLabel),
                  datasets: [{ data: weeklyVolume.map((w) => w.volume) }],
                }}
                width={screenWidth - theme.spacing[3] * 2 - theme.spacing[2] * 2}
                height={200}
                chartConfig={{
                  ...barChartConfig,
                  formatYLabel: formatVolumeLabel,
                }}
                yAxisLabel=""
                yAxisSuffix=""
                fromZero
              />
            </View>

            <Text style={styles.sectionTitle}>
              部位別トレーニングバランス（セット数ベース）
            </Text>
            {bodyPartShare.length === 0 ? (
              <View style={[styles.nonDataContainer, styles.noMarginTop]}>
                <View style={styles.iconWrapper}>
                  <MaterialCommunityIcons
                    name="chart-bar"
                    size={64}
                    color={theme.colors.border.dark}
                  />
                  <View style={styles.iconBadge}>
                    <Ionicons name="add" size={16} color={theme.colors.white} />
                  </View>
                </View>
                <Text style={styles.text}>まだトレーニング記録がありません</Text>
                <Text style={styles.subText}>
                  トレーニングを記録すると{"\n"}分析結果が表示されます
                </Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => router.push("/(main)/(add)/training/add")}
                >
                  <Ionicons name="add" size={18} color={theme.colors.secondary} />
                  <Text style={styles.addButtonText}>トレーニングを記録</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.itemContainer, styles.noMarginTop]}>
                <View style={styles.balanceGrid}>
                  {bodyPartShare.map((part) => (
                    <View key={part.bodyPartId} style={styles.balanceItem}>
                      <Image
                        source={bodyPartImages[part.bodyPartId]}
                        style={styles.balanceImage}
                        resizeMode="contain"
                      />
                      <Text style={styles.balanceName}>
                        {part.bodyPartName}
                      </Text>
                      <Text style={styles.balancePercent}>
                        {part.percentage}%
                      </Text>
                    </View>
                  ))}
                </View>
                <View style={styles.stackedBar}>
                  {bodyPartShare.map((part) => (
                    <View
                      key={part.bodyPartId}
                      style={{
                        flex: part.percentage,
                        backgroundColor: partsColors[part.bodyPartId],
                      }}
                    />
                  ))}
                </View>
              </View>
            )}
          </>
        ) : datas.length === 0 ? (
          <View style={styles.nonDataContainer}>
            <View style={styles.iconWrapper}>
              <MaterialCommunityIcons
                name="chart-bar"
                size={64}
                color={theme.colors.border.dark}
              />
              <View style={styles.iconBadge}>
                <Ionicons name="add" size={16} color={theme.colors.white} />
              </View>
            </View>
            <Text style={styles.text}>まだトレーニング記録がありません</Text>
            <Text style={styles.subText}>
              トレーニングを記録すると{"\n"}分析結果が表示されます
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/(main)/(add)/training/add")}
            >
              <Ionicons name="add" size={18} color={theme.colors.secondary} />
              <Text style={styles.addButtonText}>トレーニングを記録</Text>
            </TouchableOpacity>
          </View>
        ) : (
          datas.map((data, index) => (
            <View style={styles.itemContainer} key={index}>
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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // 合計の集計欄
  totalContainer: {
    backgroundColor: theme.colors.background.light,
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[4],
    flexDirection: "row",
    justifyContent: "space-around",
  },
  sumTitle: {
    fontSize: 24,
    paddingBottom: theme.spacing[2],
  },
  sumResult: {
    fontWeight: "bold",
    fontSize: 24,
  },
  days: {
    fontWeight: "normal",
    fontSize: 22,
  },

  analysisContainer: {
    padding: theme.spacing[3],
  },
  itemContainer: {
    backgroundColor: theme.colors.background.light,
    padding: theme.spacing[2],
    marginTop: theme.spacing[4],
    borderRadius: 5,
  },
  // セクション見出し直下に配置する場合、見出しの余白と重複しないよう相殺
  noMarginTop: {
    marginTop: 0,
  },
  exercise: {
    textAlign: "center",
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
    marginVertical: theme.spacing[3],
  },
  // データがない場合の空状態
  nonDataContainer: {
    padding: theme.spacing[5],
    borderRadius: 8,
    backgroundColor: theme.colors.background.light,
    alignItems: "center",
    marginTop: theme.spacing[4],
  },
  iconWrapper: {
    marginBottom: theme.spacing[4],
  },
  iconBadge: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.background.light,
  },
  text: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
    color: theme.colors.dark,
    marginBottom: theme.spacing[2],
  },
  subText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
    textAlign: "center",
    marginBottom: theme.spacing[5],
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing[1],
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    borderRadius: 8,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[5],
  },
  addButtonText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.secondary,
    fontWeight: "bold",
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

  // 全体タブ：今月のサマリー
  sectionTitle: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
    color: theme.colors.dark,
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[2],
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[2],
  },
  summaryCard: {
    flexBasis: "47%",
    flexGrow: 1,
    backgroundColor: theme.colors.background.light,
    borderRadius: 8,
    padding: theme.spacing[3],
  },
  summaryLabel: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
    marginTop: theme.spacing[1],
  },
  summaryValue: {
    fontSize: theme.fontSizes.large,
    fontWeight: "bold",
    color: theme.colors.dark,
  },
  summarySubText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
  },
  summaryNotice: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
  },

  // 全体タブ：部位別トレーニングバランス
  balanceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  balanceItem: {
    width: "25%",
    alignItems: "center",
    marginBottom: theme.spacing[3],
  },
  balanceImage: {
    width: 32,
    height: 32,
    marginBottom: theme.spacing[1],
  },
  balanceName: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.dark,
  },
  balancePercent: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
    color: theme.colors.dark,
  },
  stackedBar: {
    flexDirection: "row",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },

  footer: {
    height: theme.spacing[7],
  },
});
