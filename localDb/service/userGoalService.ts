import { UserGoalResponse } from "@/types/api";
import { getUserGoalDao } from "../dao/userGoalDao";
import { getUserProfileDao } from "../dao/userProfileDao";
import { calcGoalKcal } from "@/lib/calc";

export const getUserGoal = async () => {
  const goal = await getUserGoalDao();
  const prof = await getUserProfileDao();

  let goalCalorie = 0;

  if (prof && goal) {
    goalCalorie = calcGoalKcal(prof, goal);
  }

  if (goal) {
    const userGoal: UserGoalResponse = {
      weight: goal.weight,
      goalWeight: goal.goalWeight,
      goalCalorie,
      start: new Date(goal.start),
      finish: new Date(goal.finish),
      pfc: goal.pfc,
    };

    return userGoal;
  } else {
    return null;
  }
};
