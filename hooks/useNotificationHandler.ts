import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useEffect } from "react";

export function useNotificationHandler() {
  useEffect(() => {
    // 通知タップ時
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        router.push({
          pathname: "/notification",
        });
      }
    );

    return () => subscription.remove();
  }, []);
}
