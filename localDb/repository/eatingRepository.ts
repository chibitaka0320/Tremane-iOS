import * as eatingDao from "@/localDb/dao/eatingDao";
import * as userGoalDao from "@/localDb/dao/userGoalDao";
import * as userProfileDao from "@/localDb/dao/userProfileDao";
import * as eatingApi from "@/api/eatingApi";
import { format } from "date-fns";
import { EatingRequest, EatingResponse } from "@/types/api";
import { EatingEntity, UserGoalEntity, UserProfileEntity } from "@/types/db";
import { DailyEating, MealRecord, Nutrition } from "@/types/dto/eatingDto";
import { calcGoalKcal } from "@/lib/calc";

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

// 日別食事情報取得
export async function getEatingByDate(date: string): Promise<DailyEating> {
  // 合計摂取栄養素
  const userProfile = await userProfileDao.getUserProfile();
  const userGoal = await userGoalDao.getUserGoal();
  let total = await eatingDao.getNutritionTotalByDate(date);
  if (!total) {
    total = { calories: 0, protein: 0, fat: 0, carbo: 0 };
  }

  // 目標摂取栄養素
  const goal = getGoalNutrition(userProfile, userGoal);

  // 目標達成比率
  const rate = getRateNutrition(total, goal);

  // 食事内容
  const meals = await eatingDao.getEatingsByDate(date);

  return { date, total, goal, rate, meals };
}

// 食事詳細情報取得
export async function getEating(eatingId: string): Promise<MealRecord | null> {
  return await eatingDao.getEating(eatingId);
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

// 食事情報物理削除
export async function deleteEatings() {
  await eatingDao.deleteEatings();
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

// ユーザーの目標摂取栄養素を取得
function getGoalNutrition(
  userProfile: UserProfileEntity | null,
  userGoal: UserGoalEntity | null
): Nutrition {
  // 栄養素初期化
  let calories = 0;
  let protein = 0;
  let fat = 0;
  let carbo = 0;

  if (userProfile && userGoal) {
    // 目標摂取カロリー算出
    calories = calcGoalKcal(userProfile, userGoal);

    // 目標PFC栄養素算出
    // TODO: 比率の保持については改善
    if (calories > 0) {
      switch (userGoal.pfc) {
        case 0:
          protein = Math.round((calories * 0.4) / 4);
          fat = Math.round((calories * 0.2) / 9);
          carbo = Math.round((calories * 0.4) / 4);
          break;
        case 1:
          protein = Math.round((calories * 0.3) / 4);
          fat = Math.round((calories * 0.2) / 9);
          carbo = Math.round((calories * 0.5) / 4);
          break;
        case 2:
          protein = Math.round((calories * 0.55) / 4);
          fat = Math.round((calories * 0.25) / 9);
          carbo = Math.round((calories * 0.5) / 4);
          break;
      }
    }
  }
  return { calories, protein, fat, carbo };
}

function getRateNutrition(total: Nutrition, goal: Nutrition): Nutrition {
  // 比率初期化
  let calories = 0;
  let protein = 0;
  let fat = 0;
  let carbo = 0;

  if (goal.calories > 0) {
    protein = Math.min(total.calories / goal.calories, 1);
  }

  if (goal.protein > 0) {
    protein = Math.min(total.protein / goal.protein, 1);
  }

  if (goal.fat > 0) {
    fat = Math.min(total.fat / goal.fat, 1);
  }

  if (goal.carbo > 0) {
    carbo = Math.min(total.carbo / goal.carbo, 1);
  }

  return { calories, protein, fat, carbo };
}
