import * as Notifications from "expo-notifications";
import { useEffect } from "react";

export function useForegroundNotificationHandler(onReceive: () => void) {
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        onReceive();
      }
    );

    return () => subscription.remove();
  }, [onReceive]);
}
