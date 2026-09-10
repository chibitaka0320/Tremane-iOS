import * as authApi from "@/api/authApi";
import CustomTextInput from "@/components/common/CustomTextInput";
import Indicator from "@/components/common/Indicator";
import { auth } from "@/lib/firebaseConfig";
import { consumePendingEmailChangePassword } from "@/lib/pendingEmailChangeAuth";
import theme from "@/styles/theme";
import { router, useLocalSearchParams } from "expo-router";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
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

export default function EmailVerifyScreen() {
  const { newEmail } = useLocalSearchParams<{ newEmail: string }>();

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

  // 確認コード検証
  const handlePress = async () => {
    setIsVerifying(true);
    try {
      await authApi.verifyEmailChangeCode(code);

      // メールアドレス変更によりFirebase側で発行済みトークン（リフレッシュトークン含む）が
      // 失効するため、reload()では復旧できない。新しいメールアドレスで再サインインする
      const password = consumePendingEmailChangePassword();
      if (password) {
        await signInWithEmailAndPassword(auth, newEmail, password);
      } else {
        // パスワードを引き継げなかった場合（アプリの再起動等）はサインアウトし、
        // 新しいメールアドレスで改めてログインしてもらう
        await signOut(auth);
        router.replace("/(auth)/entry");
        return;
      }

      router.replace({
        pathname: "/(main)/(menu)/account/emailComplete",
        params: { newEmail },
      });
    } catch (error: any) {
      Alert.alert(error?.message ?? "認証に失敗しました");
    } finally {
      setIsVerifying(false);
    }
  };

  // 確認コード再送信
  const reSubmit = async () => {
    try {
      await authApi.sendChangeEmailVerification(newEmail);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      Alert.alert("確認コードを再送信しました。");
    } catch (error: any) {
      Alert.alert(error?.message ?? "再送に失敗しました。");
    }
  };

  if (isVerifying) {
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
          <Text style={styles.headerText}>認証コードの入力</Text>

          <Text style={styles.description}>
            {newEmail} に送信した{"\n"}
            6桁の認証コードを入力してください。
          </Text>

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
            autoFocus
          />

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={reSubmit}
            disabled={cooldown > 0}
          >
            <Text style={styles.linkText}>
              {cooldown > 0
                ? `認証コードを再送信する（${cooldown}秒後）`
                : "認証コードを再送信する"}
            </Text>
          </TouchableOpacity>

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
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.lightGray,
  },
  contents: {
    flex: 1,
    margin: 30,
  },
  headerText: {
    fontSize: theme.fontSizes.large,
    fontWeight: "bold",
    marginBottom: theme.spacing[4],
  },
  description: {
    marginBottom: theme.spacing[5],
    lineHeight: 20,
  },

  // コード入力
  codeInput: {
    fontSize: 24,
    letterSpacing: 8,
    fontWeight: "bold",
  },

  // リンク
  linkContainer: {
    alignItems: "center",
    marginTop: theme.spacing[3],
    marginBottom: theme.spacing[5],
  },
  linkText: {
    color: theme.colors.secondary,
  },

  // ボタン
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: 5,
    paddingVertical: theme.spacing[3],
    alignItems: "center",
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
