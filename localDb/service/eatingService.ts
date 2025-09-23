import { EatingByDate, Goal, Meal, Rate, Total } from "@/types/eating";
import { getEatingByDateDao } from "../dao/eatingDao";
import { Eating, UserGoal } from "@/types/localDb";
import { getUserGoalDao } from "../dao/userGoalDao";
import { calcGoalKcal } from "@/lib/calc";
import * as userProfileRepository from "@/localDb/repository/userProfileRepository";
import { UserProfileEntity } from "@/types/db";

export const getEatingByDate = async (date: string): Promise<EatingByDate> => {
  const eatings: Eating[] = await getEatingByDateDao(date);
  const userProfile = await userProfileRepository.getUserProfile();
  const userGoal: UserGoal | null = await getUserGoalDao();

  const total = createTotal(eatings);
  const goal = createGoal(userProfile, userGoal);
  const rate = createRate(total, goal);
  const meals = createMeal(eatings);

  const result: EatingByDate = {
    date,
    total,
    goal,
    rate,
    meals,
  };

  return result;
};

const createTotal = (eatings: Eating[]): Total => {
  let calories = 0;
  let protein = 0;
  let fat = 0;
  let carbo = 0;

  for (const eating of eatings) {
    calories += eating.calories;
    protein += eating.protein;
    fat += eating.fat;
    carbo += eating.carbo;
  }

  const total: Total = {
    calories: Math.round(calories * 10) / 10,
    protein: Math.round(protein * 10) / 10,
    fat: Math.round(fat * 10) / 10,
    carbo: Math.round(carbo * 10) / 10,
  };
  return total;
};

const createMeal = (eatings: Eating[]): Meal[] => {
  const meal: Meal[] = [];

  for (const eating of eatings) {
    meal.push({
      eatingId: eating.eatingId,
      date: eating.date,
      name: eating.name,
      calories: eating.calories,
      protein: eating.protein,
      fat: eating.fat,
      carbo: eating.carbo,
    });
  }

  return meal;
};

const createGoal = (
  prof: UserProfileEntity | null,
  goal: UserGoal | null
): Goal => {
  let calories = 0;
  let protein = 0;
  let fat = 0;
  let carbo = 0;

  if (prof && goal) {
    // 目標摂取カロリー算出
    calories = calcGoalKcal(prof, goal);

    // 目標PFC算出
    if (calories > 0) {
      if (goal.pfc == 0) {
        protein = Math.round((calories * 0.4) / 4);
        fat = Math.round((calories * 0.2) / 9);
        carbo = Math.round((calories * 0.4) / 4);
      } else if (goal.pfc == 1) {
        protein = Math.round((calories * 0.3) / 4);
        fat = Math.round((calories * 0.2) / 9);
        carbo = Math.round((calories * 0.5) / 4);
      } else if (goal.pfc == 2) {
        protein = Math.round((calories * 0.55) / 4);
        fat = Math.round((calories * 0.25) / 9);
        carbo = Math.round((calories * 0.5) / 4);
      }
    }
  }

  const result: Goal = {
    calories,
    protein,
    fat,
    carbo,
  };

  return result;
};

const createRate = (total: Total, goal: Goal): Rate => {
  let protein = 0;
  let fat = 0;
  let carbo = 0;

  if (goal.protein > 0) {
    protein = total.protein / goal.protein;
    if (protein > 1) {
      protein = 1;
    }
  }

  if (goal.fat > 0) {
    fat = total.fat / goal.fat;
    if (fat > 1) {
      fat = 1;
    }
  }
  if (goal.carbo > 0) {
    carbo = total.carbo / goal.carbo;
    if (carbo > 1) {
      carbo = 1;
    }
  }

  const rate: Rate = {
    protein,
    fat,
    carbo,
  };

  return rate;
};
