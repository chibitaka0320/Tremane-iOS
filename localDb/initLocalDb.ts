import { db } from "@/lib/localDbConfig";

export const initLocalDb = async () => {
  try {
    await db.execAsync(`PRAGMA foreign_keys = ON;`);

    // 部位マスタテーブル
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS body_parts (
        parts_id INTEGER PRIMARY KEY,
        name TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 種目マスタテーブル
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS exercises (
        exercise_id INTEGER PRIMARY KEY,
        parts_id INTEGER,
        name TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ユーザーテーブル
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ユーザープロフィールテーブル
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users_profile (
        user_id TEXT PRIMARY KEY,
        nickname TEXT,
        height INTEGER,
        weight INTEGER,
        birthday TEXT,
        gender INTEGER,
        active_level INTEGER,
        is_synced INTEGER DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // トレーニングテーブル
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS trainings (
        training_id TEXT PRIMARY KEY,
        date TEXT,
        user_id TEXT,
        exercise_id INTEGER,
        weight INTEGER,
        reps INTEGER,
        is_synced INTEGER DEFAULT 0,
        is_deleted INTEGER DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("データベース初期化完了");
  } catch (error) {
    console.error(error);
  }
};
