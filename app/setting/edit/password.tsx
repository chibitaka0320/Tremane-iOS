import { useState } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Text,
} from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { router } from "expo-router";

// firebase
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  updatePassword,
} from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import theme from "@/styles/theme";

export default function Password() {
  const [toggleA, setToggleA] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [toggleB, setToggleB] = useState(true);
  const [changePassword, setChangePassword] = useState("");
  const [toggleC, setToggleC] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [visible, setVisible] = useState(false);

  const onUpdate = async (): Promise<void> => {
    try {
      setVisible(true);
      const user = auth.currentUser;
      if (user === null) return;
      if (
        currentPassword === "" ||
        changePassword === "" ||
        confirmPassword === ""
      ) {
        Alert.alert("未入力事項があります");
        return;
      }

      if (confirmPassword !== changePassword) {
        Alert.alert("確認用のパスワードが一致しません");
        return;
      }

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
      setVisible(false);
    }
    //   .then(() => {
    //     if (changePassword === confirmPassword) {
    //       updatePassword(user, changePassword)
    //         .then(() => {
    //           Alert.alert("パスワードの変更が完了しました", "", [
    //             {
    //               text: "OK",
    //               onPress: () => {
    //                 router.back();
    //               },
    //             },
    //           ]);
    //         })
    //         .catch(() => {
    //           Alert.alert("新しいパスワードを正しく入力してください");
    //           setVisible(false);
    //         });
    //     } else {
    //       Alert.alert("確認用のパスワードが一致しません");
    //       setVisible(false);
    //     }
    //   })
    //   .catch(() => {
    //     Alert.alert("現在のパスワードに誤りがあります");
    //     setVisible(false);
    //   });
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
      }}
    >
      <View style={styles.container}>
        <View style={styles.item}>
          <TextInput
            style={styles.itemTextInput}
            placeholder="現在のパスワード"
            autoCapitalize="none"
            secureTextEntry={toggleA}
            autoFocus
            value={currentPassword}
            onChangeText={(value) => {
              setCurrentPassword(value);
            }}
          ></TextInput>
          <TouchableOpacity
            onPress={() => {
              setToggleA(!toggleA);
            }}
            style={styles.itemIcon}
          >
            <FontAwesome6 name={toggleA ? "eye" : "eye-slash"} size={22} />
          </TouchableOpacity>
        </View>

        <View style={styles.item}>
          <TextInput
            style={styles.itemTextInput}
            placeholder="新しいパスワード"
            autoCapitalize="none"
            secureTextEntry={toggleB}
            value={changePassword}
            onChangeText={(value) => {
              setChangePassword(value);
            }}
          ></TextInput>
          <TouchableOpacity
            onPress={() => {
              setToggleB(!toggleB);
            }}
            style={styles.itemIcon}
          >
            <FontAwesome6 name={toggleB ? "eye" : "eye-slash"} size={22} />
          </TouchableOpacity>
        </View>

        <View style={styles.item}>
          <TextInput
            style={styles.itemTextInput}
            placeholder="新しいパスワードの確認"
            autoCapitalize="none"
            secureTextEntry={toggleC}
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);
            }}
          ></TextInput>
          <TouchableOpacity
            onPress={() => {
              setToggleC(!toggleC);
            }}
            style={styles.itemIcon}
          >
            <FontAwesome6 name={toggleC ? "eye" : "eye-slash"} size={22} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.button} onPress={onUpdate}>
          <Text>パスワードを変更</Text>
        </TouchableOpacity>
        {visible && <ActivityIndicator style={styles.active} />}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
  },
  active: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DEDDDC",
    borderRadius: 3,
    marginVertical: 15,
  },
  itemTextInput: {
    fontSize: 16,
    padding: 10,
    width: "85%",
  },
  itemIcon: {
    width: 30,
    alignItems: "center",
    marginLeft: 10,
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
});
