// 食事テーブル
export const eatingsSchema = `
CREATE TABLE IF NOT EXISTS eatings (
    eating_id TEXT PRIMARY KEY,
    date TEXT,
    user_id TEXT,
    name TEXT,
    calories INTEGER,
    protein INTEGER,
    fat INTEGER,
    carbo INTEGER,
    is_synced INTEGER DEFAULT 0,
    is_deleted INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`;
