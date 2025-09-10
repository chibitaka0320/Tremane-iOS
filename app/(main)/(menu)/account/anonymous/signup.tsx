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
} from "react-native";
import { useEffect, useState } from "react";
import { validateEmail, validatePassword } from "@/lib/validators";
import Indicator from "@/components/common/Indicator";
import {
  EmailAuthProvider,
  linkWithCredential,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import CustomTextInput from "@/components/common/CustomTextInput";
import { updateNicknameDao } from "@/localDb/dao/userDao";
import { apiRequest, apiRequestWithRefresh } from "@/lib/apiClient";

export default function AnonymousSignupScreen() {
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

  const handleSignUp = async () => {
    setIsLoading(true);

    try {
      const credential = EmailAuthProvider.credential(email, password);

      const user = auth.currentUser;

      if (user === null) return;

      await updateProfile(user, {
        displayName: nickname,
      });
      await linkWithCredential(user, credential);
      const now = new Date().toISOString();
      await updateNicknameDao(nickname, now);

      router.dismissAll();
      router.replace("/training");

      try {
        const res = await apiRequestWithRefresh("/users", "PUT", {
          nickname,
          updatedAt: now,
        });
      } catch (error) {
        console.error(error);
      }
    } catch (error: any) {
      console.log(error);
      if (error.code === "auth/email-already-in-use") {
        Alert.alert("すでに登録されているメールアドレスです");
      } else {
        Alert.alert("登録に失敗しました");
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
        <View style={styles.contentContainer}>
          <Text style={styles.title}>TREMANEアカウントを登録する</Text>
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
            disabled={isDisabled && isLoading}
          >
            <Text style={styles.buttonText}>新規登録</Text>
          </TouchableOpacity>
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
  title: {
    fontSize: theme.fontSizes.large,
    textAlign: "center",
    fontWeight: "bold",
    marginVertical: theme.spacing[6],
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    padding: theme.spacing[3],
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
