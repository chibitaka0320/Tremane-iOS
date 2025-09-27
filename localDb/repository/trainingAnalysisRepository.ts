import * as trainingDao from "@/localDb/dao/trainingDao";
import {
  TrainingAnalysisChart,
  TrainingAnalysisRow,
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
