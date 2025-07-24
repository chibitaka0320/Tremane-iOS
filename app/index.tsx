import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { db } from "@/lib/localDbConfig";
import {
  apiRequestWithRefresh,
  apiRequestWithRefreshNew,
} from "@/lib/apiClient";
import { User, UserProfile } from "@/types/localDb";
import { initLocalDb } from "@/localDb/initLocalDb";
import { initUser } from "@/localDb/initUser";
import { syncLocalDb } from "@/localDb/syncLocalDb";

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          await initLocalDb();
          await initUser();
        } catch (error) {
          console.error(error);
        } finally {
          setIsAuthenticated(true);
        }

        syncLocalDb();
      } else {
        setIsAuthenticated(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (isAuthenticated === null) {
    return (
      <View style={styles.active}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? "/training" : "/auth/signIn"} />;
}

const styles = StyleSheet.create({
  active: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
