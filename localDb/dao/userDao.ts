import { db } from "@/lib/localDbConfig";
import { User } from "@/types/localDb";

// 追加
export const insertUserDao = async (user: User) => {
  await db.runAsync(
    `INSERT OR REPLACE INTO users (user_id, nickname, created_at, updated_at) VALUES (?, ?, ?, ?);`,
    [user.userId, user.nickname, user.createdAt, user.updatedAt]
  );
};

// ニックネーム更新
export const updateNicknameDao = async (
  nickname: string,
  updatedAt: string
) => {
  await db.runAsync(`UPDATE users SET nickname = ?, updated_at = ?;`, [
    nickname,
    updatedAt,
  ]);
};

// 削除
export const deleteUserDao = async () => {
  await db.runAsync(`DELETE FROM users`);
};
