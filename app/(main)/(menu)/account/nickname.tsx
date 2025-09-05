import CustomTextInput from "@/components/common/CustomTextInput";
import Indicator from "@/components/common/Indicator";
import { auth } from "@/lib/firebaseConfig";
import { validateNickname } from "@/lib/validators";
import theme from "@/styles/theme";
import { router } from "expo-router";
import { updateProfile } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  Keyboard,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";

export default function NicknameEditScreen() {
  const currentNickname = auth.currentUser?.displayName;
  const [newNickname, setNewNickname] = useState("");

  const [isLoading, setLoading] = useState(false);
  const [isDisabled, setDisabled] = useState(true);

  useEffect(() => {
    if (validateNickname(newNickname)) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [newNickname]);

  const handlePress = async () => {
    setLoading(true);
    const user = auth.currentUser;
    if (user == null) return;

    try {
      await updateProfile(user, {
        displayName: newNickname,
      });
      await auth.currentUser?.reload();

      Alert.alert("更新に成功しました");

      router.back();
    } catch (e) {
      console.error(e);
      Alert.alert("ニックネームの更新に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <Indicator />;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.item}>
          <Text style={styles.label}>現在のニックネーム</Text>
          <Text style={styles.inputValueText}>
            {currentNickname || "名無し"}
          </Text>
        </View>
        <View style={styles.item}>
          <Text>新しいニックネーム</Text>
          <CustomTextInput
            autoFocus
            autoCapitalize="none"
            value={newNickname}
            onChangeText={(value) => {
              setNewNickname(value);
            }}
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
