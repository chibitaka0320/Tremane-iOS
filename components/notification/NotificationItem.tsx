import theme from "@/styles/theme";
import { NotificationResponse } from "@/types/api";
import { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import * as friendService from "@/service/friendService";
import { ApiError } from "@/lib/error";

type Props = {
  notification: NotificationResponse;
};

export const NotificationItem = ({ notification }: Props) => {
  const [status, setStatus] = useState<string | null>(notification.status); // 友達ステータス
  const [requestId, setRequestId] = useState<string | null>(
    notification.relatedId
  );

  const [isStatusLoading, setStatusLoading] = useState<boolean>(false); // ステータスローディングフラグ

  // エラーハンドリング
  const errorHandle = (error: any, process: string) => {
    if (error instanceof ApiError) {
      console.error(`APIエラー(${process})：[${error.status}]${error.message}`);
    } else {
      console.error(`${process}に失敗：${error}`);
    }
  };

  const isFriendRequestType = () => {
    return "FRIEND_REQUEST" === notification.type;
  };

  // 友達申請許可
  const receiveFriend = async () => {
    setStatusLoading(true);

    if (!isFriendRequestType() || !requestId) {
      setStatusLoading(false);
      return;
    }

    try {
      const res = await friendService.acceptFriend(requestId);

      if (!res.requestId) {
        Alert.alert("すでに申請が取り消されています。", "", [
          {
            text: "OK",
            style: "cancel",
            onPress: () => {
              setStatus(null);
            },
          },
        ]);
      }

      setStatus(res.status);
      setRequestId(res.requestId);
    } catch (error) {
      Alert.alert("申請許可に失敗しました。");
      errorHandle(error, "申請許可");
    } finally {
      setStatusLoading(false);
    }
  };

  // 友達申請拒否
  const rejectFriend = () => {
    Alert.alert("申請の拒否", `本当に申請を拒否しますか？`, [
      {
        text: "キャンセル",
        style: "cancel",
      },
      {
        text: "申請を拒否",
        style: "destructive",
        onPress: async () => {
          setStatusLoading(true);
          if (!requestId) {
            setStatusLoading(false);
            return;
          }

          try {
            await friendService.revokeFriend(requestId);
            setStatus(null);
            setRequestId(null);
          } catch (error) {
            Alert.alert("申請の拒否に失敗しました。");
            errorHandle(error, "申請の拒否");
          } finally {
            setStatusLoading(false);
          }
        },
      },
    ]);
  };

  // 友達削除
  const removeFriend = () => {
    Alert.alert("友達から削除", `本当に友達から削除しますか？`, [
      {
        text: "キャンセル",
        style: "cancel",
      },
      {
        text: "友達から削除",
        style: "destructive",
        onPress: async () => {
          setStatusLoading(true);
          if (!requestId) {
            setStatusLoading(false);
            return;
          }

          try {
            friendService.revokeFriend(requestId);
            setStatus(null);
            setRequestId(null);
          } catch (error) {
            Alert.alert("友達から削除処理に失敗しました。");
            errorHandle(error, "友達削除処理");
          } finally {
            setStatusLoading(false);
          }
        },
      },
    ]);
  };

  // 友達申請
  const addFriend = async () => {
    setStatusLoading(true);

    if (!isFriendRequestType() || !notification.notificationSource) {
      setStatusLoading(false);
      return;
    }

    try {
      const res = await friendService.requestFriend(
        notification.notificationSource
      );
      if (res.status === "receive") {
        Alert.alert("すでに友達申請を受けています。", "", [
          {
            text: "OK",
            style: "cancel",
            onPress: () => {
              setStatus("pending");
            },
          },
        ]);
      } else {
        setStatus("request");
      }

      setRequestId(res.requestId);
    } catch (error) {
      Alert.alert("友達申請に失敗しました。");
      errorHandle(error, "友達申請");
    } finally {
      setStatusLoading(false);
    }
  };

  // 申請取り消し
  const cancelApplication = async () => {
    Alert.alert("申請を取り消しますか？", "", [
      {
        text: "キャンセル",
        style: "cancel",
      },
      {
        text: "取り消す",
        style: "destructive",
        onPress: async () => {
          setStatusLoading(true);
          if (!requestId) {
            setStatusLoading(false);
            return;
          }

          try {
            await friendService.revokeFriend(requestId);
            setStatus(null);
            setRequestId(null);
          } catch (error) {
            Alert.alert("申請の取り消しに失敗しました。");
            errorHandle(error, "申請の取り消し");
          } finally {
            setStatusLoading(false);
          }
        },
      },
    ]);
  };

  if (isFriendRequestType()) {
    return (
      <View style={styles.notificationItem}>
        <Text style={styles.notificationMessage}>{notification.message}</Text>
        {isStatusLoading ? (
          <View
            style={[
              styles.activityContainer,
              status !== null && styles.alreadyFriend,
            ]}
          >
            <ActivityIndicator />
          </View>
        ) : (
          <>
            {"pending" === status && (
              <View style={styles.receiveContainer}>
                <TouchableOpacity onPress={rejectFriend}>
                  <Text style={styles.receiveFriend}>拒否</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={receiveFriend}>
                  <Text style={[styles.receiveFriend, styles.alreadyFriend]}>
                    許可
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            {"accepted" === status && (
              <TouchableOpacity onPress={removeFriend}>
                <Text style={[styles.addFriend, styles.alreadyFriend]}>
                  <FontAwesome name="check" color="white" size={16} /> 友達
                </Text>
              </TouchableOpacity>
            )}
            {null === status && (
              <TouchableOpacity onPress={addFriend}>
                <Text style={styles.addFriend}>友達に追加</Text>
              </TouchableOpacity>
            )}
            {status === "request" && (
              <TouchableOpacity onPress={cancelApplication}>
                <Text style={[styles.addFriend, styles.alreadyFriend]}>
                  申請中
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    );
  }
};

const styles = StyleSheet.create({
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
    marginRight: theme.spacing[3],
  },
  activityContainer: {
    width: 70,
    alignItems: "center",
    paddingVertical: theme.spacing[2],
    borderColor: theme.colors.font.gray,
    borderWidth: 0.5,
    borderRadius: 4,
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
  addFriend: {
    fontWeight: "700",
    width: 80,
    textAlign: "center",
    paddingVertical: theme.spacing[2],
    borderColor: theme.colors.font.gray,
    borderWidth: 0.5,
    borderRadius: 4,
  },
});
