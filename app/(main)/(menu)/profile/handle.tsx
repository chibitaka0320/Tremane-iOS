import CustomTextInput from "@/components/common/CustomTextInput";
import Indicator from "@/components/common/Indicator";
import { ApiError } from "@/lib/error";
import { validateHandle } from "@/lib/validators";
import * as userService from "@/service/userService";
import theme from "@/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function HandleEditScreen() {
  const [currentHandle, setCurrentHandle] = useState<string | null>(null);
  const [handle, setHandle] = useState("");

  const [isLoading, setLoading] = useState(false);
  const [isDisabled, setDisabled] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchApi = async () => {
        const user = await userService.getUser();
        setCurrentHandle(user?.handle ?? null);
        setHandle(user?.handle ?? "");
      };
      fetchApi();
    }, [])
  );

  // ボタン活性・非活性（未変更の場合も非活性にする）
  useEffect(() => {
    setDisabled(!validateHandle(handle) || handle === (currentHandle ?? ""));
  }, [handle, currentHandle]);

  // 変更ボタン押下
  const handlePress = async () => {
    setLoading(true);
    try {
      await userService.updateHandle(handle);
      Alert.alert("更新に成功しました");
      router.back();
    } catch (error) {
      if (error instanceof ApiError) {
        Alert.alert(error.message);
      } else {
        console.error("ID更新失敗：" + error);
        Alert.alert("IDの更新に失敗しました");
      }
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
          <Text style={styles.label}>現在のID</Text>
          <Text style={styles.inputValueText}>
            {currentHandle ?? "未設定"}
          </Text>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>新しいID</Text>
          <CustomTextInput
            autoFocus
            autoCapitalize="none"
            value={handle}
            onChangeText={setHandle}
          />
          <Text style={styles.hint}>
            半角英数字と＿．－（_ . -）のみ、8〜16文字で入力してください
          </Text>
        </View>

        <View style={styles.noticeCard}>
          <View style={styles.noticeHeader}>
            <Ionicons
              name="information-circle"
              size={18}
              color={theme.colors.secondary}
            />
            <Text style={styles.noticeTitle}>IDの変更について</Text>
          </View>
          <Text style={styles.noticeText}>
            IDを変更すると、次に変更できるようになるまで14日間かかります。
          </Text>
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
  hint: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
    marginTop: theme.spacing[1],
  },

  // クールダウン注意書き
  noticeCard: {
    backgroundColor: "rgba(66, 169, 230, 0.08)",
    borderRadius: 12,
    padding: theme.spacing[4],
    marginBottom: theme.spacing[4],
  },
  noticeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
    marginBottom: theme.spacing[2],
  },
  noticeTitle: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "700",
    color: theme.colors.secondary,
  },
  noticeText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.black,
    lineHeight: 20,
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
