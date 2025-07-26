import { db } from "@/lib/localDbConfig";
import { UserGoal } from "@/types/localDb";

export const getUserGoalDao = async (): Promise<UserGoal | null> => {
  const data = await db.getFirstAsync<UserGoal | null>(
    `
    SELECT
        user_id AS userId,
        weight,
        goal_weight AS goalWeight,
        start,
        finish,
        pfc,
        created_at AS createdAt,
        updated_at AS updatedAt
    FROM users_goal;
    `
  );

  return data;
};
