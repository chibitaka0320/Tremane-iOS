import theme from "@/styles/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, StyleSheet, TouchableOpacity, View } from "react-native";

export default function NotSetProfile() {
  const onPress = () => {
    router.push("/setting/edit/profile");
  };

  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <Text style={styles.title}>プロフィールが設定されていません</Text>
        <MaterialCommunityIcons
          name="card-account-details-outline"
          size={80}
          color={theme.colors.primary}
        />
        <Text style={styles.subTitle}>
          必要摂取カロリー、消費カロリーの計算にはプロフィールの登録が必要です。
          {"\n"}
          生年月日や身体情報を入力して確認しましょう。
        </Text>
        <TouchableOpacity style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>プロフィールを設定する</Text>
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
