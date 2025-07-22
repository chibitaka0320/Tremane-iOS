import { selectBodyPartsWithExercises } from "@/dao/bodyPartDao";
import { BodyPartExerciseResponse } from "@/types/api";

export const getBodyPartsWithExercises = async (): Promise<
  BodyPartExerciseResponse[]
> => {
  const rows = await selectBodyPartsWithExercises();

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
