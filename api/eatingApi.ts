import { EatingRequest, EatingResponse } from "@/types/api";
import { apiRequestAuth } from "./apiRequest";

// GET /eating
export async function getEatings(
  lastUpdated: string
): Promise<EatingResponse[] | null> {
  const res = await apiRequestAuth<EatingResponse[]>(
    "/eating?updatedAt=" + lastUpdated,
    "GET",
    null
  );
  return res.data;
}

// POST /eating
export async function upsertEatings(eatings: EatingRequest[]) {
  await apiRequestAuth<void>("/eating", "POST", eatings);
}

// DELETE /eating/{eatingId}
// TODO: 複数削除を可能とするか検討
export async function deleteEating(eatingId: string) {
  await apiRequestAuth<void>("/eating?eatingId=" + eatingId, "DELETE", null);
}
