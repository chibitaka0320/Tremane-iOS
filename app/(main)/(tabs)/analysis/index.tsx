import PickerModal, { SelectLabel } from "@/components/common/PickerModal";
import { bodyPartImages } from "@/constants/bodyPartImages";
import { calcTrainingCalories } from "@/lib/calc";
import * as bodyPartService from "@/service/bodyPartService";
import * as trainingAnalysisService from "@/service/trainingAnalysisService";
import * as userProfileService from "@/service/userProfileService";
import { partsColors } from "@/styles/partsColor";
import theme from "@/styles/theme";
import {
  BodyPartSetShare,
  ExerciseAnalysisMetric,
  ExerciseAnalysisPeriod,
  ExerciseMetricTrend,
  MonthlySummary,
  WeeklyVolume,
} from "@/types/dto/trainingDto";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
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

// 種目別分析：指標の選択肢
const METRIC_OPTIONS: SelectLabel[] = [
  { label: "最大重量", value: "maxWeight" },
  { label: "総負荷量", value: "totalVolume" },
  { label: "回数", value: "totalReps" },
];
const METRIC_LABELS: Record<ExerciseAnalysisMetric, string> = {
  maxWeight: "最大重量",
  totalVolume: "総負荷量",
  totalReps: "回数",
};

// 種目別分析：期間の選択肢
const PERIOD_OPTIONS: SelectLabel[] = [
  { label: "1ヶ月", value: "1M" },
  { label: "3ヶ月", value: "3M" },
  { label: "6ヶ月", value: "6M" },
  { label: "1年", value: "1Y" },
];
const PERIOD_LABELS: Record<ExerciseAnalysisPeriod, string> = {
  "1M": "1ヶ月",
  "3M": "3ヶ月",
  "6M": "6ヶ月",
  "1Y": "1年",
};

// グラフのX軸ラベルを均等にN個だけ間引いて表示（それ以外は空文字）
function buildThinnedLabels(dates: string[], count = 5): string[] {
  const length = dates.length;
  const indices = new Set<number>();
  if (length <= count) {
    dates.forEach((_, i) => indices.add(i));
  } else {
    for (let i = 0; i < count; i++) {
      indices.add(Math.round((i * (length - 1)) / (count - 1)));
    }
  }
  return dates.map((date, i) =>
    indices.has(i) ? format(parseISO(date), "MM/dd") : ""
  );
}

// 指標に応じた数値部分の表示形式
function formatMetricNumber(
  metric: ExerciseAnalysisMetric,
  value: number
): string {
  switch (metric) {
    case "maxWeight":
      return value.toFixed(1);
    case "totalVolume":
      return Math.round(value).toLocaleString();
    case "totalReps":
      return String(Math.round(value));
  }
}

// 指標に応じた単位
function metricUnit(metric: ExerciseAnalysisMetric): string {
  return metric === "totalReps" ? "回" : "kg";
}

// 期間内の変化を示す矢印
function changeArrow(change: number): string {
  if (change > 0) return "↑";
  if (change < 0) return "↓";
  return "→";
}

