import Indicator from "@/components/common/Indicator";
import { Header } from "@/components/auth/Header";
import { registerPushTokenIfNeeded } from "@/lib/notifications/register";
import * as userService from "@/service/userService";
import theme from "@/styles/theme";
import { AntDesign } from "@expo/vector-icons";
import {
  GoogleSignin,
  isSuccessResponse,
  type User as GoogleUser,
} from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
});

// Apple提供の氏名からニックネームを組み立てる（氏名は初回認証時のみ取得可能）
function buildNicknameFromAppleFullName(
  fullName: AppleAuthentication.AppleAuthenticationFullName | null
): string | null {
  if (!fullName) return null;
  const name = [fullName.familyName, fullName.givenName]
    .filter((part): part is string => !!part)
    .join(" ");
  return name || null;
}

// Google提供のプロフィールからニックネームを組み立てる
function buildNicknameFromGoogleUser(user: GoogleUser["user"]): string | null {
  if (user.name) return user.name;
  const name = [user.familyName, user.givenName]
    .filter((part): part is string => !!part)
    .join(" ");
  return name || null;
}

/** 認証エントリー画面（Apple / Google / メールアドレスの入口） */
export default function AuthEntryScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);

  useEffect(() => {
    AppleAuthentication.isAvailableAsync().then(setIsAppleAvailable);
  }, []);

  const onApplePress = async () => {
    try {
      // リプレイ攻撃対策のnonce（Appleにはハッシュ値、Firebaseには元の値を渡す）
      const rawNonce = Crypto.randomUUID();
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce
      );

      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      if (!appleCredential.identityToken) {
        throw new Error("identityTokenを取得できませんでした。");
      }

      setIsLoading(true);

      const nickname = buildNicknameFromAppleFullName(
        appleCredential.fullName
      );
      await userService.loginWithApple(
        appleCredential.identityToken,
        rawNonce,
        nickname
      );

      // TODO: 通知機能はpennding
      await registerPushTokenIfNeeded();

      router.replace("/training");
    } catch (error: any) {
      // ユーザーによるキャンセルは何もしない
      if (error.code === "ERR_REQUEST_CANCELED") {
        return;
      }
      console.error("Apple認証失敗：" + error);
      Alert.alert("Appleサインインに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const onGooglePress = async () => {
    try {
      const response = await GoogleSignin.signIn();
      if (!isSuccessResponse(response)) {
        // ユーザーによるキャンセルは何もしない
        return;
      }

      const { idToken, user } = response.data;
      if (!idToken) {
        throw new Error("idTokenを取得できませんでした。");
      }

      setIsLoading(true);

      const nickname = buildNicknameFromGoogleUser(user);
      await userService.loginWithGoogle(idToken, nickname);

      // TODO: 通知機能はpennding
      await registerPushTokenIfNeeded();

      router.replace("/training");
    } catch (error: any) {
      console.error("Google認証失敗：" + error);
      Alert.alert("Googleサインインに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const onEmailPress = () => {
    router.navigate("/signIn");
  };

  if (isLoading) {
    return <Indicator />;
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.headerContainer}>
        <Header />
      </View>
      <View style={styles.contentContainer}>
        {isAppleAvailable && (
          <TouchableOpacity
            style={styles.appleButton}
            onPress={onApplePress}
            activeOpacity={0.7}
          >
            <AntDesign name="apple" size={20} color={theme.colors.white} />
            <Text style={styles.appleButtonText}>Appleで続ける</Text>
          </TouchableOpacity>
        )}
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
