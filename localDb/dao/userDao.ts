import { db } from "@/lib/localDbConfig";
import { UserEntity } from "@/types/db";

// ユーザー追加
export async function insertUser(user: UserEntity) {
  await db.runAsync(
    `INSERT OR REPLACE INTO users (user_id, nickname, created_at, updated_at) VALUES (?, ?, ?, ?);`,
    [user.user_id, user.nickname, user.created_at, user.updated_at]
  );
}

// ユーザー更新
export async function updateUser(nickname: string, updatedAt: string) {
  await db.runAsync(`UPDATE users SET nickname = ?, updated_at = ?;`, [
    nickname,
    updatedAt,
  ]);
}

// ユーザー物理削除
export async function deleteUser() {
  await db.runAsync(`DELETE FROM users`);
}

// ユーザー情報取得
export async function getUser(): Promise<UserEntity | null> {
  const user = await db.getFirstAsync<UserEntity>(
    `SELECT user_id, nickname, created_at, updated_at FROM users`
  );
  return user;
}
