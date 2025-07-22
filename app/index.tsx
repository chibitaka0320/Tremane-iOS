import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { dlTrainings } from "@/services/sync/dlTrainings";
import { dlUsers } from "@/services/sync/dlUsers";

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        dlUsers();
        dlTrainings();
        setIsAuthenticated(true);
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
