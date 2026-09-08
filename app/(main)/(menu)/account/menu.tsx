import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import theme from "@/styles/theme";

const COLOR = "#8C8C88";
const FONTSIZE = 16;

export default function AccountMenuScreen() {
  const onChangeMail = () => {
    router.push("/(main)/(menu)/account/email");
  };

  const onChangePassword = () => {
    router.push("/(main)/(menu)/account/password");
  };

  const onDeleteAccount = () => {
    router.push("/(main)/(menu)/account/delete");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.item} onPress={onChangeMail}>
        <View style={styles.itemLeft}>
          <Feather name="mail" size={20} style={styles.itemIcon} />
          <Text style={styles.itemName}>メールアドレスを変更</Text>
        </View>
        <MaterialIcons name="arrow-forward-ios" size={20} color={COLOR} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={onChangePassword}>
        <View style={styles.itemLeft}>
          <Feather name="lock" size={20} style={styles.itemIcon} />
          <Text style={styles.itemName}>パスワードを変更</Text>
        </View>
        <MaterialIcons name="arrow-forward-ios" size={20} color={COLOR} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={onDeleteAccount}>
        <View style={styles.itemLeft}>
          <Text style={[styles.itemName, { color: "red" }]}>
            アカウントを削除する
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: theme.spacing[5],
    paddingHorizontal: theme.spacing[4],
    backgroundColor: theme.colors.background.light,
  },
  item: {
    paddingVertical: theme.spacing[3],
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemIcon: {
    marginRight: theme.spacing[3],
  },
  itemName: {
    fontSize: FONTSIZE,
  },
});
