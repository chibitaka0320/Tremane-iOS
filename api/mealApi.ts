import { MealRequest, MealResponse } from "@/types/api";
import { apiRequestAuth } from "./apiRequest";

// GET /meals
export async function getMeals(
  lastUpdated: string
): Promise<MealResponse[] | null> {
  const res = await apiRequestAuth<MealResponse[]>(
    "/meals?updatedAt=" + lastUpdated,
    "GET",
    null
  );
  return res.data;
}

// POST /meals
export async function upsertMeals(meals: MealRequest[]) {
  await apiRequestAuth<void>("/meals", "POST", meals);
}

// DELETE /meals/{mealId}
export async function deleteMeal(mealId: string) {
  await apiRequestAuth<void>("/meals/" + mealId, "DELETE", null);
}
