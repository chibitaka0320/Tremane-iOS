import theme from "@/styles/theme";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { useEffect, useState } from "react";
import { validateEmail, validatePassword } from "@/lib/validators";
import Indicator from "@/components/common/Indicator";
import { Header } from "@/components/auth/Header";
import CustomTextInput from "@/components/common/CustomTextInput";
import * as userService from "@/service/userService";

export default function SignUpScreen() {
  const { height: windowHeight } = useWindowDimensions();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setDisabled] = useState(true);

  useEffect(() => {
    if (nickname && validateEmail(email) && validatePassword(password)) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [nickname, email, password]);

  // ユーザー新規登録処理
  const handleSignUp = async () => {
    setIsLoading(true);
    try {
      await userService.registerUser(email, password, nickname);
      router.replace("/(auth)/authMail");
    } catch (error: any) {
      console.error("ユーザー登録失敗：" + error);
      if (error.code === "auth/email-already-in-use") {
        Alert.alert("すでに登録されているメールアドレスです。");
      } else {
        Alert.alert("登録処理に失敗しました。");
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
      <ScrollView
        style={{ backgroundColor: theme.colors.background.lightGray }}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flexGrow: 1 }}>
            <View
              style={[styles.headerContainer, { height: windowHeight * 0.25 }]}
            >
              <Header />
            </View>
            <View style={styles.contentContainer}>
              <View style={styles.titleContainer}>
                <View style={styles.line} />
                <Text style={styles.title}>新規登録</Text>
                <View style={styles.line} />
              </View>
              <View style={styles.item}>
                <Text style={styles.label}>ニックネーム</Text>
                <CustomTextInput
                  placeholder="Nickname"
                  value={nickname}
                  onChangeText={setNickname}
                  autoCapitalize="none"
                />
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
                  autoCapitalize="none"
                  isPassword
                />
              </View>
              <TouchableOpacity
                style={[styles.button, isDisabled && styles.buttonDisabled]}
                onPress={handleSignUp}
                disabled={isDisabled && !isLoading}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>新規登録</Text>
              </TouchableOpacity>
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>または</Text>
                <View style={styles.dividerLine} />
              </View>
              <Text style={styles.backToLoginText}>
                すでにアカウントをお持ちの方
              </Text>
              <TouchableOpacity
                style={styles.backToLoginButton}
                onPress={() => {
                  router.navigate("/(auth)/signIn");
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.backToLoginLink}>ログインに戻る</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.colors.secondary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {},
  contentContainer: {
    backgroundColor: theme.colors.background.lightGray,
    paddingTop: theme.spacing[5],
    paddingHorizontal: theme.spacing[5],
    paddingBottom: theme.spacing[7],
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
  textInput: {
    backgroundColor: theme.colors.background.light,
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    borderRadius: 5,
    fontSize: theme.fontSizes.medium,
    padding: theme.spacing[3],
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

  // 区切り線（または）
  dividerRow: {
    marginTop: theme.spacing[3],
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing[5],
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

  // ログインに戻る
  backToLoginText: {
    textAlign: "center",
    color: theme.colors.font.gray,
    marginBottom: theme.spacing[1],
  },
  backToLoginButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing[1],
  },
  backToLoginLink: {
    color: theme.colors.secondary,
    fontWeight: "bold",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
