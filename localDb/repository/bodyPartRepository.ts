import * as bodyPartDao from "@/localDb/dao/bodyPartDao";
import * as bodyPartApi from "@/api/bodyPartApi";
import { format } from "date-fns";
import { BodyPartEntity } from "@/types/db";
import { BodyPartResponse } from "@/types/api";
import { BodyPart } from "@/types/dto/bodyPartDto";

// リモートDBから部位データを同期
export async function syncBodyPartsFromRemte() {
  // ローカルDBの最終更新日を取得
  const lastUpdated = await bodyPartDao.getLastUpdatedAt();

  // リモートDBから情報を取得
  const formatDate = format(lastUpdated, "yyyy-MM-dd'T'HH:mm:ss.SSS");
  const bodyParts = await bodyPartApi.getBodyParts(formatDate);

  if (bodyParts) {
    const bodyPartEntites: BodyPartEntity[] = [];
    for (const bodyPart of bodyParts) {
      const bodyPartEntity = toEntity(bodyPart);
      bodyPartEntites.push(bodyPartEntity);
    }
    await bodyPartDao.upsertBodyParts(bodyPartEntites);
  } else {
    console.log("同期対象の部位データが存在しませんでした。");
  }
}

// 種目付き部位一覧取得
export async function getBodyPartsWithExercises(): Promise<BodyPart[]> {
  const rows = await bodyPartDao.getBodyPartsWithExercises();

  const bodyPartsRecord: Record<number, BodyPart> = {};

  for (const row of rows) {
    // 対象部位IDがなければ新規追加
    if (!bodyPartsRecord[row.partsId]) {
      bodyPartsRecord[row.partsId] = {
        partsId: row.partsId,
        partName: row.partName,
        exercises: [],
      };
    }

    bodyPartsRecord[row.partsId].exercises.push({
      exerciseId: row.exerciseId,
      exerciseName: row.exerciseName,
      ownerUserId: row.ownerUserId,
      myExerciseFlg: row.ownerUserId ? true : false,
    });
  }

  return Object.values(bodyPartsRecord);
}

// レスポンスをエンティティに変換
function toEntity(bodyPartResponse: BodyPartResponse): BodyPartEntity {
  return {
    parts_id: bodyPartResponse.partsId,
    name: bodyPartResponse.name,
    created_at: bodyPartResponse.createdAt,
    updated_at: bodyPartResponse.updatedAt,
  };
}
