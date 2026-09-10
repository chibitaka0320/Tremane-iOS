import { Stack } from "expo-router";

export default function AuthModalLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackVisible: false,
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="signIn"
        options={{
          gestureEnabled: false,
        }}
      />
      <Stack.Screen name="signUp" />
      <Stack.Screen
        name="resetPassword"
        options={{
          headerShown: true,
          headerBackVisible: true,
          headerTitle: "パスワード再設定",
        }}
      />
      <Stack.Screen
        name="resetPasswordConfirm"
        options={{
          headerShown: true,
          headerBackVisible: false,
          headerTitle: "パスワード再設定",
        }}
      />
      <Stack.Screen
        name="authMail"
        options={{
          headerShown: true,
          headerTitle: "メールアドレス認証",
        }}
      />
    </Stack>
  );
}
