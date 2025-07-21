import { db } from "./db";

export const initDatabase = async () => {
  try {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS body_parts (
        parts_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS exercises (
        exercise_id INTEGER PRIMARY KEY AUTOINCREMENT,
        parts_id INTEGER NOT NULL,
        name TEXT,
        created_at DATETIME NOT NULL DEFAULT (datetime('now')),
        updated_at DATETIME NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (parts_id) REFERENCES body_parts(parts_id) ON DELETE CASCADE
      );
    `);

    console.log("✅ DB初期化完了");
  } catch (e) {
    console.error("❌ DB初期化エラー:", e);
  }
};
