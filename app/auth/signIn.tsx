import theme from "@/styles/theme";
import { Link, router } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
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

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setDisabled] = useState(true);

  useEffect(() => {
    if (validateEmail(email) && validatePassword(password)) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [email, password]);

  const onLogin = async () => {
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/training");
    } catch (error: any) {
      if (error.code === "auth/invalid-credential") {
        Alert.alert("メールアドレスまたはパスワードが違います");
      } else {
        Alert.alert("ログインに失敗しました");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
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
              onPress={onLogin}
              disabled={isDisabled}
            >
              <Text style={styles.buttonText}>ログイン</Text>
            </TouchableOpacity>
            <Link href={"/auth/resetPassword"} style={styles.link}>
              パスワードを忘れた場合
            </Link>
            <TouchableOpacity
              onPress={() => {
                router.navigate("/auth/signUp");
              }}
            >
              <Text style={styles.link}>アカウントをお持ちでない場合</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: "30%",
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

  linksContainer: {
    marginTop: theme.spacing[6],
    alignItems: "center",
  },
  link: {
    marginTop: theme.spacing[2],
    marginBottom: theme.spacing[5],
    textAlign: "center",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
