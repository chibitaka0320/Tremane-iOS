import * as trainingAnalysisRepository from "@/localDb/repository/trainingAnalysisRepository";
import {
  BodyPartSetShare,
  ExerciseAnalysisMetric,
  ExerciseAnalysisPeriod,
  ExerciseMetricTrend,
  MonthlySummary,
  WeeklyVolume,
} from "@/types/dto/trainingDto";

// 部位別・種目別の指標推移取得（分析画面・部位別タブ用）
export async function getExerciseMetricTrends(
  bodyPartId: number,
  period: ExerciseAnalysisPeriod,
  metric: ExerciseAnalysisMetric
): Promise<ExerciseMetricTrend[]> {
  return await trainingAnalysisRepository.getExerciseMetricTrends(
    bodyPartId,
    period,
    metric
  );
}

// 今月のサマリー取得（分析画面・全体タブ用）
export async function getMonthlySummary(): Promise<MonthlySummary> {
  return await trainingAnalysisRepository.getMonthlySummary();
}

// 週別総負荷量の推移取得（分析画面・全体タブ用）
export async function getWeeklyVolumeTrend(): Promise<WeeklyVolume[]> {
  return await trainingAnalysisRepository.getWeeklyVolumeTrend();
}

// 部位別トレーニングバランス取得（分析画面・全体タブ用）
export async function getBodyPartSetShare(): Promise<BodyPartSetShare[]> {
  return await trainingAnalysisRepository.getBodyPartSetShare();
}
