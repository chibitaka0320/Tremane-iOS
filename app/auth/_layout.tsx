import { Stack } from "expo-router";
export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackVisible: false,
      }}
    >
      <Stack.Screen
        name="signIn"
        options={{ headerTitle: "ログイン", gestureEnabled: false }}
      />
      <Stack.Screen name="signUp" options={{ headerTitle: "新規登録" }} />
      <Stack.Screen
        name="resetPassword"
        options={{ headerTitle: "パスワード再設定", headerBackVisible: true }}
      />
    </Stack>
  );
}
