// ユーザープロフィールテーブル
export const userProfilesShema = `
CREATE TABLE IF NOT EXISTS users_profile (
    user_id TEXT PRIMARY KEY,
    height INTEGER,
    weight INTEGER,
    birthday TEXT,
    gender INTEGER,
    active_level INTEGER,
    is_synced INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`;
