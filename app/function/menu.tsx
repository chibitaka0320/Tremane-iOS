import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { MaterialIcons, SimpleLineIcons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import theme from "@/styles/theme";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";

const COLOR = "#8C8C88";
const FONTSIZE = 16;

export default function Menu() {
  const onHome = () => {
    router.back();
  };

  const onProf = () => {
    router.push("/setting/profile");
  };

  const onGoal = () => {
    router.push("/setting/goal");
  };

  // TODO: 画面ができ次第の実装
  const onAccount = () => {
    const user = auth.currentUser;

    if (user?.isAnonymous) {
      router.push("/function/anonymousMenu");
    } else {
      router.push("/function/accoumtMenu");
    }
  };

  const onSignOut = async () => {
    try {
      signOut(auth);
      router.dismissAll();
      router.replace("/auth/signIn");
    } catch (e) {
      Alert.alert("ログアウトに失敗しました");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.item} onPress={onHome}>
        <View style={styles.itemLeft}>
          <Feather name="home" size={20} style={styles.itemIcon} />
          <Text style={styles.itemName}>ホーム</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={onProf}>
        <View style={styles.itemLeft}>
          <Feather name="user" size={20} style={styles.itemIcon} />
          <Text style={styles.itemName}>プロフィール設定</Text>
        </View>
        <MaterialIcons name="arrow-forward-ios" size={20} color={COLOR} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={onGoal}>
        <View style={styles.itemLeft}>
          <Feather name="flag" size={20} style={styles.itemIcon} />
          <Text style={styles.itemName}>目標設定</Text>
        </View>
        <MaterialIcons name="arrow-forward-ios" size={20} color={COLOR} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.item} onPress={onAccount}>
        <View style={styles.itemLeft}>
          <SimpleLineIcons name="settings" size={20} style={styles.itemIcon} />
          <Text style={styles.itemName}>アカウント設定</Text>
        </View>
        <MaterialIcons name="arrow-forward-ios" size={20} color={COLOR} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.item} onPress={onSignOut}>
        <View style={styles.itemLeft}>
          <MaterialIcons name="logout" size={20} style={styles.itemIcon} />
          <Text style={[styles.itemName, { color: "red" }]}>ログアウト</Text>
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
