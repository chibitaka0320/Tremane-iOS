import { UserGoalRequest, UserGoalResponse } from "@/types/api";
import { apiRequestAuth } from "./apiRequest";

// GET /users/goal
export async function getUserGoal(
  lastUpdated: string
): Promise<UserGoalResponse | null> {
  const res = await apiRequestAuth<UserGoalResponse>(
    "/users/goal?updatedAt=" + lastUpdated,
    "GET",
    null
  );
  return res.data;
}

// POST /users/goal
export async function upsertUserGoal(userGoal: UserGoalRequest) {
  await apiRequestAuth<void>("/users/goal", "POST", userGoal);
}
