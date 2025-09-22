import * as eatingRepository from "@/localDb/repository/eatingRepository";
import * as eatingApi from "@/api/eatingApi";
import { EatingEntity } from "@/types/db";
import { format } from "date-fns";
import { calcKcal } from "@/lib/calc";
import { EatingRequest } from "@/types/api";

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
  const now = new Date().toString();
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
      created_at: now,
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
      createdAt: now,
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
