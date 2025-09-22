import * as eatingDao from "@/localDb/dao/eatingDao";
import * as eatingApi from "@/api/eatingApi";
import { format } from "date-fns";
import { EatingRequest, EatingResponse } from "@/types/api";
import { EatingEntity } from "@/types/db";

// リモートDBから食事データの最新情報を同期
export async function syncEatingsFromRemote() {
  //　ローカルDBの最終更新日を取得
  const lastUpdated = await eatingDao.getLastUpdatedAt();

  // リモートDBから情報を取得
  const formatDate = format(lastUpdated, "yyyy-MM-dd'T'HH:mm:ss.SSS");
  const eatings = await eatingApi.getEatings(formatDate);

  if (eatings) {
    const eatingEntities: EatingEntity[] = [];
    for (const eating of eatings) {
      const eatingEntity = toEntity(eating);
      eatingEntities.push(eatingEntity);
    }
    await eatingDao.upsertEatings(eatingEntities);
  } else {
    console.log("同期対象の食事データが存在しませんでした。");
  }
}

// ローカルDBから食事データの情報を同期
export async function syncEatingsFromLocal() {
  // 非同期データの取得（未削除）
  const eatings = await eatingDao.getUnsyncedEatings(0);
  if (eatings.length > 0) {
    const requests: EatingRequest[] = [];
    for (const eating of eatings) {
      const eatingRequest = toRequest(eating);
      requests.push(eatingRequest);
    }
    eatingApi.upsertEatings(requests);
  } else {
    console.log(
      "同期対象の食事データ（未削除）が存在しませんでした。（ローカル → リモート）"
    );
  }

  // 非同期データの取得（削除）
  const deletedEatings = await eatingDao.getUnsyncedEatings(1);
  if (deletedEatings.length > 0) {
    for (const eating of deletedEatings) {
      eatingApi.deleteEating(eating.eating_id);
    }
  } else {
    console.log(
      "同期対象の食事データ（削除）が存在しませんでした。（ローカル → リモート）"
    );
  }
}

// 食事情報追加更新
export async function upsertEatings(eatingEntities: EatingEntity[]) {
  await eatingDao.upsertEatings(eatingEntities);
}

// 同期済みフラグを立てる
export async function setEatingsSynced(eatingIds: string[]) {
  await eatingDao.setEatingsSynced(eatingIds);
}

// 食事情報削除
export async function deleteEating(eatingId: string) {
  await eatingDao.deleteEating(eatingId);
}

// レスポンスをエンティティに交換
function toEntity(eatingResponse: EatingResponse): EatingEntity {
  return {
    eating_id: eatingResponse.eatingId,
    date: eatingResponse.date,
    user_id: eatingResponse.userId,
    name: eatingResponse.name,
    calories: eatingResponse.calories,
    protein: eatingResponse.protein,
    fat: eatingResponse.fat,
    carbo: eatingResponse.carbo,
    is_synced: 1,
    is_deleted: 0,
    created_at: eatingResponse.createdAt,
    updated_at: eatingResponse.updatedAt,
  };
}

// エンティティをリクエストに変換
function toRequest(eatingEntity: EatingEntity): EatingResponse {
  return {
    eatingId: eatingEntity.eating_id,
    date: eatingEntity.date,
    userId: eatingEntity.user_id,
    name: eatingEntity.name,
    calories: eatingEntity.calories,
    protein: eatingEntity.protein,
    fat: eatingEntity.fat,
    carbo: eatingEntity.carbo,
    createdAt: eatingEntity.created_at,
    updatedAt: eatingEntity.updated_at,
  };
}
