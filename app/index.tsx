import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { getAccessToken, getRefreshToken } from "@/lib/token";
import { refreshAccessToken } from "@/lib/apiClient";

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const accessToken = await getAccessToken();
        const refreshToken = await getRefreshToken();

        if (accessToken === null || refreshToken === null) {
          throw new Error();
        } else {
          await refreshAccessToken();
          setIsAuthenticated(true);
        }
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
