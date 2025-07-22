import { AlertProvider } from "@/context/AlertContext";
import { initDatabase } from "@/services/init/initDb";
import { dlBodyParts } from "@/services/sync/dlBodyParts";
import { dlExercises } from "@/services/sync/dlExercise";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
export default function RootLayout() {
  useEffect(() => {
    const init = async () => {
      await initDatabase();
      await dlBodyParts();
      await dlExercises();
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
