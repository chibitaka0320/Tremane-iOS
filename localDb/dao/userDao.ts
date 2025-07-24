import { db } from "@/lib/localDbConfig";
import { User } from "@/types/localDb";

// 追加
export const insertUserDao = async (user: User) => {
  await db.runAsync(
    `INSERT OR REPLACE INTO users (user_id, created_at, updated_at) VALUES (?, ?, ?);`,
    [user.userId, user.createdAt, user.updatedAt]
  );
};
