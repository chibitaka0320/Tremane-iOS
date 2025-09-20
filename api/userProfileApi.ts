import { UserProfileRequest, UserProfileResponse } from "@/types/api";
import { apiRequestAuth } from "./apiRequest";

// GET /users/profile
export async function getUserProfile(
  lastUpdated: string
): Promise<UserProfileResponse | null> {
  const res = await apiRequestAuth<UserProfileResponse>(
    "/users/profile?updatedAt=" + lastUpdated,
    "GET",
    null
  );
  return res.data;
}

// POST /users/profile
export async function upsertUserProfile(userProfile: UserProfileRequest) {
  await apiRequestAuth<void>("/users/profile", "POST", userProfile);
}
