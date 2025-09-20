import theme from "@/styles/theme";
import { router } from "expo-router";
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
} from "react-native";
import { useEffect, useState } from "react";
import { validateEmail, validatePassword } from "@/lib/validators";
import Indicator from "@/components/common/Indicator";
import { Header } from "@/components/auth/Header";
import CustomTextInput from "@/components/common/CustomTextInput";
import * as userService from "@/service/userService";

export default function SignUpScreen() {
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

  // 匿名ユーザー登録処理
  const anonymous = async () => {
    setIsLoading(true);
    try {
      await userService.registerAnonymous();
      router.replace("/(main)/(tabs)/(home)/training");
    } catch (error) {
      console.error("匿名ユーザー登録失敗：" + error);
      Alert.alert("登録処理に失敗しました。");
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
              <TouchableOpacity onPress={anonymous} activeOpacity={0.7}>
                <Text style={styles.link}>登録せずに使用する</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  router.navigate("/(auth)/signIn");
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.link}>すでにアカウントをお持ちの場合</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
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
