import { db } from "@/lib/dbConfig";
import { BodyPartExerciseResponse } from "@/types/api";

export const getBodyPartsWithExercises = async (): Promise<
  BodyPartExerciseResponse[]
> => {
  const rows = await db.getAllAsync<{
    parts_id: number;
    part_name: string;
    exercise_id: number;
    exercise_name: string;
  }>(`
    SELECT
      bp.parts_id,
      bp.name AS part_name,
      ex.exercise_id,
      ex.name AS exercise_name
    FROM body_parts bp
    JOIN exercises ex ON ex.parts_id = bp.parts_id
    ORDER BY bp.parts_id, ex.exercise_id
  `);

  const map = new Map<number, BodyPartExerciseResponse>();

  for (const row of rows) {
    if (!map.has(row.parts_id)) {
      map.set(row.parts_id, {
        partsId: row.parts_id,
        name: row.part_name,
        exercises: [],
      });
    }

    if (row.exercise_id != null) {
      map.get(row.parts_id)!.exercises.push({
        exerciseId: row.exercise_id,
        name: row.exercise_name,
      });
    }
  }

  return Array.from(map.values());
};
