import * as trainingDao from "@/localDb/dao/trainingDao";
import {
  TrainingAnalysisChart,
  TrainingAnalysisRow,
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
