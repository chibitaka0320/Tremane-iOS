import { getDb } from "../db";
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
  try {
    const db = getDb();

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

    console.log("✅ データベース作成成功");
  } catch (error) {
    console.error("❌ データベース作成失敗: ", error);
  }
}
