import * as authApi from "@/api/authApi";
import CustomTextInput from "@/components/common/CustomTextInput";
import Indicator from "@/components/common/Indicator";
import { validatePassword } from "@/lib/validators";
import theme from "@/styles/theme";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function ResetPasswordConfirmScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setDisabled] = useState(true);

  useEffect(() => {
    if (
      validatePassword(newPassword) &&
      newPassword === confirmPassword
    ) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [newPassword, confirmPassword]);

  const handlePress = async (): Promise<void> => {
    if (!token) {
      Alert.alert("リンクが無効です。再度パスワード再設定をお試しください");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword(token, newPassword);
      Alert.alert("パスワードを変更しました。", "", [
        {
          text: "OK",
          onPress: () => {
            router.dismissTo("/(auth)/entry");
          },
        },
      ]);
    } catch (error: any) {
      console.error("パスワード再設定エラー：", error);
      Alert.alert(error?.message ?? "パスワードの再設定に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Indicator />;
  }

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <View style={styles.container}>
        <View style={styles.contents}>
          <Text style={styles.title}>新しいパスワードを設定</Text>
          <Text style={styles.subTitle}>
            新しいパスワードを入力してください。{"\n"}
            確認のためもう一度入力してください。
          </Text>
          <View style={styles.item}>
            <Text style={styles.label}>新しいパスワード</Text>
            <CustomTextInput
              autoCapitalize="none"
              value={newPassword}
              onChangeText={setNewPassword}
              isPassword
            />
          </View>
          <View style={styles.item}>
            <Text style={styles.label}>新しいパスワード（確認用）</Text>
            <CustomTextInput
              autoCapitalize="none"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
            />
          </View>
          <TouchableOpacity
            style={[styles.button, isDisabled && styles.buttonDisabled]}
            onPress={handlePress}
            disabled={isDisabled}
          >
            <Text style={styles.buttonText}>変更する</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contents: {
    flex: 1,
    margin: 30,
  },

  // 注記
  title: {
    fontSize: theme.fontSizes.large,
    marginBottom: theme.spacing[4],
    fontWeight: "bold",
  },
  subTitle: {
    marginBottom: theme.spacing[4],
  },

  // インプットアイテム
  item: {
    marginBottom: theme.spacing[4],
  },
  label: {
    marginBottom: theme.spacing[1],
  },

  // ボタン
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: 5,
    paddingVertical: theme.spacing[3],
    alignItems: "center",
    marginVertical: theme.spacing[3],
    color: theme.colors.white,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.lightGray,
  },
  buttonText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.white,
  },
});
