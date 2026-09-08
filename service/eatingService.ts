import * as eatingApi from "@/api/eatingApi";
import { calcKcal } from "@/lib/calc";
import * as eatingRepository from "@/localDb/repository/eatingRepository";
import { EatingRequest } from "@/types/api";
import { EatingEntity } from "@/types/db";
import { DailyEating, MealRecord } from "@/types/dto/eatingDto";
import { format } from "date-fns";

// 1日のトレーニング情報取得
export async function getEatingByDate(date: string): Promise<DailyEating> {
  return await eatingRepository.getEatingByDate(date);
}

// 食事詳細情報取得
export async function getEating(eatingId: string): Promise<MealRecord | null> {
  return await eatingRepository.getEating(eatingId);
}

// 食事情報追加更新
export async function upsertEating(
  eatingId: string,
  date: Date,
  userId: string,
  name: string,
  protein: number,
  fat: number,
  carbo: number
) {
  const now = new Date().toISOString();
  // 既存レコードの場合はcreated_atを維持し、日時ソートの並び順が更新の度に変わらないようにする
  const existingCreatedAt = await eatingRepository.getEatingCreatedAt(
    eatingId
  );
  const createdAt = existingCreatedAt ?? now;
  const eatingEntities: EatingEntity[] = [
    {
      eating_id: eatingId,
      date: format(date, "yyyy-MM-dd"),
      user_id: userId,
      name,
      calories: calcKcal(protein, fat, carbo),
      protein,
      fat,
      carbo,
      is_synced: 0,
      is_deleted: 0,
      created_at: createdAt,
      updated_at: now,
    },
  ];

  // ローカルDB追加更新
  await eatingRepository.upsertEatings(eatingEntities);

  // リモートDB更新（非同期）
  const eatingRequests: EatingRequest[] = [
    {
      eatingId,
      date: format(date, "yyyy-MM-dd"),
      userId,
      name,
      calories: calcKcal(protein, fat, carbo),
      protein,
      fat,
      carbo,
      createdAt,
      updatedAt: now,
    },
  ];
  eatingApi
    .upsertEatings(eatingRequests)
    .then(async () => await eatingRepository.setEatingsSynced([eatingId]))
    .catch((error) => {
      console.error("APIエラー(食事情報追加更新)：" + error);
    });
}

// 食事情報削除
export async function deleteEating(eatingId: string) {
  // ローカルDB削除
  await eatingRepository.deleteEating(eatingId);

  // リモートDB削除（非同期）
  eatingApi
    .deleteEating(eatingId)
    .then(async () => await eatingRepository.setEatingsSynced([eatingId]))
    .catch((error) => {
      console.error("APIエラー(食事情報削除)：" + error);
    });
}
