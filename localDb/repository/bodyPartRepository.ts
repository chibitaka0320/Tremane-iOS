import * as bodyPartDao from "@/localDb/dao/bodyPartDao";
import * as bodyPartApi from "@/api/bodyPartApi";
import { format } from "date-fns";
import { BodyPartEntity } from "@/types/db";
import { BodyPartResponse } from "@/types/api";

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

// レスポンスをエンティティに変換
function toEntity(bodyPartResponse: BodyPartResponse): BodyPartEntity {
  return {
    parts_id: bodyPartResponse.partsId,
    name: bodyPartResponse.name,
    created_at: bodyPartResponse.createdAt,
    updated_at: bodyPartResponse.updatedAt,
  };
}
