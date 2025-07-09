import { auth } from "@/lib/firebaseConfig";
import { router } from "expo-router";
import { deleteUser } from "firebase/auth";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";

export default function DeleteAccountScreen() {
  const handleDelete = () => {
    const user = auth.currentUser;
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
              await deleteUser(user);
              router.dismissAll();
              router.replace("/auth/signIn");
            } catch (error) {
              Alert.alert("アカウントの削除に失敗しました。");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* 警告アイコン */}
      <Text style={styles.warningIcon}>⚠️</Text>

      {/* タイトル */}
      <Text style={styles.title}>アカウント削除</Text>

      {/* 説明文 */}
      <Text style={styles.description}>
        本当にアカウントを削除しますか？{"\n"}この操作は取り消せません。
      </Text>

      {/* 削除ボタン */}
      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>アカウントを削除</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  warningIcon: {
    fontSize: 64,
    marginBottom: 24,
    color: "#E53935",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#222",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
    marginBottom: 32,
  },
  deleteButton: {
    backgroundColor: "#E53935",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
