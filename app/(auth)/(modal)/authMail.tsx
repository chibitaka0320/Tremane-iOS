import * as authApi from "@/api/authApi";
import CustomTextInput from "@/components/common/CustomTextInput";
import { auth } from "@/lib/firebaseConfig";
import { registerPushTokenIfNeeded } from "@/lib/notifications/register";
import { userSyncFromRemote } from "@/localDb/sync/userSyncFromRemote";
import * as userService from "@/service/userService";
import theme from "@/styles/theme";
import { AntDesign } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";
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

const RESEND_COOLDOWN_SECONDS = 60;

export default function AuthMailScreen() {
  const currentUser = auth.currentUser;

  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!currentUser) {
    return <Redirect href={"/signUp"} />;
  }

  // 確認コード検証
  const handlePress = async () => {
    setIsVerifying(true);
    try {
      await authApi.verifyEmailCode(code);

      // バックエンドでemailVerifiedがtrueになったので、クライアント側の情報も更新する
      await auth.currentUser?.reload();
      userSyncFromRemote();
      // TODO: 通知機能はpennding
      await registerPushTokenIfNeeded();

      router.replace("/training");
    } catch (error: any) {
      Alert.alert(error?.message ?? "認証に失敗しました");
    } finally {
      setIsVerifying(false);
    }
  };

  // 確認メール再送
  const reSubmit = async () => {
    try {
      await authApi.sendVerificationEmail();
      setCooldown(RESEND_COOLDOWN_SECONDS);
      Alert.alert("確認メールを再送しました。");
    } catch (error: any) {
      console.error("メール再送エラー：", error);
      Alert.alert(error?.message ?? "再送に失敗しました。");
    }
  };

  // 新規登録に戻るボタン
  const backSignUp = async () => {
    try {
      await userService.deleteUser();
    } catch (error) {
      console.error("メール認証画面から戻る時にエラー：", error);
    } finally {
      router.replace("/signUp");
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <View style={styles.container}>
        <View style={styles.contents}>
          <View style={styles.header}>
            <AntDesign name="mail" size={48} color="black" />
            <Text style={styles.headerText}>
              メールアドレスを認証してください
            </Text>
          </View>

          <View style={styles.description}>
            <View style={styles.descriptionHeader}>
              <Text style={styles.descriptionText}>{currentUser.email}</Text>
              <Text style={styles.descriptionText}>
                宛に確認コードを送信しました。
              </Text>
            </View>
            <Text>
              メール受信箱を確認し、届いた6桁のコードを下に入力してください（有効期限：10分）。
            </Text>
            <Text>
              ※メールが届かない場合は迷惑メールフォルダを確認してください。
            </Text>
          </View>

          <CustomTextInput
            style={styles.codeInput}
            value={code}
            onChangeText={(value) =>
              setCode(value.replace(/[^0-9]/g, "").slice(0, 6))
            }
            keyboardType="number-pad"
            maxLength={6}
            placeholder="123456"
            textAlign="center"
          />

          <TouchableOpacity
            style={[
              styles.button,
              (isVerifying || code.length !== 6) && styles.buttonDisabled,
            ]}
            onPress={handlePress}
            disabled={isVerifying || code.length !== 6}
          >
            <Text style={styles.buttonText}>認証する</Text>
          </TouchableOpacity>

          <View style={styles.link}>
            <TouchableOpacity
              style={styles.linkContainer}
              onPress={reSubmit}
              disabled={cooldown > 0}
            >
              <Text style={styles.linkText}>
                {cooldown > 0
                  ? `メールを再送（${cooldown}秒後に再試行可能）`
                  : "メールを再送"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkContainer} onPress={backSignUp}>
              <Text style={styles.linkText}>新規登録に戻る</Text>
            </TouchableOpacity>
          </View>
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

  // ヘッダー
  header: {
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.dark,
    paddingVertical: theme.spacing[3],
    marginBottom: theme.spacing[4],
  },
  headerText: {
    fontSize: theme.fontSizes.medium,
  },

  // 説明
  description: {
    alignItems: "center",
    marginBottom: theme.spacing[4],
  },
  descriptionHeader: {
    marginBottom: theme.spacing[3],
  },
  descriptionText: {
    fontWeight: "bold",
  },

  // コード入力
  codeInput: {
    fontSize: 24,
    letterSpacing: 8,
    fontWeight: "bold",
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

  // リンク
  link: {
    marginTop: theme.spacing[1],
    alignItems: "center",
  },
  linkContainer: {
    marginBottom: theme.spacing[3],
  },
  linkText: {
    color: theme.colors.secondary,
  },
});
