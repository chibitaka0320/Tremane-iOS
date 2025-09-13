import { AlertProvider } from "@/context/AlertContext";
import { useNotificationHandler } from "@/hooks/useNotificationHandler";
import { initLocalDb } from "@/localDb/initLocalDb";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  const [isDbReady, setisDbReady] = useState(false);
  useNotificationHandler();

  useEffect(() => {
    const init = async () => {
      await initLocalDb();
      setisDbReady(true);
    };
    init();
  }, []);

  if (!isDbReady) {
    return (
      <GestureHandlerRootView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" color="white" />
      </GestureHandlerRootView>
    );
  }

  return (
    <AlertProvider>
      <GestureHandlerRootView
        style={{ flex: 1, backgroundColor: "grey", justifyContent: "center" }}
      >
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(main)" />
        </Stack>
      </GestureHandlerRootView>
    </AlertProvider>
  );
}
