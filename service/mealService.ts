import * as mealApi from "@/api/mealApi";
import * as mealRepository from "@/localDb/repository/mealRepository";
import { MealRequest } from "@/types/api";
import { MealEntity } from "@/types/db";
import { MealDetail } from "@/types/dto/eatingDto";
import { format } from "date-fns";

// 食事記録詳細情報取得（内包する食品一覧・合計栄養素付き）
export async function getMealDetail(
  mealId: string
): Promise<MealDetail | null> {
  return await mealRepository.getMealDetail(mealId);
}

// 食事記録追加更新
export async function upsertMeal(
  mealId: string,
  date: Date,
  userId: string,
  name: string
) {
  const now = new Date().toISOString();
  // 既存レコードの場合はcreated_atを維持し、日時ソートの並び順が更新の度に変わらないようにする
  const existingCreatedAt = await mealRepository.getMealCreatedAt(mealId);
  const createdAt = existingCreatedAt ?? now;

  const mealEntities: MealEntity[] = [
    {
      meal_id: mealId,
      date: format(date, "yyyy-MM-dd"),
      user_id: userId,
      name,
      is_synced: 0,
      is_deleted: 0,
      created_at: createdAt,
      updated_at: now,
    },
  ];

  // ローカルDB追加更新
  await mealRepository.upsertMeals(mealEntities);

  // リモートDB更新（非同期）
  const mealRequests: MealRequest[] = [
    {
      mealId,
      date: format(date, "yyyy-MM-dd"),
      userId,
      name,
      createdAt,
      updatedAt: now,
    },
  ];
  mealApi
    .upsertMeals(mealRequests)
    .then(async () => await mealRepository.setMealsSynced([mealId]))
    .catch((error) => {
      console.error("APIエラー(食事記録追加更新)：" + error);
    });
}

// 食事記録削除（内包する食品記録もカスケード削除する）
export async function deleteMeal(mealId: string) {
  // ローカルDB削除（カスケード）
  await mealRepository.deleteMealCascade(mealId);

  // リモートDB削除（非同期。サーバー側でも内包する食品記録がカスケード削除される）
  mealApi
    .deleteMeal(mealId)
    .then(async () => await mealRepository.setMealsSynced([mealId]))
    .catch((error) => {
      console.error("APIエラー(食事記録削除)：" + error);
    });
}
