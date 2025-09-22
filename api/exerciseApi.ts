import { ExerciseRequest, ExerciseResponse } from "@/types/api";
import { apiRequestAuth } from "./apiRequest";

// GET /exercise/myself
export async function getMyExercises(
  lastUpdated: string
): Promise<ExerciseResponse[] | null> {
  const res = await apiRequestAuth<ExerciseResponse[]>(
    "/exercise/myself?updatedAt=" + lastUpdated,
    "GET",
    null
  );
  return res.data;
}

// POST /exercise/myself
export async function upsertMyExercises(exercises: ExerciseRequest[]) {
  await apiRequestAuth<void>("/exercise/myself", "POST", exercises);
}

// DELETE /exercise/myself/{execiseId}
// TODO: 複数削除を可能とするか検討
export async function deleteMyExercise(execiseId: string) {
  await apiRequestAuth<void>("/exercise/myself/" + execiseId, "DELETE", null);
}
