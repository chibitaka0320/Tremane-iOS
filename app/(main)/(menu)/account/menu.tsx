import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { auth } from "@/lib/firebaseConfig";
import theme from "@/styles/theme";

const PASSWORD_MASK = "••••••••";

export default function AccountMenuScreen() {
  const currentUser = auth.currentUser;
  const isAppleUser =
    currentUser?.providerData.some(
      (provider) => provider.providerId === "apple.com"
    ) ?? false;

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
      <Row
        label="メールアドレス"
        value={currentUser?.email ?? ""}
        onPress={isAppleUser ? undefined : onChangeMail}
      />
      <Row
        label="パスワード"
        value={PASSWORD_MASK}
        onPress={isAppleUser ? undefined : onChangePassword}
      />

      <TouchableOpacity style={styles.deleteItem} onPress={onDeleteAccount}>
        <Text style={[styles.itemLabel, { color: "red" }]}>
          アカウントを削除する
        </Text>
      </TouchableOpacity>
    </View>
  );
}

type RowProps = {
  label: string;
  value: string;
  onPress?: () => void;
};

function Row({ label, value, onPress }: RowProps) {
  const content = (
    <View style={styles.item}>
      <Text style={styles.itemLabel}>{label}</Text>
      <View style={styles.itemRight}>
        <Text style={styles.itemValue}>{value}</Text>
        {onPress ? (
          <MaterialIcons
            name="arrow-forward-ios"
            size={14}
            color={theme.colors.font.gray}
          />
        ) : null}
      </View>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <TouchableOpacity activeOpacity={0.6} onPress={onPress}>
      {content}
    </TouchableOpacity>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  deleteItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing[4],
  },
  itemLabel: {
    fontSize: 16,
    color: theme.colors.font.black,
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
  },
  itemValue: {
    fontSize: 16,
    color: theme.colors.font.gray,
  },
});
