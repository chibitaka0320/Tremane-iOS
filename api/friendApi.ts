import {
  FriendRequestResponse,
  TimelineTrainingResponse,
  TrainingDateRankingResponse,
} from "@/types/api";
import { apiRequestAuth } from "./apiRequest";

// POST /friends/{receiveUserId}
export async function requestFriend(
  receiveUserId: string
): Promise<FriendRequestResponse | null> {
  const res = await apiRequestAuth<FriendRequestResponse>(
    `/friends/${receiveUserId}`,
    "POST",
    null
  );

  return res.data;
}

// PUT /friends/{requestId}/accept
export async function acceptFriend(requestId: string): Promise<string | null> {
  const res = await apiRequestAuth<string>(
    `/friends/${requestId}/accept`,
    "PUT",
    null
  );

  return res.data;
}

// DELETE /friends/{requestId}
export async function revokeFriend(requestId: string) {
  const res = await apiRequestAuth<void>(
    `/friends/${requestId}`,
    "DELETE",
    null
  );
}

// GET /friends/ranking
export async function getRankingMonthly(): Promise<
  TrainingDateRankingResponse[] | null
> {
  const res = await apiRequestAuth<TrainingDateRankingResponse[]>(
    `/friends/ranking`,
    "GET",
    null
  );

  return res.data;
}

// GET /friends/timeline
export async function getTimeline(): Promise<
  TimelineTrainingResponse[] | null
> {
  const res = await apiRequestAuth<TimelineTrainingResponse[]>(
    `/friends/timeline`,
    "GET",
    null
  );

  return res.data;
}
