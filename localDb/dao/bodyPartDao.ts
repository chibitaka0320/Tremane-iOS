import { db } from "@/lib/localDbConfig";
import { BodyPart } from "@/types/localDb";

// 最新更新日を取得
export const getLatestBodyPart = async (): Promise<string> => {
  const row = await db.getFirstAsync<{ last_updated: string }>(
    "SELECT MAX(updated_at) as last_updated FROM body_parts;"
  );
  return row?.last_updated ?? "1970-01-01T00:00:00";
};

// 追加
export const insertBodyPartDao = async (bodyParts: BodyPart[]) => {
  await db.withTransactionAsync(async () => {
    for (const b of bodyParts) {
      await db.runAsync(
        `
        INSERT OR REPLACE INTO body_parts (parts_id, name, created_at, updated_at)
        VALUES (?, ?, ?, ?)
        `,
        [b.partsId, b.name, b.createdAt, b.updatedAt]
      );
    }
  });
};

// 種目付き部位データ取得
export const getBodyPartsWithExercisesDao = async () => {
  const rows = await db.getAllAsync<{
    parts_id: number;
    part_name: string;
    exercise_id: number;
    exercise_name: string;
  }>(`
    SELECT
      bp.parts_id,
      bp.name AS part_name,
      ex.exercise_id,
      ex.name AS exercise_name
    FROM body_parts bp
    JOIN exercises ex ON ex.parts_id = bp.parts_id
    ORDER BY bp.parts_id, ex.exercise_id
  `);
  return rows;
};

// マイ種目付き部位データ取得
export const getBodyPartsWithMyExercisesDao = async () => {
  const rows = await db.getAllAsync<{
    parts_id: number;
    part_name: string;
    exercise_id: number;
    exercise_name: string;
  }>(`
    SELECT
      bp.parts_id,
      bp.name AS part_name,
      ex.exercise_id,
      ex.name AS exercise_name
    FROM body_parts bp
    JOIN my_exercises ex ON ex.parts_id = bp.parts_id
    WHERE is_deleted = 0
    ORDER BY bp.parts_id, ex.exercise_id
  `);
  return rows;
};
