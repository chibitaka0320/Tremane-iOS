import { apiRequestWithRefresh } from "@/lib/apiClient";
import { auth } from "@/lib/firebaseConfig";
import { clearLocalDb } from "@/localDb/clearLocalDb";
import theme from "@/styles/theme";
import { Entypo } from "@expo/vector-icons";
import { router } from "expo-router";
import { deleteUser } from "firebase/auth";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";

export default function DeleteAccountScreen() {
  const handleDelete = () => {
    const user = auth.currentUser;
    const URL = "/users";
    if (user === null) return;

    Alert.alert(
      "確認",
      "本当にアカウントを削除しますか？この操作は取り消せません。",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除する",
          style: "destructive",
          onPress: async () => {
            try {
              await apiRequestWithRefresh(URL, "DELETE");
              await deleteUser(user);
              await clearLocalDb();
              router.dismissAll();
              router.replace("/auth/signIn");
            } catch (error) {
              console.log(error);
              Alert.alert("アカウントの削除に失敗しました。");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <Entypo name="warning" size={80} color={theme.colors.warn} />
        <Text style={styles.warn}>本当に削除しますか？</Text>
        <Text style={styles.subTitle}>
          この操作は取り消せません。
          {"\n"}
          ユーザーに関するデータは全て削除されます。
          {"\n"}
          ユーザー及び関連するデータを削除してもよろしいですか？
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleDelete}>
          <Text style={styles.buttonText}>アカウントを削除する</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.light,
    flex: 1,
    padding: theme.spacing[5],
    alignItems: "center",
  },
  item: {
    position: "absolute",
    top: "20%",
    alignItems: "center",
  },
  title: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
    marginBottom: theme.spacing[3],
  },
  subTitle: {
    marginHorizontal: theme.spacing[4],
    marginVertical: theme.spacing[3],
    fontSize: theme.fontSizes.small,
  },
  button: {
    alignItems: "center",
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    marginTop: theme.spacing[3],
    borderRadius: 5,
  },
  buttonText: {
    color: theme.colors.white,
  },
  warn: {
    fontSize: theme.fontSizes.large,
    fontWeight: "bold",
    marginVertical: theme.spacing[3],
  },
});
