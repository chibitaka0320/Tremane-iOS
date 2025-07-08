import { auth } from "@/lib/firebaseConfig";
import theme from "@/styles/theme";
import { router } from "expo-router";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
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

  const handlePress = (): void => {
    setIsLoading(true);

    try {
      if (email === "") {
        Alert.alert("メールアドレスを入力してください");
      } else {
        sendPasswordResetEmail(auth, email);
        Alert.alert("再設定メールを送信しました。", "", [
          {
            text: "OK",
            onPress: () => {
              router.back();
            },
          },
        ]);
      }
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
          <View style={styles.items}>
            <Text style={styles.itemText}>メールアドレス</Text>
            <TextInput
              style={styles.itemTextInput}
              placeholder="Email address"
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
              }}
            ></TextInput>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={handlePress}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>パスワード再設定</Text>
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
  active: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
  },
  items: {
    marginVertical: 20,
  },
  itemText: {
    marginBottom: 10,
    fontWeight: "bold",
  },
  itemTextInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DEDDDC",
    borderRadius: 3,
    fontSize: 16,
    padding: 10,
  },
  trans: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
  },
  transLink: {
    marginLeft: 10,
  },
  transLinkText: {
    fontWeight: "bold",
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
  },
});
