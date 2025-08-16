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
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import theme from "@/styles/theme";
import Indicator from "@/components/common/Indicator";
import CustomTextInput from "@/components/common/CustomTextInput";
import { validateEmail, validatePassword } from "@/lib/validators";
import { clearLocalDb } from "@/localDb/clearLocalDb";
import { syncLocalDb } from "@/localDb/syncLocalDb";

export default function Email() {
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

      await verifyBeforeUpdateEmail(user, newEmail);

      Alert.alert(
        "新しいメールアドレスにメールを送信しました",
        "24時間以内にメールを認証し、再ログインしてください。\nメールが届かない場合は変更前のメールアドレスでログインし、再実行してください。",
        [
          {
            text: "OK",
            onPress: async () => {
              try {
                await syncLocalDb();
                await signOut(auth);
                await clearLocalDb();
                router.dismissAll();
                router.replace("/auth/signIn");
              } catch (error) {
                Alert.alert("エラー");
              }
            },
          },
        ]
      );
    } catch (error: any) {
      if (error.code == "auth/invalid-credential") {
        Alert.alert("パスワードが違います");
      } else {
        Alert.alert("エラーが発生しました");
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
          <Text>認証用パスワード</Text>
          <CustomTextInput
            autoCapitalize="none"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
            }}
            isPassword
          />
        </View>

        <TouchableOpacity
          onPress={handlePress}
          style={[styles.button, isDisabled && styles.buttonDisabled]}
          disabled={isDisabled}
        >
          <Text style={styles.buttonText}>変更</Text>
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
