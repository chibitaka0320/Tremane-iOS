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
