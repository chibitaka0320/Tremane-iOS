import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import theme from "@/styles/theme";
import { router } from "expo-router";

export default function AnonymousMenu() {
  const onPress = () => {
    router.push("/function/signUpWithAnonymous");
  };

  return (
    <View style={styles.container}>
      {/* メインエリア */}
      <View style={styles.content}>
        {/* サインイン説明 */}
        <Text style={styles.descriptionText}>
          アカウント情報が存在しません。
          {"\n"}
          登録して、データを永続化しましょう。
        </Text>

        {/* サインインボタン */}
        <TouchableOpacity style={styles.signInButton} onPress={onPress}>
          <Text style={styles.signInButtonText}>登録</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    height: 80,
    paddingTop: 40,
    backgroundColor: "#DDBB47",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  backArrow: {
    fontSize: 24,
    color: "#000",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: "40%",
    paddingHorizontal: 16,
  },
  iconWrapper: {
    marginBottom: 24,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#999",
    padding: 20,
  },
  iconFace: {
    fontSize: 40,
  },
  displayNameText: {
    fontSize: 16,
    marginBottom: 16,
    color: "#333",
  },
  descriptionText: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 40,
  },
  signInButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  signInButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
