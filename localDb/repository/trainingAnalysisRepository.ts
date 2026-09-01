import * as trainingDao from "@/localDb/dao/trainingDao";
import {
  BodyPartSetShare,
  ExerciseAnalysisMetric,
  ExerciseAnalysisPeriod,
  ExerciseMetricTrend,
  MonthlySummary,
  WeeklyVolume,
} from "@/types/dto/trainingDto";
import { format, subMonths, subYears } from "date-fns";

// 期間コードから開始日・終了日（today）を算出
function getDateRangeByPeriod(period: ExerciseAnalysisPeriod): {
  started: string;
  ended: string;
} {
  const now = new Date();
  const started =
    period === "1M"
      ? subMonths(now, 1)
      : period === "3M"
      ? subMonths(now, 3)
      : period === "6M"
      ? subMonths(now, 6)
      : subYears(now, 1);

  return {
    started: format(started, "yyyy-MM-dd"),
    ended: format(now, "yyyy-MM-dd"),
  };
}

// 部位別・種目別の指標推移取得（分析画面・部位別タブ用）
export async function getExerciseMetricTrends(
  bodyPartId: number,
  period: ExerciseAnalysisPeriod,
  metric: ExerciseAnalysisMetric
): Promise<ExerciseMetricTrend[]> {
  const { started, ended } = getDateRangeByPeriod(period);

  const rows = await trainingDao.getExerciseMetricsByBodyPartAndDateRange(
    bodyPartId,
    started,
    ended
  );

  // 種目ごとにグループ化（rowsはexercise_id, date ASCで整列済み）
  const trendMap = new Map<
    string,
    { exerciseName: string; dates: string[]; values: number[] }
  >();

  rows.forEach((row) => {
    if (!trendMap.has(row.exerciseId)) {
      trendMap.set(row.exerciseId, {
        exerciseName: row.exerciseName,
        dates: [],
        values: [],
      });
    }
    const trend = trendMap.get(row.exerciseId)!;
    trend.dates.push(row.date);
    trend.values.push(row[metric]);
  });

  return Array.from(trendMap.entries()).map(([exerciseId, trend]) => {
    const currentValue = trend.values[trend.values.length - 1] ?? 0;
    const changeValue =
      trend.values.length > 1 ? currentValue - trend.values[0] : 0;

    return {
      exerciseId,
      exerciseName: trend.exerciseName,
      dates: trend.dates,
      values: trend.values,
      currentValue,
      changeValue,
    };
  });
}

// 今月のサマリー取得（分析画面・全体タブ用）
export async function getMonthlySummary(): Promise<MonthlySummary> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const { trainingDays, totalVolume, totalSets } =
    await trainingDao.getTrainingSummaryByDateRange(
      format(monthStart, "yyyy-MM-dd"),
      format(monthEnd, "yyyy-MM-dd")
    );

  // 週平均 = トレーニング日数 ÷ (今月の経過日数 ÷ 7)
  const elapsedDays = now.getDate();
  const weeklyAverage =
    elapsedDays > 0
      ? Math.round(((trainingDays * 7) / elapsedDays) * 10) / 10
      : 0;

  return { trainingDays, weeklyAverage, totalVolume, totalSets };
}

// 週別総負荷量の推移取得（分析画面・全体タブ用、月を1〜7日/8〜14日/15〜21日/22日〜で4分割）
export async function getWeeklyVolumeTrend(): Promise<WeeklyVolume[]> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const rows = await trainingDao.getDailyVolumeByDateRange(
    format(monthStart, "yyyy-MM-dd"),
    format(monthEnd, "yyyy-MM-dd")
  );

  const weeklyVolumes = [0, 0, 0, 0];
  rows.forEach((row) => {
    const day = Number(row.date.split("-")[2]);
    const weekIndex = day <= 7 ? 0 : day <= 14 ? 1 : day <= 21 ? 2 : 3;
    weeklyVolumes[weekIndex] += row.volume;
  });

  return weeklyVolumes.map((volume, index) => ({
    weekLabel: `${index + 1}週`,
    volume,
  }));
}

// 部位別トレーニングバランス取得（分析画面・全体タブ用、今月のセット数ベース）
export async function getBodyPartSetShare(): Promise<BodyPartSetShare[]> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const rows = await trainingDao.getBodyPartSetCountByDateRange(
    format(monthStart, "yyyy-MM-dd"),
    format(monthEnd, "yyyy-MM-dd")
  );

  const totalSetCount = rows.reduce((sum, row) => sum + row.setCount, 0);

  return rows.map((row) => ({
    bodyPartId: row.partsId,
    bodyPartName: row.partsName,
    setCount: row.setCount,
    percentage:
      totalSetCount > 0
        ? Math.round((row.setCount / totalSetCount) * 100)
        : 0,
  }));
}
