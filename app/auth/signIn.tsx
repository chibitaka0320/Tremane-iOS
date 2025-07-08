import theme from "@/styles/theme";
import { Link, router } from "expo-router";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { validateEmail, validatePassword } from "@/lib/validators";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onLogin = async () => {
    if (!validateEmail(email)) {
      Alert.alert("有効なメールアドレスを入力してください");
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert("パスワードは8文字以上で入力してください");
      return;
    }

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
    <View style={styles.container}>
      <View style={styles.item}>
        <Text style={styles.label}>メールアドレス</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Email address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>
      <View style={styles.item}>
        <Text style={styles.label}>パスワード</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={onLogin}>
        <Text style={styles.buttonText}>ログイン</Text>
      </TouchableOpacity>
      <View style={styles.linksContainer}>
        <TouchableOpacity
          onPress={() => {
            router.navigate("/auth/signUp");
          }}
        >
          <Text style={styles.link}>アカウントをお持ちでない場合</Text>
        </TouchableOpacity>

        {/* TODO: 処理ができ次第実装 */}
        <Link href={"/auth/resetPassword"} style={styles.link}>
          パスワードを忘れた場合
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.main,
    paddingTop: theme.spacing[6],
    paddingHorizontal: theme.spacing[3],
  },
  item: {
    marginBottom: theme.spacing[5],
  },
  label: {
    marginBottom: theme.spacing[1],
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
  },
  textInput: {
    backgroundColor: theme.colors.background.light,
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    borderRadius: 3,
    fontSize: theme.fontSizes.medium,
    padding: theme.spacing[3],
  },
  button: {
    backgroundColor: theme.colors.background.light,
    borderRadius: 3,
    paddingVertical: theme.spacing[3],
    alignItems: "center",
    marginVertical: theme.spacing[3],
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
  },
  buttonText: {
    fontSize: theme.fontSizes.medium,
  },
  linksContainer: {
    marginTop: theme.spacing[6],
    alignItems: "center",
  },
  link: {
    fontWeight: "bold",
    fontSize: theme.fontSizes.medium,
    marginTop: theme.spacing[2],
    marginBottom: theme.spacing[3],
    textAlign: "center",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
