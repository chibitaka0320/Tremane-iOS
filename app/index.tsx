import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { initUser } from "@/localDb/initUser";
import { syncLocalDb } from "@/localDb/syncLocalDb";
import { initMaster } from "@/localDb/initMaster";
import Indicator from "@/components/common/Indicator";

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user?.emailVerified || user?.isAnonymous) {
        setIsAuthenticated(true);
        try {
          await initMaster();
          await syncLocalDb();
          await initUser();
        } catch (error) {
          console.error(error);
        }
      } else {
        try {
          await initMaster();
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
