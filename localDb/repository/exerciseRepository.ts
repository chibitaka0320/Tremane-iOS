import * as myExerciseDao from "@/localDb/dao/myExerciseDao";
import * as exerciseApi from "@/api/exerciseApi";
import { format } from "date-fns";
import { ExerciseResponse } from "@/types/api";
import { ExerciseEntity } from "@/types/db";

// リモートDBからマイトレーニング種目の最新情報を同期
export async function syncMyExercisesFromRemote() {
  // ローカルDBの最終更新日を取得
  const lastUpdated = await myExerciseDao.getLastUpdatedAt();

  // リモートDBから情報を取得
  const formatDate = format(lastUpdated, "yyyy-MM-dd'T'HH:mm:ss.SSS");
  const exercises = await exerciseApi.getMyExercises(formatDate);

  if (exercises) {
    const exerciseEntities: ExerciseEntity[] = [];
    for (const exercise of exercises) {
      const exerciseEntity = toEntity(exercise);
      exerciseEntities.push(exerciseEntity);
    }
    await myExerciseDao.upsertMyExercises(exerciseEntities);
  } else {
    console.log("同期対象のマイトレーニング種目が存在しませんでした。");
  }
}

// レスポンスをエンティティに変換
function toEntity(exerciseResponse: ExerciseResponse): ExerciseEntity {
  return {
    exercise_id: exerciseResponse.exerciseId,
    owner_user_id: exerciseResponse.ownerUserId,
    parts_id: exerciseResponse.partsId,
    name: exerciseResponse.name,
    is_synced: 1,
    is_deleted: 0,
    created_at: exerciseResponse.createdAt,
    updated_at: exerciseResponse.updatedAt,
  };
}
