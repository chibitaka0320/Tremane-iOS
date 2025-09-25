import * as exerciseRepository from "@/localDb/repository/exerciseRepository";
import * as exerciseApi from "@/api/exerciseApi";
import { ExerciseRequest } from "@/types/api";
import { ExerciseEntity } from "@/types/db";

// マイトレーニング種目追加更新
export async function upsertMyExercises(
  exerciseId: string,
  ownerUserId: string,
  partsId: number,
  name: string
) {
  const now = new Date().toISOString();
  const exerciseEntities: ExerciseEntity[] = [
    {
      exercise_id: exerciseId,
      owner_user_id: ownerUserId,
      parts_id: partsId,
      name: name,
      is_synced: 0,
      is_deleted: 0,
      created_at: now,
      updated_at: now,
    },
  ];

  // ローカルDB追加更新
  await exerciseRepository.upsertMyExercises(exerciseEntities);

  // リモートDB更新（同期）
  const exerciseRequests: ExerciseRequest[] = [
    {
      exerciseId,
      partsId,
      name,
      createdAt: now,
      updatedAt: now,
    },
  ];
  exerciseApi
    .upsertMyExercises(exerciseRequests)
    .then(async () => await exerciseRepository.setExercisesSynced([exerciseId]))
    .catch((error) => {
      console.log("APIエラー(マイトレーニング種目追加更新)：" + error);
    });
}
