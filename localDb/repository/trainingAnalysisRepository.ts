import * as trainingDao from "@/localDb/dao/trainingDao";
import {
  BodyPartSetShare,
  MonthlySummary,
  TrainingAnalysisChart,
  TrainingAnalysisRow,
  WeeklyVolume,
} from "@/types/dto/trainingDto";
import { format } from "date-fns";

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
