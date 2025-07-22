import { BodyPart } from "@/types/api";
import { db } from "../lib/dbConfig";

// 最新更新日を取得
export const getLatestBodyPartUpdatedAt = async (): Promise<string> => {
  const row = await db.getFirstAsync<{ last_updated: string }>(
    "SELECT MAX(updated_at) as last_updated FROM body_parts;"
  );
  return row?.last_updated ?? "2025-01-01T00:00:00";
};

// 差分データをINSERT OR REPLACEで保存
export const upsertBodyParts = async (items: BodyPart[]) => {
  await db.withTransactionAsync(async () => {
    for (const item of items) {
      await db.runAsync(
        `INSERT OR REPLACE INTO body_parts (parts_id, name, updated_at) VALUES (?, ?, ?);`,
        [item.partsId, item.name, item.updatedAt]
      );
    }
  });
};

export const selectBodyPartsWithExercises = async () => {
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
