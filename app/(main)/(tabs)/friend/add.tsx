import CustomTextInput from "@/components/common/CustomTextInput";
import Indicator from "@/components/common/Indicator";
import { auth } from "@/lib/firebaseConfig";
import { validateHandle } from "@/lib/validators";
import theme from "@/styles/theme";
import { UserSearchResponse } from "@/types/api";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as friendService from "@/service/friendService";
import * as userService from "@/service/userService";
import { ApiError } from "@/lib/error";
import * as Clipboard from "expo-clipboard";

interface Props {
  onClose: () => void;
}

export default function FriendAddScreen({ onClose }: Props) {
  const [handle, setHandle] = useState(""); // ID（検索用ハンドル）
  const [resultText, setResultText] = useState("検索してください"); // 結果テキスト
  const [user, setUser] = useState<UserSearchResponse | null>(); // 検索ユーザー情報
  const [status, setStatus] = useState<string | null>(); // 友達ステータス
  const [requestId, setRequestId] = useState<string | null>(); // 友達リクエストID
  const [selfId, setSelfId] = useState<string | null>(null); // 自身のID（未設定の場合はuser_id）
  const [hasSearched, setHasSearched] = useState(false); // 検索実行済みフラグ

  const [isLoading, setLoading] = useState(false); // ローディングフラグ
  const [isStatusLoading, setStatusLoading] = useState(false); // ステータスローディングフラグ
  const [isDisabled, setDisabled] = useState(true); // 検索ボタン活性非活性

  // 自身のID取得（未設定の場合はuser_idを表示）
  useEffect(() => {
    const fetchSelfId = async () => {
      const currentUser = await userService.getUser();
      setSelfId(currentUser?.handle ?? currentUser?.userId ?? null);
    };
    fetchSelfId();
  }, []);

  // 自身のIDをコピー
  const onCopySelfId = async () => {
    if (!selfId) return;
    await Clipboard.setStringAsync(selfId);
    Alert.alert("コピーしました");
  };

  // エラーハンドリング
  const errorHandle = (error: any, process: string) => {
    if (error instanceof ApiError) {
      console.error(`APIエラー(${process})：[${error.status}]${error.message}`);
    } else {
      console.error(`${process}に失敗：${error}`);
    }
  };

  // ボタン活性非活性
  useEffect(() => {
    if (validateHandle(handle)) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [handle]);

  // ユーザー検索
  const search = async () => {
    setLoading(true);
    setUser(null);
    setHasSearched(true);
    if (auth.currentUser === null) return;

    try {
      const data = await friendService.searchUserByHandle(handle);

      if (data) {
        setUser(data);
        setStatus(data.status);
        setRequestId(data.requestId);
      } else {
        setResultText("見つかりませんでした");
      }
    } catch (error) {
      setResultText("見つかりませんでした");
      errorHandle(error, "ユーザー検索");
    } finally {
      setLoading(false);
    }
  };

  // 友達申請
  const addFriend = async () => {
    setStatusLoading(true);

    if (!user) {
      setStatusLoading(false);
      return;
    }

    try {
      const res = await friendService.requestFriend(user.userId);
      if (res.status === "receive") {
        Alert.alert("すでに友達申請を受けています。", "", [
          {
            text: "OK",
            style: "cancel",
          },
        ]);
      }

      setStatus(res.status);
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

  // 友達削除
  const removeFriend = async () => {
    Alert.alert(
      "友達から削除",
      `${user?.nickname}さんを本当に友達から削除しますか？`,
      [
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
      ]
    );
  };

  // 友達申請許可
  const receiveFriend = async () => {
    setStatusLoading(true);

    if (!requestId) {
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
  const rejectFriend = async () => {
    Alert.alert(
      "申請の拒否",
      `${user?.nickname}さんからの申請を拒否しますか？`,
      [
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
      ]
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Ionicons name="close-outline" size={30} onPress={onClose} />
        </View>
        <View style={styles.selfIdCard}>
          <Text style={styles.selfIdLabel}>あなたのID</Text>
          <View style={styles.selfIdRight}>
            <Text
              style={styles.selfIdValue}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {selfId ?? "-"}
            </Text>
            <TouchableOpacity onPress={onCopySelfId}>
              <Ionicons
                name="copy-outline"
                size={20}
                color={theme.colors.secondary}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.searchCard}>
          <Text style={styles.searchText}>IDで友達を探す</Text>
          <View style={styles.searchParts}>
            <View style={styles.textInput}>
              <CustomTextInput
                onChangeText={setHandle}
                value={handle}
                autoCapitalize="none"
                placeholder="IDを入力してください"
              />
            </View>
            <TouchableOpacity
              style={[
                styles.button,
                (isDisabled || isLoading) && styles.buttonDisabled,
              ]}
              onPress={search}
              disabled={isDisabled || isLoading}
            >
              <Text style={styles.buttonText}>検索</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.searchHint}>
            半角英数字と「_」「-」「.」のみ、8〜16文字で入力してください
          </Text>
        </View>
        <View style={styles.searchResultContainer}>
          {user ? (
            <View style={styles.resultUserContainer}>
              <Text style={styles.userName}>{user.nickname}</Text>
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
                  {status === null && (
                    <TouchableOpacity onPress={addFriend}>
                      <Text style={styles.addFriend}>+ 友達に追加</Text>
                    </TouchableOpacity>
                  )}
                  {status === "pending" && (
                    <TouchableOpacity onPress={cancelApplication}>
                      <Text style={[styles.addFriend, styles.alreadyFriend]}>
                        申請中
                      </Text>
                    </TouchableOpacity>
                  )}
                  {status === "accepted" && (
                    <TouchableOpacity onPress={removeFriend}>
                      <Text style={[styles.addFriend, styles.alreadyFriend]}>
                        <FontAwesome name="check" color="white" size={16} />{" "}
                        友達
                      </Text>
                    </TouchableOpacity>
                  )}
                  {status === "receive" && (
                    <View style={styles.receiveContainer}>
                      <TouchableOpacity onPress={rejectFriend}>
                        <Text style={styles.receiveFriend}>拒否</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={receiveFriend}>
                        <Text
                          style={[styles.receiveFriend, styles.alreadyFriend]}
                        >
                          許可
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </View>
          ) : (
            <View style={styles.resultTextContainer}>
              {isLoading ? (
                <Indicator />
              ) : (
                <>
                  <View style={styles.searchIconCircle}>
                    <Ionicons
                      name="search"
                      size={40}
                      color={theme.colors.secondary}
                    />
                  </View>
                  <Text style={styles.resultText}>{resultText}</Text>
                  {!hasSearched && (
                    <Text style={styles.resultCaption}>
                      IDを入力して検索すると、友達を見つけることができます。
                    </Text>
                  )}
                </>
              )}
            </View>
          )}
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.lightGray,
  },
  header: {
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[2],
  },

  selfIdCard: {
    marginHorizontal: theme.spacing[4],
    marginTop: theme.spacing[3],
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[3],
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.light,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selfIdLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.font.gray,
    flexShrink: 0,
  },
  selfIdRight: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: theme.spacing[2],
    marginLeft: theme.spacing[2],
  },
  selfIdValue: {
    flexShrink: 1,
    fontSize: theme.fontSize.md,
    fontWeight: "600",
  },

  searchCard: {
    marginHorizontal: theme.spacing[4],
    marginTop: theme.spacing[4],
    padding: theme.spacing[3],
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    backgroundColor: theme.colors.background.light,
  },
  searchText: {
    marginBottom: theme.spacing[3],
    fontWeight: "bold",
    fontSize: theme.fontSize.sm,
  },
  searchParts: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
  },
  textInput: {
    flex: 1,
  },
  button: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing[4],
    borderRadius: 5,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.lightGray,
  },
  buttonText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.white,
    fontWeight: "bold",
  },
  searchHint: {
    marginTop: theme.spacing[2],
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
  },

  searchResultContainer: {
    padding: theme.spacing[4],
  },
  resultTextContainer: {
    marginTop: theme.spacing[6],
    alignItems: "center",
  },
  searchIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(66, 169, 230, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing[3],
  },
  resultText: {
    fontSize: theme.fontSizes.large,
    fontWeight: "bold",
  },
  resultCaption: {
    marginTop: theme.spacing[1],
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
    textAlign: "center",
  },

  resultUserContainer: {
    alignItems: "center",
  },
  userName: {
    fontSize: theme.fontSizes.large,
    marginVertical: theme.spacing[4],
  },
  addFriend: {
    fontWeight: "700",
    width: 150,
    textAlign: "center",
    paddingVertical: theme.spacing[2],
    borderColor: theme.colors.font.gray,
    borderWidth: 0.5,
    borderRadius: 4,
  },
  alreadyFriend: {
    color: theme.colors.white,
    backgroundColor: theme.colors.black,
  },
  activityContainer: {
    width: 150,
    alignItems: "center",
    paddingVertical: theme.spacing[2],
    borderColor: theme.colors.font.gray,
    borderWidth: 0.5,
    borderRadius: 4,
  },

  receiveContainer: {
    flexDirection: "row",
  },
  receiveFriend: {
    fontWeight: "700",
    width: 100,
    textAlign: "center",
    paddingVertical: theme.spacing[2],
    marginHorizontal: theme.spacing[2],
    borderColor: theme.colors.font.gray,
    borderWidth: 0.5,
    borderRadius: 4,
  },
});
