import { db } from "../lib/dbConfig";

export const initDatabase = async () => {
  try {
    await db.execAsync(`PRAGMA foreign_keys = ON`);

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS body_parts (
        parts_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT (datetime('now')),
        updated_at DATETIME NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS exercises (
        exercise_id INTEGER PRIMARY KEY AUTOINCREMENT,
        parts_id INTEGER NOT NULL,
        name TEXT,
        created_at DATETIME NOT NULL DEFAULT (datetime('now')),
        updated_at DATETIME NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (parts_id) REFERENCES body_parts(parts_id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        created_at DATETIME NOT NULL DEFAULT (datetime('now')),
        updated_at DATETIME NOT NULL DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS users_profile (
        user_id TEXT PRIMARY KEY,
        nickname TEXT,
        height INTEGER,
        weight INTEGER,
        birthday TEXT,
        gender INTEGER,
        active_level INTEGER,
        created_at DATETIME NOT NULL DEFAULT (datetime('now')),
        updated_at DATETIME NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS trainings (
        training_id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        user_id TEXT NOT NULL,
        exercise_id INTEGER NOT NULL,
        weight INTEGER,
        reps INTEGER,
        is_synced INTEGER DEFAULT 0,
        deleted INTEGER DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (exercise_id) REFERENCES exercises(exercise_id) ON DELETE CASCADE
      );
    `);

    console.log("✅ DB初期化完了");
  } catch (e) {
    console.error("❌ DB初期化エラー:", e);
  }
};
