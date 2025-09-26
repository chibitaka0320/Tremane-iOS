import { TrainingAnalysis } from "@/types/training";
import {
  getTrainingAllCount,
  getTrainingAllDataByMaxWeightDao,
  getTrainingCount,
  getTrainingDataByMaxWeightDao,
} from "../dao/trainingDao";
import { format } from "date-fns";

export const getTrainingByMaxWeight = async (
  partsId: string
): Promise<TrainingAnalysis[]> => {
  let rows;

  if (partsId === "0") {
    rows = await getTrainingAllDataByMaxWeightDao();
  } else {
    rows = await getTrainingDataByMaxWeightDao(partsId);
  }

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

export const getWorkoutCount = async (
  partsId: string
): Promise<{ week: number; month: number; year: number }> => {
  let week = 0;
  let month = 0;
  let year = 0;

  const now = new Date();

  // week
  const dayOfWeek = now.getDay();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dayOfWeek);
  const weekEnd = new Date(now);
  weekEnd.setDate(now.getDate() + (6 - dayOfWeek));

  // month
  const monthStart = formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
  const monthEnd = formatDate(
    new Date(now.getFullYear(), now.getMonth() + 1, 0)
  );

  // year
  const yearStart = formatDate(new Date(now.getFullYear(), 0, 1));
  const yearEnd = formatDate(new Date(now.getFullYear(), 11, 31));

  if (partsId === "0") {
    week = await getTrainingAllCount(
      formatDate(weekStart),
      formatDate(weekEnd)
    );
    month = await getTrainingAllCount(monthStart, monthEnd);
    year = await getTrainingAllCount(yearStart, yearEnd);
  } else {
    week = await getTrainingCount(
      formatDate(weekStart),
      formatDate(weekEnd),
      partsId
    );
    month = await getTrainingCount(monthStart, monthEnd, partsId);
    year = await getTrainingCount(yearStart, yearEnd, partsId);
  }

  return { week, month, year };
};

const formatDate = (date: Date): string => {
  return format(date, "yyyy-MM-dd");
};
