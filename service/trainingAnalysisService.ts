import * as trainingAnalysisRepository from "@/localDb/repository/trainingAnalysisRepository";
import {
  BodyPartSetShare,
  MonthlySummary,
  TrainingAnalysisChart,
  WeeklyVolume,
} from "@/types/dto/trainingDto";

// トレーニングの日別最大重量取得
export async function getTrainingByMaxWeight(
  bodyPartId: number
): Promise<TrainingAnalysisChart[]> {
  return await trainingAnalysisRepository.getTrainingByMaxWeight(bodyPartId);
}

// トレーニング件数集計取得（週、月、年）
export async function getWorkoutCount(bodyPartId: number): Promise<{
  week: number;
  month: number;
  year: number;
}> {
  return await trainingAnalysisRepository.getWorkoutCount(bodyPartId);
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
