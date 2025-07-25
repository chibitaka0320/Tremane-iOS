import { getBodyPartsWithExercisesDao } from "../dao/bodyPartDao";
import { BodypartWithExercise } from "@/types/bodyPart";

export const getBodyPartsWithExercises = async (): Promise<
  BodypartWithExercise[]
> => {
  const rows = await getBodyPartsWithExercisesDao();

  const map = new Map<number, BodypartWithExercise>();

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
