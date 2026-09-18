import * as mealApi from "@/api/mealApi";
import * as eatingDao from "@/localDb/dao/eatingDao";
import * as mealDao from "@/localDb/dao/mealDao";
import { MealRequest, MealResponse } from "@/types/api";
import { MealEntity } from "@/types/db";
import { MealDetail, Nutrition } from "@/types/dto/eatingDto";
import { format } from "date-fns";

// リモートDBから食事記録データの最新情報を同期
export async function syncMealsFromRemote() {
  // ローカルDBの最終更新日を取得
  const lastUpdated = await mealDao.getLastUpdatedAt();

  // リモートDBから情報を取得
  const formatDate = format(lastUpdated, "yyyy-MM-dd'T'HH:mm:ss.SSS");
  const meals = await mealApi.getMeals(formatDate);

  if (meals) {
    const mealEntities: MealEntity[] = [];
    for (const meal of meals) {
      mealEntities.push(toEntity(meal));
    }
    await mealDao.upsertMeals(mealEntities);
  } else {
    console.log("同期対象の食事記録データが存在しませんでした。");
  }
}

// ローカルDBから食事記録データの情報を同期
export async function syncMealsFromLocal() {
  // 非同期データの取得（未削除）
  const meals = await mealDao.getUnsyncedMeals(0);
  if (meals.length > 0) {
    const requests: MealRequest[] = [];
    for (const meal of meals) {
      requests.push(toRequest(meal));
    }
    mealApi.upsertMeals(requests);
  } else {
    console.log(
      "同期対象の食事記録データ（未削除）が存在しませんでした。（ローカル → リモート）"
    );
  }

  // 非同期データの取得（削除）
  const deletedMeals = await mealDao.getUnsyncedMeals(1);
  if (deletedMeals.length > 0) {
    for (const meal of deletedMeals) {
      mealApi.deleteMeal(meal.meal_id);
    }
  } else {
    console.log(
      "同期対象の食事記録データ（削除）が存在しませんでした。（ローカル → リモート）"
    );
  }
}

// 食事記録詳細情報取得（内包する食品一覧・合計栄養素付き）
export async function getMealDetail(mealId: string): Promise<MealDetail | null> {
  const meal = await mealDao.getMeal(mealId);
  if (!meal) {
    return null;
  }

  const foods = await eatingDao.getEatingsByMealId(mealId);
  const total = foods.reduce<Nutrition>(
    (sum, food) => ({
      calories: sum.calories + food.calories,
      protein: sum.protein + food.protein,
      fat: sum.fat + food.fat,
      carbo: sum.carbo + food.carbo,
    }),
    { calories: 0, protein: 0, fat: 0, carbo: 0 }
  );

  return { ...meal, foods, total };
}

// 食事記録IDから登録日時を取得（既存レコードかどうかの判定に使用）
export async function getMealCreatedAt(mealId: string): Promise<string | null> {
  return await mealDao.getMealCreatedAt(mealId);
}

// 食事記録追加更新
export async function upsertMeals(mealEntities: MealEntity[]) {
  await mealDao.upsertMeals(mealEntities);
}

// 同期済みフラグを立てる
export async function setMealsSynced(mealIds: string[]) {
  await mealDao.setMealsSynced(mealIds);
}

// 食事記録削除（内包する食品記録もカスケード削除する）
export async function deleteMealCascade(mealId: string) {
  const foods = await eatingDao.getEatingsByMealId(mealId);
  for (const food of foods) {
    await eatingDao.deleteEating(food.eatingId);
  }
  await mealDao.deleteMeal(mealId);
}

// 食事記録データ物理削除（全削除）
export async function deleteMeals() {
  await mealDao.deleteMeals();
}

// レスポンスをエンティティに変換
function toEntity(mealResponse: MealResponse): MealEntity {
  return {
    meal_id: mealResponse.mealId,
    date: mealResponse.date,
    user_id: mealResponse.userId,
    name: mealResponse.name,
    is_synced: 1,
    is_deleted: 0,
    created_at: mealResponse.createdAt,
    updated_at: mealResponse.updatedAt,
  };
}

// エンティティをリクエストに変換
function toRequest(mealEntity: MealEntity): MealRequest {
  return {
    mealId: mealEntity.meal_id,
    date: mealEntity.date,
    userId: mealEntity.user_id,
    name: mealEntity.name,
    createdAt: mealEntity.created_at,
    updatedAt: mealEntity.updated_at,
  };
}
