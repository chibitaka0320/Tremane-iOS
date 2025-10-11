import { auth } from "@/lib/firebaseConfig";
import { registerPushTokenIfNeeded } from "@/lib/notifications/register";
import { userSyncFromRemote } from "@/localDb/sync/userSyncFromRemote";
import * as userService from "@/service/userService";
import theme from "@/styles/theme";
import { AntDesign } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";
import { sendEmailVerification } from "firebase/auth";
import {
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function AuthMailScreen() {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    return <Redirect href={"/(auth)/signUp"} />;
  }

  // メール認証ボタン
  const handlePress = async () => {
    try {
      await auth.currentUser?.reload();
      const refreshed = auth.currentUser;

      if (refreshed?.emailVerified) {
        userSyncFromRemote();
        // TODO: 通知機能はpennding
        await registerPushTokenIfNeeded();

        router.replace("/training");
      } else {
        Alert.alert(
          "メールアドレス未認証",
          "メールを確認し、認証を完了させてください。"
        );
      }
    } catch (e) {
      Alert.alert("状態更新に失敗しました。ネットワークをご確認ください。");
    }
  };

  // 確認メール再送
  const reSubmit = async () => {
    try {
      await sendEmailVerification(currentUser);
      Alert.alert("確認メールを再送しました。");
    } catch (e) {
      console.error("メール再送エラー：", e);
      Alert.alert(
        "再送に失敗しました。",
        "しばらく時間を置いてから再度お試しください。"
      );
    }
  };

  // 新規登録に戻るボタン
  const backSignUp = async () => {
    try {
      await userService.deleteUser();
    } catch (error) {
      console.error("メール認証画面から戻る時にエラー：", error);
    } finally {
      router.replace("/(auth)/signUp");
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <View style={styles.container}>
        <View style={styles.contents}>
          <View style={styles.header}>
            <AntDesign name="mail" size={48} color="black" />
            <Text style={styles.headerText}>
              メールアドレスを認証してください
            </Text>
          </View>

          <View style={styles.description}>
            <View style={styles.descriptionHeader}>
              <Text style={styles.descriptionText}>{currentUser.email}</Text>
              <Text style={styles.descriptionText}>
                宛に確認メールを送信しました。
              </Text>
            </View>
            <Text>
              メール受信箱を確認し、24時間以内にメール内リンクをクリックし認証を完了させてください。
            </Text>
            <Text>
              ※メールが届かない場合は迷惑メールフォルダを確認してください。
            </Text>
          </View>

          <TouchableOpacity style={[styles.button]} onPress={handlePress}>
            <Text style={styles.buttonText}>認証完了</Text>
          </TouchableOpacity>

          <View style={styles.link}>
            <TouchableOpacity style={styles.linkContainer} onPress={reSubmit}>
              <Text style={styles.linkText}>メールを再送</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkContainer} onPress={backSignUp}>
              <Text style={styles.linkText}>新規登録に戻る</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contents: {
    flex: 1,
    margin: 30,
  },

  // ヘッダー
  header: {
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.dark,
    paddingVertical: theme.spacing[3],
    marginBottom: theme.spacing[4],
  },
  headerText: {
    fontSize: theme.fontSizes.medium,
  },

  // 説明
  description: {
    alignItems: "center",
    marginBottom: theme.spacing[4],
  },
  descriptionHeader: {
    marginBottom: theme.spacing[3],
  },
  descriptionText: {
    fontWeight: "bold",
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

  // リンク
  link: {
    marginTop: theme.spacing[1],
    alignItems: "center",
  },
  linkContainer: {
    marginBottom: theme.spacing[3],
  },
  linkText: {
    color: theme.colors.secondary,
  },
});
