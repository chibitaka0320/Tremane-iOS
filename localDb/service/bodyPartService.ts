import { getBodyPartsWithExercisesDao } from "../dao/bodyPartDao";
import { BodypartWithExercise } from "@/types/bodyPart";

export const getBodyPartsWithExercises = async (): Promise<
  BodypartWithExercise[]
> => {
  const rowsWithExercise = await getBodyPartsWithExercisesDao();

  const map = new Map<number, BodypartWithExercise>();

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
        myFlg: row.owner_user_id === null ? false : true,
      });
    }
  }

  return Array.from(map.values());
};
