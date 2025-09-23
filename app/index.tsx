import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { userSyncFromRemote } from "@/localDb/sync/userSyncFromRemote";
import { syncLocalDb } from "@/localDb/sync/syncLocalDb";
import { masterSyncFromRemote } from "@/localDb/sync/masterSyncFromRemote";
import Indicator from "@/components/common/Indicator";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // バナー表示
    shouldPlaySound: true, // サウンド鳴らす
    shouldSetBadge: true, // バッジ更新
    shouldShowBanner: true, // バナー表示 (iOS 15+)
    shouldShowList: true, // 通知リスト表示 (iOS 15+)
  }),
});

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user?.emailVerified || user?.isAnonymous) {
        setIsAuthenticated(true);
        try {
          await masterSyncFromRemote();
          await syncLocalDb();
          await userSyncFromRemote();
        } catch (error) {
          console.error(error);
        }
      } else {
        try {
          await masterSyncFromRemote();
        } catch (e) {
          console.error(e);
        } finally {
          setIsAuthenticated(false);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (isAuthenticated === null) {
    return <Indicator />;
  }

  return (
    <Redirect
      href={
        isAuthenticated ? "/(main)/(tabs)/(home)/training" : "/(auth)/signIn"
      }
    />
  );
}
