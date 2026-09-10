import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { AntDesign, Feather, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { auth } from "@/lib/firebaseConfig";
import theme from "@/styles/theme";

const PASSWORD_MASK = "••••••••";

const PROVIDER_LABELS: Record<string, string> = {
  "apple.com": "Apple",
  "google.com": "Google",
  password: "Mail",
};

const PROVIDER_BADGE_COLOR = theme.colors.font.gray;

function ProviderIcon({ providerId }: { providerId: string }) {
  switch (providerId) {
    case "apple.com":
      return <AntDesign name="apple" size={14} color={PROVIDER_BADGE_COLOR} />;
    case "google.com":
      return (
        <AntDesign name="google" size={14} color={PROVIDER_BADGE_COLOR} />
      );
    case "password":
      return <Feather name="mail" size={14} color={PROVIDER_BADGE_COLOR} />;
    default:
      return null;
  }
}

export default function AccountMenuScreen() {
  const currentUser = auth.currentUser;
  // パスワード資格情報を持つユーザーのみメール/パスワードの変更を許可する
  // （Apple認証のみのユーザーはパスワードを持たないため変更不可）
  const hasPasswordProvider =
    currentUser?.providerData.some(
      (provider) => provider.providerId === "password"
    ) ?? false;

  const providers = currentUser?.providerData ?? [];

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
        onPress={hasPasswordProvider ? onChangeMail : undefined}
      />
      <View style={styles.item}>
        <Text style={styles.itemLabel}>認証方式</Text>
        <View style={styles.providerBadges}>
          {providers.map((provider) => (
            <View key={provider.providerId} style={styles.providerBadge}>
              <ProviderIcon providerId={provider.providerId} />
              <Text style={styles.providerBadgeText}>
                {PROVIDER_LABELS[provider.providerId] ?? provider.providerId}
              </Text>
            </View>
          ))}
        </View>
      </View>
      {hasPasswordProvider && (
        <Row
          label="パスワード"
          value={PASSWORD_MASK}
          onPress={onChangePassword}
        />
      )}

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
  providerBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: theme.spacing[2],
  },
  providerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: theme.spacing[2],
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: theme.colors.background.lightGray,
  },
  providerBadgeText: {
    fontSize: 14,
    color: theme.colors.font.gray,
  },
});
