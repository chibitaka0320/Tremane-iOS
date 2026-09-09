import { Header } from "@/components/auth/Header";
import theme from "@/styles/theme";
import { AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

/** 認証エントリー画面（Apple / Google / メールアドレスの入口） */
export default function AuthEntryScreen() {
  // TODO: Appleサインインを実装する
  const onApplePress = () => {};

  // TODO: Googleサインインを実装する
  const onGooglePress = () => {};

  const onEmailPress = () => {
    router.navigate("/signIn");
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        <Header />
      </View>
      <View style={styles.contentContainer}>
        <TouchableOpacity
          style={styles.appleButton}
          onPress={onApplePress}
          activeOpacity={0.7}
        >
          <AntDesign name="apple" size={20} color={theme.colors.white} />
          <Text style={styles.appleButtonText}>Appleで続ける</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.googleButton}
          onPress={onGooglePress}
          activeOpacity={0.7}
        >
          <AntDesign name="google" size={18} color={theme.colors.font.black} />
          <Text style={styles.googleButtonText}>Googleで続ける</Text>
        </TouchableOpacity>
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>または</Text>
          <View style={styles.dividerLine} />
        </View>
        <TouchableOpacity
          style={styles.emailButton}
          onPress={onEmailPress}
          activeOpacity={0.7}
        >
          <Text style={styles.emailButtonText}>メールアドレスで続ける</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: "25%",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.lightGray,
    paddingTop: theme.spacing[6],
    paddingHorizontal: theme.spacing[5],
  },

  // Appleボタン
  appleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing[2],
    backgroundColor: theme.colors.black,
    borderRadius: 5,
    paddingVertical: theme.spacing[3],
  },
  appleButtonText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.white,
    fontWeight: "bold",
  },

  // Googleボタン
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing[2],
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    borderRadius: 5,
    paddingVertical: theme.spacing[3],
    backgroundColor: theme.colors.white,
    marginTop: theme.spacing[3],
  },
  googleButtonText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.font.black,
    fontWeight: "bold",
  },

  // 区切り線（または）
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: theme.spacing[5],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.lightGray,
  },
  dividerText: {
    marginHorizontal: theme.spacing[3],
    color: theme.colors.font.gray,
    fontSize: theme.fontSizes.small,
  },

  // メールアドレスで続けるボタン
  emailButton: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 5,
    paddingVertical: theme.spacing[3],
    alignItems: "center",
  },
  emailButtonText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.secondary,
    fontWeight: "bold",
  },
});
