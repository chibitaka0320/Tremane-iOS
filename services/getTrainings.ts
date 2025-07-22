import { db } from "@/lib/dbConfig";
import { BodyPartType } from "@/types/training";

export const getTrainings = async (date: string): Promise<BodyPartType[]> => {
  const rows = await db.getAllAsync<{
    parts_id: number;
    body_part_name: string;
    exercise_id: number;
    exercise_name: string;
    training_id: number;
    weight: number;
    reps: number;
  }>(
    `
    SELECT
      b.parts_id,
      b.name AS body_part_name,
      e.exercise_id,
      e.name AS exercise_name,
      t.training_id,
      t.weight,
      t.reps
    FROM trainings t
    LEFT JOIN exercises e ON t.exercise_id = e.exercise_id
    LEFT JOIN body_parts b ON e.parts_id = b.parts_id
    WHERE t.date = ?
    ORDER BY b.name, e.name
  `,
    [date]
  );

  const partsMap = new Map<number, BodyPartType>();

  for (const row of rows) {
    if (!partsMap.has(row.parts_id)) {
      partsMap.set(row.parts_id, {
        partsId: row.parts_id,
        name: row.body_part_name,
        exercises: [],
      });
    }

    const part = partsMap.get(row.parts_id)!;

    let exercise = part.exercises.find(
      (ex) => ex.exerciseId === row.exercise_id
    );

    if (!exercise && row.exercise_id != null) {
      exercise = {
        exerciseId: row.exercise_id,
        name: row.exercise_name,
        sets: [],
      };
      part.exercises.push(exercise);
    }

    if (row.training_id != null && exercise) {
      exercise.sets.push({
        trainingId: row.training_id,
        weight: row.weight,
        reps: row.reps,
      });
    }
  }

  return Array.from(partsMap.values());
};
