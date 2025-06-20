import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { getAccessToken } from "@/lib/token";

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await getAccessToken();
        setIsAuthenticated(token !== null);
      } catch (e) {
        setIsAuthenticated(false);
      }
    };

    checkLogin();
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
