import { UserGoalDto } from "@/types/api";
import { calcGoalKcal } from "@/lib/calc";
import * as userProfileRepository from "@/localDb/repository/userProfileRepository";
import * as userGoalRepository from "@/localDb/repository/userGoalRepository";

export const getUserGoal = async () => {
  const goal = await userGoalRepository.getUserGoal();
  const prof = await userProfileRepository.getUserProfile();

  let goalCalorie = 0;

  if (prof && goal) {
    goalCalorie = calcGoalKcal(prof, goal);
  }

  if (goal) {
    const userGoal: UserGoalDto = {
      weight: goal.weight,
      goalWeight: goal.goal_weight,
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
