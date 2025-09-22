import { TrainingRequest, TrainingResponse } from "@/types/api";
import { apiRequestAuth } from "./apiRequest";

// GET /training
export async function getTrainings(
  lastUpdated: string
): Promise<TrainingResponse[] | null> {
  const res = await apiRequestAuth<TrainingResponse[]>(
    "/training?updatedAt=" + lastUpdated,
    "GET",
    null
  );
  return res.data;
}

// POST /training
export async function upsertTrainings(trainings: TrainingRequest[]) {
  await apiRequestAuth<void>("/training", "POST", trainings);
}

// DELETE /training/{trainingId}
// TODO: 複数削除を可能とするか検討
export async function deleteTraining(trainingId: string) {
  await apiRequestAuth<void>("/training/" + trainingId, "DELETE", null);
}
