import * as trainingAnalysisRepository from "@/localDb/repository/trainingAnalysisRepository";
import { TrainingAnalysisChart } from "@/types/dto/trainingDto";

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
