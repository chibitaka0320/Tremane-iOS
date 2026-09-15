import { db } from "@/lib/localDbConfig";
import { bodyPartsSchema } from "../schema/bodyPartsSchema";
import { eatingsSchema } from "../schema/eatingsSchema";
import { exercisesSchema } from "../schema/exercisesSchema";
import { mealsSchema } from "../schema/mealsSchema";
import { trainingsSchema } from "../schema/trainingsSchema";
import { userGoalsSchema } from "../schema/userGoalsSchema";
import { userProfilesSchema } from "../schema/userProfilesSchema";
import { usersSchema } from "../schema/usersSchema";

// 既存インストール向けのカラム追加（CREATE TABLE IF NOT EXISTSでは既存テーブルにカラムを追加できないため）。
// SQLiteは既存カラムへのADD COLUMNで「duplicate column name」エラーを返すので、それだけを無視することで
// 新規インストール（スキーマに最初からカラムが存在）・既存インストール（ここでカラムを追加）の両方に対応する。
async function addColumnIfNotExists(table: string, column: string, type: string) {
  try {
    await db.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${type};`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("duplicate column name")) {
      throw error;
    }
  }
}

// DBにスキーマを適用
export async function migrate() {
  console.log("========== テーブル作成開始 ==========");
  try {
    // 外部キー制約を有効化
    await db.execAsync("PRAGMA foreign_keys = ON;");

    // CREATE TABLE
    await db.execAsync(`
    ${bodyPartsSchema}
    ${exercisesSchema}
    ${usersSchema}
    ${userProfilesSchema}
    ${userGoalsSchema}
    ${trainingsSchema}
    ${eatingsSchema}
    ${mealsSchema}
  `);

    // 既存インストール向けのカラム追加
    await addColumnIfNotExists("eatings", "meal_id", "TEXT");
    await addColumnIfNotExists("eatings", "unit", "TEXT");

    console.log("✅ テーブル作成成功");
  } catch (error) {
    console.error("❌ テーブル作成失敗: ", error);
  } finally {
    console.log("========== テーブル作成終了 ==========");
  }
}
