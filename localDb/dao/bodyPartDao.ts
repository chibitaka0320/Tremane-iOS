import { db } from "@/lib/localDbConfig";
import { BodyPartEntity } from "@/types/db";
import { BodyPartWithExerciseDto } from "@/types/dto/bodyPartDto";

// 最新更新日を取得
export async function getLastUpdatedAt(): Promise<string> {
  const row = await db.getFirstAsync<{ last_updated: string }>(
    "SELECT MAX(updated_at) as last_updated FROM body_parts;"
  );
  return row?.last_updated ?? "1970-01-01T00:00:00";
}

// 追加 or 更新
export async function upsertBodyParts(bodyParts: BodyPartEntity[]) {
  await db.withTransactionAsync(async () => {
    for (const bodyPart of bodyParts) {
      await db.runAsync(
        `
        INSERT OR REPLACE INTO body_parts (parts_id, name, created_at, updated_at)
        VALUES (?, ?, ?, ?)
        `,
        [
          bodyPart.parts_id,
          bodyPart.name,
          bodyPart.created_at,
          bodyPart.updated_at,
        ]
      );
    }
  });
}

// 種目付き部位データ取得
// TODO：部位付き種目一覧がよい？検討。
export async function getBodyPartsWithExercises(): Promise<
  BodyPartWithExerciseDto[]
> {
  const rows = await db.getAllAsync<BodyPartWithExerciseDto>(`
    SELECT
      bp.parts_id AS partsId,
      bp.name AS partName,
      ex.exercise_id AS exerciseId,
      ex.owner_user_id AS ownerUserId,
      ex.name AS exerciseName
    FROM body_parts bp
    JOIN exercises ex ON ex.parts_id = bp.parts_id
    WHERE ex.is_deleted = 0
    ORDER BY bp.parts_id ASC, ex.owner_user_id DESC, ex.created_at DESC
  `);
  return rows;
}
