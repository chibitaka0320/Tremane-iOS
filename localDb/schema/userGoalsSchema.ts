// ユーザー目標テーブル
export const userGoalsSchema = `
CREATE TABLE IF NOT EXISTS users_goal (
    user_id TEXT PRIMARY KEY,
    weight INTEGER,
    goal_weight INTEGER,
    start TEXT,
    finish INTEGER,
    pfc TEXT,
    is_synced INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`;
