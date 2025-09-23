import { BodyPartResponse } from "@/types/api";
import { apiRequest } from "./apiRequest";

// GET /bodyparts
export async function getBodyParts(
  lastUpdated: string
): Promise<BodyPartResponse[] | null> {
  const res = await apiRequest<BodyPartResponse[]>(
    "/bodyparts?updatedAt=" + lastUpdated,
    "GET",
    null
  );
  return res.data;
}
