import { db } from "@/lib/localDbConfig";
import { UserProfile } from "@/types/localDb";

// 最新更新日を取得
export const getLatestUserProfile = async (): Promise<string> => {
  const row = await db.getFirstAsync<{ last_updated: string }>(
    "SELECT MAX(updated_at) as last_updated FROM users_profile;"
  );
  return row?.last_updated ?? "1970-01-01T00:00:00";
};

// フラグを同期済みにする
export const setUserProfileSynced = async () => {
  await db.runAsync(`UPDATE users_profile SET is_synced = 1`);
};

// 取得
export const getUserProfileDao = async (): Promise<UserProfile | null> => {
  const data = await db.getFirstAsync<UserProfile | null>(
    `
      SELECT
          user_id AS userId,
          nickname,
          height,
          weight,
          birthday,
          gender,
          active_level AS activeLevel,
          created_at AS createdAt,
          updated_at AS updatedAt
      FROM
          users_profile
      ;
    `
  );

  return data;
};

// 追加
export const insertUserProfileDao = async (
  userProfile: UserProfile,
  syncFlg: number
) => {
  await db.runAsync(
    `INSERT OR REPLACE INTO users_profile (user_id, nickname, height, weight, birthday, gender, active_level, is_synced, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      userProfile.userId,
      userProfile.nickname,
      userProfile.height,
      userProfile.weight,
      userProfile.birthday,
      userProfile.gender,
      userProfile.activeLevel,
      syncFlg,
      userProfile.createdAt,
      userProfile.updatedAt,
    ]
  );
};
