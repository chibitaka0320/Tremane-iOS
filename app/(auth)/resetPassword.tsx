import CustomTextInput from "@/components/common/CustomTextInput";
import { auth } from "@/lib/firebaseConfig";
import { validateEmail } from "@/lib/validators";
import theme from "@/styles/theme";
import { router } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  Keyboard,
  TextInput,
  TouchableWithoutFeedback,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";

export default function resetPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setDisabled] = useState(true);

  useEffect(() => {
    if (validateEmail(email)) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [email]);

  const handlePress = (): void => {
    setIsLoading(true);

    try {
      sendPasswordResetEmail(auth, email);
      Alert.alert("再設定メールを送信しました。", "", [
        {
          text: "OK",
          onPress: () => {
            router.back();
          },
        },
      ]);
    } catch (error) {
      Alert.alert("メールアドレスを正しく入力してください");
    } finally {
      setIsLoading(false);
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
          <Text style={styles.title}>再設定用メールを送信します</Text>
          <Text style={styles.subTitle}>
            指定したメールアドレス宛にメールを送信します。{"\n"}
            記載されたURLからパスワードの再設定を行なってください。
          </Text>
          <View style={styles.item}>
            <Text style={styles.label}>メールアドレス</Text>
            <CustomTextInput
              placeholder="Email address"
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
              }}
            />
          </View>
          <TouchableOpacity
            style={[styles.button, isDisabled && styles.buttonDisabled]}
            onPress={handlePress}
            disabled={isLoading && isDisabled}
          >
            <Text style={styles.buttonText}>メールを送信</Text>
          </TouchableOpacity>
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

  // 注記
  title: {
    fontSize: theme.fontSizes.large,
    marginBottom: theme.spacing[4],
    fontWeight: "bold",
  },
  subTitle: {
    marginBottom: theme.spacing[4],
  },

  // インプットアイテム
  item: {
    marginBottom: theme.spacing[4],
  },
  label: {
    marginBottom: theme.spacing[1],
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
});
