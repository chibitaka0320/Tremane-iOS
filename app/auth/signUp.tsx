import theme from "@/styles/theme";
import { Link, router } from "expo-router";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useState } from "react";
import { apiRequest } from "@/lib/apiClient";
import { validateEmail, validatePassword } from "@/lib/validators";
import Indicator from "@/components/common/Indicator";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendEmailVerification,
  signInAnonymously,
  UserCredential,
} from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
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
      const userCredential: UserCredential =
        await createUserWithEmailAndPassword(auth, email, password);

      const user = userCredential.user;

      try {
        await apiRequest("/auth/signUp", "POST", {
          userId: user.uid,
        });
      } catch (error) {
        await deleteUser(user);
        Alert.alert("登録に失敗しました");
      }

      router.replace("/training");
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        Alert.alert("すでに登録されているメールアドレスです");
      } else {
        Alert.alert("登録に失敗しました");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const anonymous = async () => {
    setIsLoading(true);
    try {
      const userCredential: UserCredential = await signInAnonymously(auth);

      const user = userCredential.user;

      try {
        await apiRequest("/auth/signUp", "POST", {
          userId: user.uid,
        });
      } catch (error) {
        await deleteUser(user);
        Alert.alert("登録に失敗しました");
      }

      router.replace("/(tabs)/training");
    } catch (error) {
      Alert.alert("認証に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Indicator />;
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
          autoCapitalize="none"
          secureTextEntry
        />
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={handleSignUp}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>新規登録</Text>
      </TouchableOpacity>
      <View style={styles.linksContainer}>
        <TouchableOpacity
          onPress={() => {
            router.navigate("/auth/signIn");
          }}
        >
          <Text style={styles.link}>すでにアカウントをお持ちの場合</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={anonymous}>
          <Text style={styles.link}>登録せずに使用する</Text>
        </TouchableOpacity>
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
    // color: theme.colors.text.main,
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
});
