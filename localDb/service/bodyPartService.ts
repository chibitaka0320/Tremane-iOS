import {
  getBodyPartsWithExercisesDao,
  getBodyPartsWithMyExercisesDao,
} from "../dao/bodyPartDao";
import { BodypartWithExercise } from "@/types/bodyPart";

export const getBodyPartsWithExercises = async (): Promise<
  BodypartWithExercise[]
> => {
  const rowsWithMyExercise = await getBodyPartsWithMyExercisesDao();

  const rowsWithExercise = await getBodyPartsWithExercisesDao();

  const map = new Map<number, BodypartWithExercise>();

  for (const row of rowsWithMyExercise) {
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
        myFlg: true,
      });
    }
  }

  for (const row of rowsWithExercise) {
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

  const sortedMap = new Map([...map.entries()].sort((a, b) => a[0] - b[0]));

  return Array.from(sortedMap.values());
};
