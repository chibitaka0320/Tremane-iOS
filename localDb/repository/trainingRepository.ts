import * as trainingDao from "@/localDb/dao/trainingDao";
import * as trainingApi from "@/api/trainingApi";
import { format } from "date-fns";
import { TrainingRequest, TrainingResponse } from "@/types/api";
import { TrainingEntity } from "@/types/db";

// リモートDBからトレーニングデータの最新情報を同期
export async function syncTrainingsFromRemote() {
  // ローカルDBの最終更新日を取得
  const lastUpdated = await trainingDao.getLastUpdatedAt();

  // リモートDBから情報を取得
  const formatDate = format(lastUpdated, "yyyy-MM-dd'T'HH:mm:ss.SSS");
  const trainings = await trainingApi.getTrainings(formatDate);

  if (trainings) {
    const trainingEntities: TrainingEntity[] = [];
    for (const training of trainings) {
      const trainingEntity = toEntity(training);
      trainingEntities.push(trainingEntity);
    }
    await trainingDao.upsertTrainings(trainingEntities);
  } else {
    console.log("同期対象のトレーニングデータが存在しませんでした。");
  }
}

// ローカルDBからトレーニングデータの情報を同期
export async function syncTrainingsFromLocal() {
  // 非同期データの取得（未削除）
  const trainings = await trainingDao.getUnsyncedTrainings(0);
  if (trainings.length > 0) {
    const requests: TrainingRequest[] = [];
    for (const training of trainings) {
      const trainingRequest = toRequest(training);
      requests.push(trainingRequest);
    }
    trainingApi.upsertTrainings(requests);
  } else {
    console.log(
      "同期対象のトレーニングデータ（未削除）が存在しませんでした。（ローカル → リモート）"
    );
  }

  // 非同期データの取得（削除）
  const deletedTrainings = await trainingDao.getUnsyncedTrainings(1);
  if (deletedTrainings.length > 0) {
    for (const training of deletedTrainings) {
      trainingApi.deleteTraining(training.training_id);
    }
  } else {
    console.log(
      "同期対象のトレーニングデータ（削除）が存在しませんでした。（ローカル → リモート）"
    );
  }
}

// トレーニング情報追加更新
export async function upsertTrainings(trainingEntities: TrainingEntity[]) {
  await trainingDao.upsertTrainings(trainingEntities);
}

//　同期済みフラグを立てる
export async function setTrainingsSynced(trainingIds: string[]) {
  await trainingDao.setTrainingsSynced(trainingIds);
}

// レスポンスをエンティティに変換
function toEntity(trainingResponse: TrainingResponse): TrainingEntity {
  return {
    training_id: trainingResponse.trainingId,
    date: trainingResponse.date,
    user_id: trainingResponse.userId,
    exercise_id: trainingResponse.exerciseId,
    weight: trainingResponse.weight,
    reps: trainingResponse.reps,
    is_synced: 1,
    is_deleted: 0,
    created_at: trainingResponse.createdAt,
    updated_at: trainingResponse.updatedAt,
  };
}

// エンティティをリクエストに変換
function toRequest(trainingEntity: TrainingEntity): TrainingResponse {
  return {
    trainingId: trainingEntity.training_id,
    date: trainingEntity.date,
    userId: trainingEntity.user_id,
    exerciseId: trainingEntity.exercise_id,
    weight: trainingEntity.weight,
    reps: trainingEntity.reps,
    createdAt: trainingEntity.created_at,
    updatedAt: trainingEntity.updated_at,
  };
}
