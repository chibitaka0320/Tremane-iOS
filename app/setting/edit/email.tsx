import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";

// firebase
import {
  EmailAuthProvider,
  fetchSignInMethodsForEmail,
  reauthenticateWithCredential,
  signOut,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import theme from "@/styles/theme";

export default function Email() {
  const currentEmail = auth.currentUser?.email;
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);

  const handlePress = async () => {
    setVisible(true);
    const user = auth.currentUser;
    if (user == null) return;
    if (currentEmail == null) return;

    try {
      const credential = EmailAuthProvider.credential(currentEmail, password);

      await reauthenticateWithCredential(user, credential);

      await verifyBeforeUpdateEmail(user, newEmail);

      Alert.alert(
        "新しいメールアドレスにメールを送信しました",
        "24時間以内にメールを認証し、再ログインしてください",
        [
          {
            text: "OK",
            onPress: () => {
              try {
                signOut(auth);
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
      setVisible(false);
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <View style={styles.container}>
        <View style={styles.item}>
          <Text>現在のメールアドレス</Text>
          <TextInput style={styles.text} editable={false}>
            {currentEmail}
          </TextInput>
        </View>
        <View style={styles.item}>
          <Text>新しいメールアドレス</Text>
          <TextInput
            style={styles.textInput}
            autoFocus
            autoCapitalize="none"
            value={newEmail}
            onChangeText={(value) => {
              setNewEmail(value);
            }}
            keyboardType="email-address"
            textContentType="emailAddress"
          ></TextInput>
        </View>
        <View style={styles.item}>
          <Text>認証用パスワード</Text>
          <TextInput
            style={styles.textInput}
            autoCapitalize="none"
            secureTextEntry
            value={password}
            onChangeText={(value) => {
              setPassword(value);
            }}
          ></TextInput>
        </View>

        <TouchableOpacity
          onPress={() => {
            void handlePress();
          }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>変更</Text>
        </TouchableOpacity>

        {visible && <ActivityIndicator style={styles.active} />}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  active: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
  },
  item: {
    marginBottom: 10,
  },
  text: {
    backgroundColor: "#FFFFFF",
    fontSize: 16,
    paddingHorizontal: 10,
    height: 40,
    marginVertical: 5,
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DEDDDC",
    borderRadius: 3,
    fontSize: 16,
    paddingHorizontal: 10,
    height: 40,
    marginVertical: 10,
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
  trans: {
    marginTop: 60,
    flexDirection: "row",
    justifyContent: "center",
  },
  transLink: {
    marginLeft: 10,
  },
  transLinkText: {
    fontWeight: "bold",
  },
  buttonText: {
    fontSize: theme.fontSizes.medium,
  },
});
