import { MealAnalyzeRequest, MealAnalyzeResponse } from "@/types/api";
import { apiRequestAuth } from "./apiRequest";

// POST /meals/analyze
export async function analyzeMealPhoto(
  request: MealAnalyzeRequest
): Promise<MealAnalyzeResponse | null> {
  const res = await apiRequestAuth<MealAnalyzeResponse>(
    "/meals/analyze",
    "POST",
    request
  );
  return res.data;
}
