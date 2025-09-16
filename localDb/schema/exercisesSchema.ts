// 種目テーブル
export const exercisesSchema = `
CREATE TABLE IF NOT EXISTS exercises (
    exercise_id TEXT PRIMARY KEY,
    owner_user_id TEXT DEFAULT NULL,
    parts_id INTEGER,
    name TEXT,
    is_synced INTEGER DEFAULT 0,
    is_deleted INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`;
