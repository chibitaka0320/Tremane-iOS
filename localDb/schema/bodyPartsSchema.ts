// 部位テーブル
export const bodyPartsSchema = `
CREATE TABLE IF NOT EXISTS body_parts (
    parts_id INTEGER PRIMARY KEY,
    name TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`;
