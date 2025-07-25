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
