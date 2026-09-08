import * as authApi from "@/api/authApi";
import theme from "@/styles/theme";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
} from "react-native";
import { useEffect, useState } from "react";
import { validateEmail, validatePassword } from "@/lib/validators";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import { Header } from "@/components/auth/Header";
import CustomTextInput from "@/components/common/CustomTextInput";
import { userSyncFromRemote } from "@/localDb/sync/userSyncFromRemote";
import Indicator from "@/components/common/Indicator";
import { registerPushTokenIfNeeded } from "@/lib/notifications/register";

/** ログイン画面 */
export default function SignInScreen() {
  // 表示項目
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // フラグ
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setDisabled] = useState(true);

  // ボタンの活性非活性判定処理（メールアドレスとパスワードのバリデーションチェック）
  useEffect(() => {
    if (validateEmail(email) && validatePassword(password)) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [email, password]);

  // ログインボタン押下
  const onLoginButton = async () => {
    // ローディング開始
    setIsLoading(true);

    try {
      // firebase メールアドレスパスワード認証
      const userCredentical = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (userCredentical.user.emailVerified) {
        // メールアドレス認証済みの場合、サーバーからユーザー情報を取得しローカルDBに同期。終了後トレーニング画面に遷移。
        await userSyncFromRemote();

        // TODO: 通知機能はpennding
        await registerPushTokenIfNeeded();

        router.replace("/training");
      } else {
        // メールアドレス未認証の場合、Alertを表示し処理を行う。
        Alert.alert(
          "メールアドレスが未認証です。",
          "メールアドレスの認証を完了させてください。",
          [
            {
              text: "OK",
              style: "default",
              onPress: async () => {
                try {
                  // 認証メールを送信し、メール認証画面へ遷移する。
                  await authApi.sendVerificationEmail();
                  router.replace("/authMail");
                } catch (e) {
                  console.error(e);
                  Alert.alert(
                    "メール送信に失敗しました",
                    "メール送信に失敗しました。時間をおいて再送してください。"
                  );
                }
              },
            },
          ]
        );
      }
    } catch (error: any) {
      if (error.code === "auth/invalid-credential") {
        Alert.alert("メールアドレスまたはパスワードが違います");
      } else {
        console.error(error);
        Alert.alert("ログインに失敗しました");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Indicator />;
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={"padding"}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <View style={styles.headerContainer}>
            <Header />
          </View>
          <View style={styles.contentContainer}>
            <View style={styles.titleContainer}>
              <View style={styles.line} />
              <Text style={styles.title}>ログイン</Text>
              <View style={styles.line} />
            </View>
            <View style={styles.item}>
              <Text style={styles.label}>メールアドレス</Text>
              <CustomTextInput
                placeholder="Email address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            <View style={styles.item}>
              <Text style={styles.label}>パスワード</Text>
              <CustomTextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                isPassword
              />
            </View>
            <TouchableOpacity
              style={[styles.button, isDisabled && styles.buttonDisabled]}
              onPress={onLoginButton}
              disabled={isDisabled}
            >
              <Text style={styles.buttonText}>ログイン</Text>
            </TouchableOpacity>
            <Link href={"/(auth)/resetPassword"} style={styles.forgotPasswordLink}>
              パスワードを忘れた方
            </Link>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>または</Text>
              <View style={styles.dividerLine} />
            </View>
            <View style={styles.signUpRow}>
              <Text style={styles.signUpText}>アカウントをお持ちでない方</Text>
              <TouchableOpacity
                style={styles.signUpButton}
                onPress={() => {
                  router.navigate("/(auth)/signUp");
                }}
              >
                <Text style={styles.signUpLink}>新規登録</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.colors.secondary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: "25%",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.lightGray,
    paddingTop: theme.spacing[5],
    paddingHorizontal: theme.spacing[5],
  },
  // タイトル
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    marginBottom: theme.spacing[5],
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
    marginHorizontal: theme.spacing[3],
  },
  title: {
    textAlign: "center",
    fontWeight: "bold",
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

  // パスワードを忘れた場合リンク
  forgotPasswordLink: {
    marginTop: theme.spacing[2],
    textAlign: "center",
    color: theme.colors.secondary,
    fontWeight: "bold",
  },

  // 区切り線（または）
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: theme.spacing[5],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.lightGray,
  },
  dividerText: {
    marginHorizontal: theme.spacing[3],
    color: theme.colors.font.gray,
    fontSize: theme.fontSizes.small,
  },

  // 新規登録
  signUpRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing[2],
  },
  signUpText: {
    color: theme.colors.font.gray,
  },
  signUpButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  signUpLink: {
    color: theme.colors.secondary,
    fontWeight: "bold",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
