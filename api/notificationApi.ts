import { NotificationResponse } from "@/types/api";
import { apiRequestAuth } from "./apiRequest";

// GET /notifications
export async function getNotifications(): Promise<
  NotificationResponse[] | null
> {
  const res = await apiRequestAuth<NotificationResponse[]>(
    `/notifications`,
    "GET",
    null
  );

  return res.data;
}

// GET /notifications/noread
export async function getNoreadCount(): Promise<number | null> {
  const res = await apiRequestAuth<number>(
    `/notifications/noread`,
    "GET",
    null
  );

  return res.data;
}

// PUT /notifications/read
export async function markAllRead() {
  await apiRequestAuth<void>(`/notifications/read`, "PUT", null);
}
