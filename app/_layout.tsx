import { AlertProvider } from "@/context/AlertContext";
import { initLocalDb } from "@/localDb/initLocalDb";
import { initMaster } from "@/localDb/initMaster";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
export default function RootLayout() {
  useEffect(() => {
    const init = async () => {
      await initLocalDb();
      initMaster();
    };
    init();
  }, []);

  return (
    <AlertProvider>
      <GestureHandlerRootView
        style={{ flex: 1, backgroundColor: "grey", justifyContent: "center" }}
      >
        <Stack
          screenOptions={{
            headerTitle: "",
          }}
        >
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </GestureHandlerRootView>
    </AlertProvider>
  );
}
