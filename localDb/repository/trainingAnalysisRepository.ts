import * as trainingDao from "@/localDb/dao/trainingDao";
import {
  BodyPartSetShare,
  MonthlySummary,
  TrainingAnalysisChart,
  TrainingAnalysisRow,
  WeeklyVolume,
} from "@/types/dto/trainingDto";
import { format } from "date-fns";

// 件数集計取得用データタイプ
type DateRange = { start: Date; end: Date };

// トレーニングの日別最大重量取得
export async function getTrainingByMaxWeight(
  bodyPartId: number
): Promise<TrainingAnalysisChart[]> {
  const LIMIT = 6;
  let trainingRows: TrainingAnalysisRow[]; // 行データ格納変数

  if (bodyPartId === 0) {
    // 部位IDが0(全て)
    trainingRows = await trainingDao.getTrainingAllDataByMaxWeight(LIMIT);
  } else {
    trainingRows = await trainingDao.getTrainingByMaxWeight(bodyPartId, LIMIT);
  }

  // データの構造化
  const analysisMap: Record<string, TrainingAnalysisChart> = {};

  // 1行ずつデータを作成
  trainingRows.forEach((row) => {
    // 対象種目の箱がなければ作成
    if (!analysisMap[row.exerciseId]) {
      analysisMap[row.exerciseId] = {
        labels: [],
        datasets: [
          {
            data: [],
          },
        ],
        name: row.exerciseName,
      };
    }
    const training = analysisMap[row.exerciseId];
    training.labels.push(format(row.date, "MM/dd"));
    training.datasets[0].data.push(row.weight);
  });

  return Object.values(analysisMap);
}

// トレーニング件数集計取得（週、月、年）
export async function getWorkoutCount(bodyPartId: number): Promise<{
  week: number;
  month: number;
  year: number;
}> {
  // 現在日付を取得
  const now = new Date();

  // 今週の開始日、終了日を取得
  const dayOfWeek = now.getDay();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dayOfWeek);
  const weekEnd = new Date(now);
  weekEnd.setDate(now.getDate() + (6 - dayOfWeek));
  const weekRange: DateRange = { start: weekStart, end: weekEnd };

  // 今月の開始日、終了日を取得
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const monthRange: DateRange = { start: monthStart, end: monthEnd };

  // 今年の開始日、終了日を取得
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const yearEnd = new Date(now.getFullYear(), 11, 31);
  const yearRange: DateRange = { start: yearStart, end: yearEnd };

  // 集計件数取得
  const week = await getCount(weekRange, bodyPartId);
  const month = await getCount(monthRange, bodyPartId);
  const year = await getCount(yearRange, bodyPartId);

  return {
    week,
    month,
    year,
  };
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

// トレーニング集計件数取得
async function getCount(range: DateRange, bodyPartId: number): Promise<number> {
  const start = format(range.start, "yyyy-MM-dd");
  const end = format(range.end, "yyyy-MM-dd");

  if (bodyPartId === 0) {
    // 部位が全ての場合
    return await trainingDao.getTrainingAllCount(start, end);
  } else {
    return await trainingDao.getTrainingCount(start, end, bodyPartId);
  }
}
