import theme from "@/styles/theme";
import { Link, router } from "expo-router";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useEffect, useState } from "react";
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
import { Header } from "@/components/auth/Header";
import CustomTextInput from "@/components/common/CustomTextInput";

export default function SignUp() {
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

  const handleSignUp = async () => {
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
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={"padding"}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <View style={styles.headerContainer}>
            <Header />
          </View>
          <View style={styles.contentContainer}>
            <View style={styles.titleContainer}>
              <View style={styles.line} />
              <Text style={styles.title}>新規登録</Text>
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
                autoCapitalize="none"
                isPassword
              />
            </View>
            <TouchableOpacity
              style={[styles.button, isDisabled && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={isDisabled && isLoading}
            >
              <Text style={styles.buttonText}>新規登録</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={anonymous}>
              <Text style={styles.link}>登録せずに使用する</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                router.navigate("/auth/signIn");
              }}
            >
              <Text style={styles.link}>すでにアカウントをお持ちの場合</Text>
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
    borderRadius: 3,
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
