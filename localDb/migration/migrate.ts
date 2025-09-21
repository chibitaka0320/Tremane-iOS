import { db } from "@/lib/localDbConfig";
import { bodyPartsSchema } from "../schema/bodyPartsSchema";
import { eatingsSchema } from "../schema/eatingsSchema";
import { exercisesSchema } from "../schema/exercisesSchema";
import { myExercisesScheam } from "../schema/myExercisesSchema";
import { trainingsSchema } from "../schema/trainingsSchema";
import { userGoalsSchema } from "../schema/userGoalsSchema";
import { userProfilesShema } from "../schema/userProfilesShema";
import { usersSchema } from "../schema/usersSchema";

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
    ${myExercisesScheam}
    ${usersSchema}
    ${userProfilesShema}
    ${userGoalsSchema}
    ${trainingsSchema}
    ${eatingsSchema}
  `);

    console.log("✅ テーブル作成成功");
  } catch (error) {
    console.error("❌ テーブル作成失敗: ", error);
  } finally {
    console.log("========== テーブル作成終了 ==========");
  }
}
