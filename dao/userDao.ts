import { User } from "@/types/api";
import { db } from "../lib/dbConfig";

export const upsertUsers = async (item: User) => {
  await db.runAsync(
    `INSERT OR REPLACE INTO users (user_id, created_at, updated_at) VALUES (?, ?, ?);`,
    [item.userId, item.createdAt, item.updatedAt]
  );
};
