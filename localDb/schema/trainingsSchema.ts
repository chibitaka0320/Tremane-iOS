// トレーニングテーブル
export const trainingsSchema = `
CREATE TABLE IF NOT EXISTS trainings (
    training_id TEXT PRIMARY KEY,
    date TEXT,
    user_id TEXT,
    exercise_id TEXT,
    weight INTEGER,
    reps INTEGER,
    is_synced INTEGER DEFAULT 0,
    is_deleted INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`;
