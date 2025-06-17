import theme from "@/styles/theme";
import { Link, router } from "expo-router";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useState } from "react";
import { getDeviceInfo } from "@/lib/getDevice";
import * as SecureStore from "expo-secure-store";
import { SignUpResponse } from "@/types/api";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    setIsLoading(true);
    try {
      const deviceInfo = getDeviceInfo();
      const res = await fetch("http://localhost:8080/auth/signUp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, deviceInfo }),
      });

      if (!res.ok) {
        if (res.status === 409) {
          Alert.alert("すでに登録されているメールアドレスです");
          return;
        }
        Alert.alert("登録に失敗しました");
        return;
      }

      const data: SignUpResponse = await res.json();
      await SecureStore.setItemAsync("accessToken", data.accessToken);
      await SecureStore.setItemAsync("refreshToken", data.refreshToken);
      router.replace("/training");
    } catch (e) {
      Alert.alert("エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <Text style={styles.label}>メールアドレス</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Email address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>
      <View style={styles.item}>
        <Text style={styles.label}>パスワード</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={handleSignUp}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>新規登録</Text>
      </TouchableOpacity>
      <View style={styles.linksContainer}>
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
        >
          <Text style={styles.link}>すでにアカウントをお持ちの場合</Text>
        </TouchableOpacity>
        <Link href={"/auth/signIn"} style={styles.link}>
          登録せずに使用する
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.main,
    paddingTop: theme.spacing[6],
    paddingHorizontal: theme.spacing[3],
  },
  item: {
    marginBottom: theme.spacing[5],
  },
  label: {
    marginBottom: theme.spacing[1],
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
  },
  textInput: {
    backgroundColor: theme.colors.background.light,
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    borderRadius: 3,
    fontSize: theme.fontSizes.medium,
    padding: theme.spacing[3],
  },
  button: {
    backgroundColor: theme.colors.background.light,
    borderRadius: 3,
    paddingVertical: theme.spacing[3],
    alignItems: "center",
    marginVertical: theme.spacing[3],
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
  },
  buttonText: {
    fontSize: theme.fontSizes.medium,
    // color: theme.colors.text.main,
  },
  linksContainer: {
    marginTop: theme.spacing[6],
    alignItems: "center",
  },
  link: {
    fontWeight: "bold",
    fontSize: theme.fontSizes.medium,
    marginTop: theme.spacing[2],
    marginBottom: theme.spacing[3],
    textAlign: "center",
  },
});
