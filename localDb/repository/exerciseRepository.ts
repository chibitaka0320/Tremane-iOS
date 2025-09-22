import * as myExerciseDao from "@/localDb/dao/myExerciseDao";
import * as exerciseApi from "@/api/exerciseApi";
import { format } from "date-fns";
import { ExerciseRequest, ExerciseResponse } from "@/types/api";
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

// ローカルDBからマイトレーニング種目の情報を同期
export async function syncMyExercisesFromLocal() {
  // 非同期データの取得（未削除）
  const exercises = await myExerciseDao.getUnsyncedMyExercises(0);
  if (exercises.length > 0) {
    const requests: ExerciseRequest[] = [];
    const exerciseIds: string[] = [];
    for (const exercise of exercises) {
      const exerciseRequest = toRequest(exercise);
      requests.push(exerciseRequest);
      exerciseIds.push(exercise.exercise_id);
    }
    exerciseApi
      .upsertMyExercises(requests)
      .then(async () => await setExercisesSynced(exerciseIds));
  } else {
    console.log(
      "同期対象のマイトレーニング種目（未削除）が存在しませんでした。（ローカル → リモート）"
    );
  }

  // 非同期データの取得（削除）
  const deletedExercises = await myExerciseDao.getUnsyncedMyExercises(1);
  if (deletedExercises.length > 0) {
    for (const exercise of deletedExercises) {
      exerciseApi
        .deleteMyExercise(exercise.exercise_id)
        .then(async () => await setExercisesSynced([exercise.exercise_id]));
    }
  } else {
    console.log(
      "同期対象のマイトレーニング種目（削除）が存在しませんでした。（ローカル → リモート）"
    );
  }
}

// マイトレーニング種目追加更新
export async function upsertMyExercises(exerciseEntities: ExerciseEntity[]) {
  await myExerciseDao.upsertMyExercises(exerciseEntities);
}

// 同期済みフラグを立てる
export async function setExercisesSynced(exerciseIds: string[]) {
  await myExerciseDao.setMyExercisesSynced(exerciseIds);
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

// エンティティをリクエストに変換
function toRequest(exerciseEntity: ExerciseEntity): ExerciseResponse {
  return {
    exerciseId: exerciseEntity.exercise_id,
    ownerUserId: exerciseEntity.owner_user_id,
    partsId: exerciseEntity.parts_id,
    name: exerciseEntity.name,
    createdAt: exerciseEntity.created_at,
    updatedAt: exerciseEntity.updated_at,
  };
}
