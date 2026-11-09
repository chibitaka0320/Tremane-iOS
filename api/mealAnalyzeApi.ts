import {
  MealAnalyzeRequest,
  MealAnalyzeResponse,
  MealAnalyzeUsageResponse,
} from "@/types/api";
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

// GET /meals/analyze/usage
export async function getAnalyzeUsage(): Promise<MealAnalyzeUsageResponse | null> {
  const res = await apiRequestAuth<MealAnalyzeUsageResponse>(
    "/meals/analyze/usage",
    "GET",
    null
  );
  return res.data;
}
