import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";

// firebase
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import * as authApi from "@/api/authApi";
import { auth } from "@/lib/firebaseConfig";
import { setPendingEmailChangePassword } from "@/lib/pendingEmailChangeAuth";
import theme from "@/styles/theme";
import Indicator from "@/components/common/Indicator";
import CustomTextInput from "@/components/common/CustomTextInput";
import { validateEmail, validatePassword } from "@/lib/validators";

export default function EmailEditScreen() {
  const currentEmail = auth.currentUser?.email;
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setLoading] = useState(false);
  const [isDisabled, setDisabled] = useState(true);

  useEffect(() => {
    if (validateEmail(newEmail) && validatePassword(password)) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [newEmail, password]);

  const handlePress = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (user == null) return;
    if (currentEmail == null) return;

    try {
      const credential = EmailAuthProvider.credential(currentEmail, password);
      await reauthenticateWithCredential(user, credential);

      await authApi.sendChangeEmailVerification(newEmail);

      // 認証コード確認後、新メールアドレスで再サインインするためにパスワードを一時的に引き継ぐ
      setPendingEmailChangePassword(password);

      router.push({
        pathname: "/(main)/(menu)/account/emailVerify",
        params: { newEmail },
      });
    } catch (error: any) {
      if (error.code === "auth/invalid-credential") {
        Alert.alert("パスワードが違います");
      } else {
        Alert.alert(error?.message ?? "エラーが発生しました");
      }
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <Indicator />;
  }

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <View style={styles.container}>
        <View style={styles.item}>
          <Text style={styles.label}>現在のメールアドレス</Text>
          <Text style={styles.inputValueText}>{currentEmail}</Text>
        </View>
        <View style={styles.item}>
          <Text>新しいメールアドレス</Text>
          <CustomTextInput
            autoFocus
            autoCapitalize="none"
            value={newEmail}
            onChangeText={(value) => {
              setNewEmail(value);
            }}
            keyboardType="email-address"
            textContentType="emailAddress"
          />
        </View>
        <View style={styles.item}>
          <Text>現在のパスワード</Text>
          <CustomTextInput
            autoCapitalize="none"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
            }}
            isPassword
          />
        </View>

        <Text style={styles.hintText}>
          新しいメールアドレスに認証コードを送信します。
        </Text>

        <TouchableOpacity
          onPress={handlePress}
          style={[styles.button, isDisabled && styles.buttonDisabled]}
          disabled={isDisabled}
        >
          <Text style={styles.buttonText}>認証コードを送信する</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.lightGray,
    paddingTop: theme.spacing[5],
    paddingHorizontal: theme.spacing[5],
  },

  // インプットアイテム
  item: {
    marginBottom: theme.spacing[4],
  },
  label: {
    marginBottom: theme.spacing[1],
  },
  inputValueText: {
    fontSize: theme.fontSizes.medium,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
  },
  hintText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
    marginBottom: theme.spacing[2],
  },

  // 通常ボタン
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
});
