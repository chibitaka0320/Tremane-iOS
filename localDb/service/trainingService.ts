import { TrainingByDate } from "@/types/training";
import { getTrainingByDateDao } from "../dao/trainingDao";

export const getTrainingByDate = async (
  date: string
): Promise<TrainingByDate[]> => {
  const rows = await getTrainingByDateDao(date);

  const map = new Map<number, TrainingByDate>();

  for (const row of rows) {
    if (!map.has(row.parts_id)) {
      map.set(row.parts_id, {
        partsId: row.parts_id,
        name: row.parts_name,
        exercises: [],
      });
    }

    const parts = map.get(row.parts_id);

    let exercise = parts?.exercises.find(
      (ex) => ex.exerciseId === row.exercise_id
    );

    if (!exercise && row.exercise_id != null) {
      exercise = {
        exerciseId: row.exercise_id,
        name: row.exercise_name,
        sets: [],
      };
      parts!.exercises.push(exercise);
    }

    if (exercise && row.training_id != null) {
      exercise.sets.push({
        trainingId: row.training_id,
        weight: row.weight,
        reps: row.reps,
      });
    }
  }

  return Array.from(map.values());
};
