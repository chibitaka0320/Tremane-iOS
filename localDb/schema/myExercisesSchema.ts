// マイ種目テーブル
export const myExercisesScheam = `
CREATE TABLE IF NOT EXISTS my_exercises (
    exercise_id TEXT PRIMARY KEY,
    parts_id INTEGER,
    name TEXT,
    is_synced INTEGER DEFAULT 0,
    is_deleted INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`;
