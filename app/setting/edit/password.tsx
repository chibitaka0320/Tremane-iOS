import { useEffect, useState } from "react";
import {
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  View,
  TouchableOpacity,
  Alert,
  Text,
} from "react-native";
import { router } from "expo-router";

// firebase
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import theme from "@/styles/theme";
import CustomTextInput from "@/components/common/CustomTextInput";
import Indicator from "@/components/common/Indicator";
import { validatePassword } from "@/lib/validators";

export default function Password() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [changePassword, setChangePassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setLoading] = useState(false);
  const [isDisabled, setDisabled] = useState(true);

  // ボタン活性・非活性
  useEffect(() => {
    if (
      validatePassword(currentPassword) &&
      validatePassword(changePassword) &&
      validatePassword(confirmPassword) &&
      changePassword === confirmPassword
    ) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [currentPassword, changePassword, confirmPassword]);

  const onUpdate = async (): Promise<void> => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (user === null) return;

      const userMail = user.email;
      if (userMail === null) return;

      const credential = EmailAuthProvider.credential(
        userMail,
        currentPassword
      );

      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, changePassword);

      Alert.alert("パスワードの変更が完了しました", "", [
        {
          text: "OK",
          onPress: () => {
            router.back();
          },
        },
      ]);
    } catch (error: any) {
      if (error.code === "auth/invalid-credential") {
        Alert.alert("現在のパスワードに誤りがあります");
      } else {
        Alert.alert("新しいパスワードを正しく入力してください");
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
          <Text style={styles.label}>現在のパスワード</Text>
          <CustomTextInput
            autoCapitalize="none"
            autoFocus
            value={currentPassword}
            onChangeText={(value) => {
              setCurrentPassword(value);
            }}
            isPassword
          />
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>新しいパスワード</Text>
          <CustomTextInput
            autoCapitalize="none"
            value={changePassword}
            onChangeText={(value) => {
              setChangePassword(value);
            }}
            isPassword
          />
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>新しいパスワードの確認</Text>
          <CustomTextInput
            autoCapitalize="none"
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);
            }}
            isPassword
          />
        </View>
        <TouchableOpacity
          style={[styles.button, isDisabled && styles.buttonDisabled]}
          onPress={onUpdate}
          disabled={isDisabled}
        >
          <Text style={styles.buttonText}>パスワードを変更</Text>
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
  inputValue: {
    justifyContent: "center",
    paddingHorizontal: theme.spacing[3],
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    backgroundColor: theme.colors.background.light,
    borderRadius: 5,
    height: 48,
  },
  inputValueText: {
    fontSize: theme.fontSizes.medium,
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
