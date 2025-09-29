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

  // リモートDB更新（非同期）
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
      console.error("APIエラー(マイトレーニング種目追加更新)：" + error);
    });
}

// マイトレーニング種目削除
export async function deleteMyExercise(exerciseId: string) {
  // ローカルDB削除
  await exerciseRepository.setMyExercisesDeleted(exerciseId);

  // リモートDB更新（非同期）
  exerciseApi
    .deleteMyExercise(exerciseId)
    .then(async () => await exerciseRepository.setExercisesSynced([exerciseId]))
    .catch((error) => {
      console.error("APIエラー(マイトレーニング種目削除)：" + error);
    });
}
