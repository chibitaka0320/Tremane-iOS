// 食事記録テーブル（複数の食品記録をまとめる親レコード）
export const mealsSchema = `
CREATE TABLE IF NOT EXISTS meals (
    meal_id TEXT PRIMARY KEY,
    date TEXT,
    user_id TEXT,
    name TEXT,
    is_synced INTEGER DEFAULT 0,
    is_deleted INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`;
