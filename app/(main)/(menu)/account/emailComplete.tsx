import theme from "@/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function EmailCompleteScreen() {
  const navigation = useNavigation();
  const { newEmail } = useLocalSearchParams<{ newEmail: string }>();

  // 完了画面のため、ヘッダーの戻るボタン・スワイプでの戻る操作を無効化する
  useEffect(() => {
    navigation.setOptions({
      headerBackVisible: false,
      gestureEnabled: false,
    });
  }, [navigation]);

  const backToAccountMenu = () => {
    // email.tsx / emailVerify.tsx / emailComplete.tsx（今の画面）をスタックから
    // 破棄し、元々あったaccount/menuに戻る（見つからない場合はreplaceにフォールバック）
    router.dismissTo("/(main)/(menu)/account/menu");
  };

  return (
    <View style={styles.container}>
      <View style={styles.contents}>
        <View style={styles.iconCircle}>
          <Ionicons
            name="checkmark"
            size={40}
            color={theme.colors.white}
          />
        </View>

        <Text style={styles.title}>メールアドレスを{"\n"}変更しました</Text>

        <View style={styles.emailBox}>
          <Text style={styles.emailLabel}>新しいメールアドレス</Text>
          <Text style={styles.emailValue}>{newEmail}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={backToAccountMenu}>
          <Text style={styles.buttonText}>アカウント情報に戻る</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.lightGray,
  },
  contents: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing[5],
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing[5],
  },
  title: {
    fontSize: theme.fontSizes.large,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: theme.spacing[6],
  },
  emailBox: {
    width: "100%",
    backgroundColor: theme.colors.background.light,
    borderRadius: 8,
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[4],
    alignItems: "center",
    marginBottom: theme.spacing[6],
  },
  emailLabel: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
    marginBottom: theme.spacing[1],
  },
  emailValue: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
  },
  button: {
    width: "100%",
    backgroundColor: theme.colors.primary,
    borderRadius: 5,
    paddingVertical: theme.spacing[3],
    alignItems: "center",
  },
  buttonText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.white,
  },
});
