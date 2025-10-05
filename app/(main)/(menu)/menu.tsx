import Indicator from "@/components/common/Indicator";
import { ApiError } from "@/lib/error";
import { auth } from "@/lib/firebaseConfig";
import * as authSercice from "@/service/authService";
import theme from "@/styles/theme";
import { Feather, MaterialIcons, SimpleLineIcons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const COLOR = "#8C8C88";
const FONTSIZE = 16;

export default function MenuScreen() {
  const navigation = useNavigation();
  const [isLoading, setLoading] = useState(false);

  const onHome = () => {
    router.back();
  };

  const onProf = () => {
    router.push("/(main)/(menu)/profile");
  };

  const onGoal = () => {
    router.push("/(main)/(menu)/goal");
  };

  // TODO: 画面ができ次第の実装
  const onAccount = () => {
    const user = auth.currentUser;

    if (user?.isAnonymous) {
      router.push("/(main)/(menu)/account/anonymous");
    } else {
      router.push("/(main)/(menu)/account/menu");
    }
  };

  // ローディング時にヘッダーボタンを非表示
  useEffect(() => {
    navigation.setOptions({ headerShown: !isLoading });
  }, [isLoading]);

  const onSignOut = async () => {
    setLoading(true);
    try {
      await authSercice.signout();

      router.dismissAll();
      router.replace("/(auth)/signIn");
    } catch (error) {
      Alert.alert("ログアウトに失敗しました");
      if (error instanceof ApiError) {
        console.error(
          `API通信エラー（ログアウト処理）：[${error.status}]${error.message}`
        );
      } else {
        console.error(`ログアウト処理失敗：${error}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <Indicator />;
  }

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
