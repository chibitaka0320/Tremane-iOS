import * as trainingRepository from "@/localDb/repository/trainingRepository";
import * as trainingApi from "@/api/trainingApi";
import { TrainingEntity } from "@/types/db";
import { format } from "date-fns";
import { TrainingRequest } from "@/types/api";
import { MarkedDates } from "react-native-calendars/src/types";
import theme from "@/styles/theme";
import { partsColors } from "@/styles/partsColor";

// トレーニング情報追加更新
export async function upsertTraining(
  trainingId: string,
  date: Date,
  userId: string,
  exerciseId: string,
  weight: number,
  reps: number
) {
  const now = new Date().toISOString();
  const trainingEntities: TrainingEntity[] = [
    {
      training_id: trainingId,
      date: format(date, "yyyy-MM-dd"),
      user_id: userId,
      exercise_id: exerciseId,
      weight,
      reps,
      is_synced: 0,
      is_deleted: 0,
      created_at: now,
      updated_at: now,
    },
  ];

  // ローカルDB追加更新
  await trainingRepository.upsertTrainings(trainingEntities);

  // リモートDB更新（非同期）
  const trainingRequests: TrainingRequest[] = [
    {
      trainingId,
      date: format(date, "yyyy-MM-dd"),
      exerciseId,
      weight,
      reps,
      createdAt: now,
      updatedAt: now,
    },
  ];
  trainingApi
    .upsertTrainings(trainingRequests)
    .then(async () => await trainingRepository.setTrainingsSynced([trainingId]))
    .catch((error) => {
      console.error("APIエラー(トレーニング情報追加更新)：" + error);
    });
}

// トレーニング情報削除
export async function deleteTraining(trainingId: string) {
  // ローカルDB削除
  await trainingRepository.deleteTraining(trainingId);

  // リモートDB削除（非同期）
  trainingApi
    .deleteTraining(trainingId)
    .then(async () => await trainingRepository.setTrainingsSynced([trainingId]))
    .catch((error) => {
      console.error("APIエラー(トレーニング情報削除)：" + error);
    });
}

// カレンダーマークデータの取得
export async function getMarkedDate(
  selectedDate: string
): Promise<MarkedDates> {
  const marked: MarkedDates = {};

  const dailyTrainings = await trainingRepository.getTrainingsWithBodyPart();

  for (const training of dailyTrainings) {
    if (!marked[training.date]) {
      marked[training.date] = {
        dots: [],
        selectedColor: theme.colors.primary,
      };
    }

    const partColor = partsColors[training.partsId];
    marked[training.date].dots?.push({
      key: String(training.partsId),
      color: partColor,
    });

    // 選択されている場合は、ドット表示をなくす。
    marked[selectedDate] = {
      dots: [],
      selectedColor: theme.colors.primary,
    };
  }

  return marked;
}
