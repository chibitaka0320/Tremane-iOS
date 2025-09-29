import Indicator from "@/components/common/Indicator";
import { NotificationItem } from "@/components/notification/NotificationItem";
import theme from "@/styles/theme";
import { Notification } from "@/types/dto/notificationDto";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import * as notificationService from "@/service/notificationService";
import { ApiError } from "@/lib/error";

/** 通知一覧画面 */
export default function NotificationScreen() {
  const [notifications, setNotifications] = useState<Notification[]>(); // 通知一覧リスト

  const [isLoading, setIsLoading] = useState<boolean>(false); // ローディングフラグ

  // 通知一覧の取得
  const getNotifications = async () => {
    try {
      const res = await notificationService.getNotification();
      setNotifications(res);
    } catch (error) {
      setNotifications([]);
      if (error instanceof ApiError) {
        console.error(`APIレスポンスエラー：[${error.status}]${error.message}`);
      } else {
        console.error(`通知の取得でエラーが起きました。:${error}`);
      }
    }
  };

  // 画面初期化
  useEffect(() => {
    setIsLoading(true);

    // 一覧取得処理
    getNotifications();

    setIsLoading(false);
  }, []);

  if (isLoading || !notifications) return <Indicator />;

  if (notifications.length === 0) {
    return (
      <View style={styles.nocontentContainer}>
        <Text style={styles.nocontentText}>通知はありません</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {notifications.map((notification, index) => (
        <View key={index}>
          <NotificationItem notification={notification} />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // 通知無し
  nocontentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background.light,
  },
  nocontentText: {
    fontSize: theme.fontSizes.large,
    fontWeight: "bold",
  },

  // 通知あり
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light,
  },
  notificationItem: {
    padding: theme.spacing[3],
    borderColor: theme.colors.lightGray,
    borderBottomWidth: 0.5,
    flexDirection: "row",
    alignItems: "center",
  },
  notificationMessage: {
    flex: 1,
    flexShrink: 1,
    fontSize: theme.fontSizes.medium,
    marginRight: theme.spacing[2],
  },

  // ボタンレイアウト
  // 許可・拒否
  receiveContainer: {
    flexDirection: "row",
  },
  receiveFriend: {
    fontWeight: "700",
    width: 70,
    textAlign: "center",
    paddingVertical: theme.spacing[2],
    marginHorizontal: theme.spacing[1],
    borderColor: theme.colors.font.gray,
    borderWidth: 0.5,
    borderRadius: 4,
  },
  alreadyFriend: {
    color: theme.colors.white,
    backgroundColor: theme.colors.black,
  },
});
