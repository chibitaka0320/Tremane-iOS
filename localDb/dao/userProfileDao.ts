import { db } from "@/lib/localDbConfig";
import { UserProfileEntity } from "@/types/db";

// 最新更新日を取得
export async function getLastUpdatedAt(): Promise<string> {
  const row = await db.getFirstAsync<{ last_updated: string }>(
    "SELECT MAX(updated_at) as last_updated FROM users_profile;"
  );
  return row?.last_updated ?? "1970-01-01T00:00:00";
}

// 非同期データを取得
export async function getUnsyncedUserProfile(): Promise<UserProfileEntity | null> {
  const unsynced = await db.getFirstAsync<UserProfileEntity>(
    `
    SELECT
      user_id,
      height,
      weight,
      birthday,
      gender,
      active_level,
      created_at,
      updated_at
    FROM
      users_profile
    WHERE
      is_synced = 0
    ;
    `
  );
  return unsynced;
}

// フラグを同期済みにする
export async function setUserProfileSynced() {
  await db.runAsync(`UPDATE users_profile SET is_synced = 1`);
}

// 取得
export async function getUserProfile(): Promise<UserProfileEntity | null> {
  const data = await db.getFirstAsync<UserProfileEntity>(
    `
      SELECT
          user_id,
          height,
          weight,
          birthday,
          gender,
          active_level,
          created_at,
          updated_at
      FROM
          users_profile
      ;
    `
  );

  return data;
}

// 追加 or 更新
export async function upsertUserProfile(userProfile: UserProfileEntity) {
  await db.runAsync(
    `INSERT OR REPLACE INTO users_profile (user_id, height, weight, birthday, gender, active_level, is_synced, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      userProfile.user_id,
      userProfile.height,
      userProfile.weight,
      userProfile.birthday,
      userProfile.gender,
      userProfile.active_level,
      userProfile.is_synced,
      userProfile.created_at,
      userProfile.updated_at,
    ]
  );
}

// 削除
export async function deleteUserProfile() {
  await db.runAsync(`DELETE FROM users_profile`);
}
