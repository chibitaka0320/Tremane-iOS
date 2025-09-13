import { apiRequestWithRefresh } from "@/lib/apiClient";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect } from "react";

export function useNotificationHandler() {
  useEffect(() => {
    // 通知タップ時
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        apiRequestWithRefresh("/notifications/read", "PUT");

        if (router.canDismiss()) {
          router.dismissAll();
        }

        router.push("/training");
        router.push("/notification");
      }
    );

    return () => subscription.remove();
  }, []);
}
