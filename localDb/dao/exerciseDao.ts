import { db } from "@/lib/localDbConfig";
import { ExerciseEntity } from "@/types/db";
import { Exercise } from "@/types/localDb";

// 最新更新日を取得
export async function getLastUpdatedAt(): Promise<string> {
  const row = await db.getFirstAsync<{ last_updated: string }>(
    "SELECT MAX(updated_at) as last_updated FROM exercises WHERE owner_user_id IS null;"
  );
  return row?.last_updated ?? "1970-01-01T00:00:00";
}

// 追加 or 更新
export async function upsertExercises(exercises: ExerciseEntity[]) {
  await db.withTransactionAsync(async () => {
    for (const exercise of exercises) {
      await db.runAsync(
        `
        INSERT OR REPLACE INTO exercises (exercise_id, parts_id, name, is_synced, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          exercise.exercise_id,
          exercise.parts_id,
          exercise.name,
          exercise.is_synced,
          exercise.created_at,
          exercise.updated_at,
        ]
      );
    }
  });
}
