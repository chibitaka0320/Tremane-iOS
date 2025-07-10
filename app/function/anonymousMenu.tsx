import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import theme from "@/styles/theme";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function NotSetAccount() {
  const onPress = () => {
    router.push("/function/signUpWithAnonymous");
  };

  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <Text style={styles.title}>アカウントが登録されていません</Text>
        <MaterialCommunityIcons
          name="account-alert"
          size={80}
          color={theme.colors.primary}
        />
        <Text style={styles.subTitle}>
          アカウント情報が存在しません。
          {"\n"}
          登録して、データを永続化しましょう。
        </Text>
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>アカウントを登録する</Text>
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
    top: "30%",
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
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    marginTop: theme.spacing[3],
    borderRadius: 5,
  },
  buttonText: {
    color: theme.colors.white,
  },
});
