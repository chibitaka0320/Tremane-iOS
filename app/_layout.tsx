import { AlertProvider } from "@/context/AlertContext";
import { initDatabase } from "@/services/init/initDb";
import { syncBodyParts } from "@/services/sync/syncBodyParts";
import { syncExercises } from "@/services/sync/syncExercise";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
export default function RootLayout() {
  useEffect(() => {
    const init = async () => {
      await initDatabase();
      await syncBodyParts();
      await syncExercises();
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
