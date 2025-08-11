import { TrainingAnalysis, TrainingByDate } from "@/types/training";
import {
  getTrainingByDateDao,
  getTrainingDataByMaxWeightDao,
} from "../dao/trainingDao";
import { format } from "date-fns";

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

export const getTrainingByMaxWeight = async (
  partsId: string
): Promise<TrainingAnalysis[]> => {
  const rows = await getTrainingDataByMaxWeightDao(partsId);

  const map = new Map<string, TrainingAnalysis>();

  for (const row of rows) {
    if (!map.has(row.exercise_id)) {
      map.set(row.exercise_id, {
        labels: [],
        datasets: [
          {
            data: [],
          },
        ],
        name: row.name,
      });
    }

    const training = map.get(row.exercise_id);
    training?.labels.push(format(row.date, "MM/dd"));
    training?.datasets[0].data.push(row.weight);
  }

  return Array.from(map.values());
};
