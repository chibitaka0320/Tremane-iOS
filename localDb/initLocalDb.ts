import { db } from "@/lib/localDbConfig";

export const initLocalDb = async () => {
  try {
    await db.execAsync(`PRAGMA foreign_keys = ON;`);

    // ユーザーテーブル
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
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
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
    `);

    console.log("データベース初期化完了");
  } catch (error) {
    console.error(error);
  }
};