// トレーニング分析一覧画面
export default function AnalysisScreen() {
  const [bodyParts, setbodyParts] = useState(ALL_BODY_PARTS_VALUE);
  const [bodyPartOptions, setBodyPartOptions] = useState<SelectLabel[]>([]);

  // 部位別タブ用
  const [metric, setMetric] = useState<ExerciseAnalysisMetric>("maxWeight");
  const [period, setPeriod] = useState<ExerciseAnalysisPeriod>("3M");
  const [isMetricPickerVisible, setMetricPickerVisible] = useState(false);
  const [isPeriodPickerVisible, setPeriodPickerVisible] = useState(false);
  const [exerciseTrends, setExerciseTrends] = useState<ExerciseMetricTrend[]>(
    []
  );

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

  // 部位別タブ用・種目別指標推移取得
  useEffect(() => {
    if (isAllBodyParts) return;

    const fetch = async () => {
      try {
        const res = await trainingAnalysisService.getExerciseMetricTrends(
          Number(bodyParts),
          period,
          metric
        );
        if (res) {
          setExerciseTrends(res);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetch();
  }, [bodyParts, isAllBodyParts, period, metric]);

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

  const valueRange = (values: number[]) => {
    if (values.length === 0) return 0;
    return Math.max(...values) - Math.min(...values);
  };

  const estimatedCalories =
    monthlySummary && weightKg !== null
      ? calcTrainingCalories(monthlySummary.totalSets, weightKg)
      : null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.analysisContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.selectContainer}
        >
          {bodyPartOptions.map((item) => (
            <TouchableOpacity
              key={item.value}
              style={[
                styles.selectButton,
                bodyParts === item.value && styles.selectedButton,
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
        </ScrollView>

        {!isAllBodyParts && (
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setMetricPickerVisible(true)}
            >
              <Ionicons
                name="trending-up-outline"
                size={13}
                color={theme.colors.dark}
              />
              <Text style={styles.filterButtonText}>
                {METRIC_LABELS[metric]}
              </Text>
              <Ionicons
                name="chevron-down"
                size={11}
                color={theme.colors.font.gray}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setPeriodPickerVisible(true)}
            >
              <Ionicons
                name="calendar-outline"
                size={13}
                color={theme.colors.dark}
              />
              <Text style={styles.filterButtonText}>
                {PERIOD_LABELS[period]}
              </Text>
              <Ionicons
                name="chevron-down"
                size={11}
                color={theme.colors.font.gray}
              />
            </TouchableOpacity>
          </View>
        )}

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
        ) : exerciseTrends.length === 0 ? (
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
          exerciseTrends.map((trend) => (
            <View style={styles.exerciseCard} key={trend.exerciseId}>
              <View style={styles.exerciseCardHeader}>
                <Text style={styles.exerciseCardName}>
                  {trend.exerciseName}
                </Text>
              </View>
              <View style={styles.exerciseStatsRow}>
                <View>
                  <Text style={styles.exerciseStatLabel}>
                    現在の{METRIC_LABELS[metric]}
                  </Text>
                  <Text style={styles.exerciseStatValue}>
                    {formatMetricNumber(metric, trend.currentValue)}
                    <Text style={styles.unitText}> {metricUnit(metric)}</Text>
                  </Text>
                </View>
                <View>
                  <Text style={styles.exerciseStatLabel}>期間内の変化</Text>
                  <Text style={styles.exerciseStatChange}>
                    {changeArrow(trend.changeValue)}{" "}
                    {formatMetricNumber(metric, Math.abs(trend.changeValue))}
                    <Text style={styles.unitText}> {metricUnit(metric)}</Text>
                  </Text>
                </View>
              </View>
              <LineChart
                data={{
                  labels: buildThinnedLabels(trend.dates),
                  datasets: [{ data: trend.values }],
                }}
                width={
                  screenWidth - theme.spacing[3] * 2 - theme.spacing[2] * 2
                }
                height={180}
                chartConfig={{
                  ...chartConfig,
                  decimalPlaces: metric === "maxWeight" ? 1 : 0,
                }}
                withVerticalLines={false}
                withHorizontalLines={false}
                xLabelsOffset={5}
                yLabelsOffset={18}
                segments={valueRange(trend.values) === 0 ? 2 : 4}
                bezier
              />
            </View>
          ))
        )}

        <View style={styles.footer}></View>
      </View>

      <PickerModal
        visible={isMetricPickerVisible}
        onClose={() => setMetricPickerVisible(false)}
        selectedValue={metric}
        onChange={(value) => setMetric(value as ExerciseAnalysisMetric)}
        options={METRIC_OPTIONS}
        title="指標を選択"
      />
      <PickerModal
        visible={isPeriodPickerVisible}
        onClose={() => setPeriodPickerVisible(false)}
        selectedValue={period}
        onChange={(value) => setPeriod(value as ExerciseAnalysisPeriod)}
        options={PERIOD_OPTIONS}
        title="期間を選択"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  // 部位別タブ：指標・期間フィルター
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing[3],
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[1],
    backgroundColor: theme.colors.background.light,
    borderRadius: 6,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
  },
  filterButtonText: {
    fontSize: theme.fontSizes.small,
    fontWeight: "bold",
    color: theme.colors.dark,
  },

  // 部位別タブ：種目カード
  exerciseCard: {
    backgroundColor: theme.colors.background.light,
    padding: theme.spacing[3],
    marginTop: theme.spacing[4],
    borderRadius: 8,
  },
  exerciseCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing[3],
  },
  exerciseCardName: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
    color: theme.colors.dark,
  },
  exerciseStatsRow: {
    flexDirection: "row",
    gap: theme.spacing[6],
    marginBottom: theme.spacing[2],
  },
  exerciseStatLabel: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
    marginBottom: theme.spacing[1],
  },
  exerciseStatValue: {
    fontSize: theme.fontSizes.large,
    fontWeight: "bold",
    color: theme.colors.secondary,
  },
  exerciseStatChange: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
    color: theme.colors.secondary,
  },
  unitText: {
    fontSize: theme.fontSizes.small,
    fontWeight: "normal",
    color: theme.colors.dark,
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
    gap: theme.spacing[2],
  },
  selectButton: {
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    borderRadius: 999,
    backgroundColor: theme.colors.background.light,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  selectedButton: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.secondary,
  },
  selectText: {
    textAlign: "center",
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
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
