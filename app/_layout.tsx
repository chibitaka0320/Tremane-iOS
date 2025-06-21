import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
export default function RootLayout() {
  return (
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
  );
}
