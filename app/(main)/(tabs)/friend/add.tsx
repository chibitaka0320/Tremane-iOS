import CustomTextInput from "@/components/common/CustomTextInput";
import Indicator from "@/components/common/Indicator";
import { auth } from "@/lib/firebaseConfig";
import { validateEmail } from "@/lib/validators";
import theme from "@/styles/theme";
import { UserSearchResponse } from "@/types/api";
import { FontAwesome, FontAwesome6 } from "@expo/vector-icons";
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
import { ApiError } from "@/lib/error";

interface Props {
  onClose: () => void;
}

export default function FriendAddScreen({ onClose }: Props) {
  const [email, setEmail] = useState(""); // メールアドレス
  const [resultText, setResultText] = useState("検索してください"); // 結果テキスト
  const [user, setUser] = useState<UserSearchResponse | null>(); // 検索ユーザー情報
  const [status, setStatus] = useState<string | null>(); // 友達ステータス
  const [requestId, setRequestId] = useState<string | null>(); // 友達リクエストID

  const [isLoading, setLoading] = useState(false); // ローディングフラグ
  const [isStatusLoading, setStatusLoading] = useState(false); // ステータスローディングフラグ
  const [isDisabled, setDisabled] = useState(true); // 検索ボタン活性非活性

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
    if (validateEmail(email)) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [email]);

  // ユーザー検索
  const search = async () => {
    setLoading(true);
    setUser(null);
    if (auth.currentUser === null) return;

    try {
      const data = await friendService.searchUserByEmail(email);

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
          <FontAwesome6 name="xmark" size={30} onPress={onClose} />
        </View>
        <View style={styles.searchContainer}>
          <Text style={styles.searchText}>メールアドレスで友達を探す</Text>
          <View style={styles.searchParts}>
            <View style={styles.textInput}>
              <CustomTextInput
                onChangeText={setEmail}
                value={email}
                autoCapitalize="none"
                keyboardType="email-address"
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
                <Text style={styles.resultText}>{resultText}</Text>
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
    backgroundColor: "white",
  },
  header: {
    paddingHorizontal: theme.spacing[4],
  },

  searchContainer: {
    padding: theme.spacing[4],
  },
  searchText: {
    marginVertical: theme.spacing[2],
    fontWeight: "bold",
    fontSize: theme.fontSizes.medium,
  },
  searchParts: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textInput: {
    width: "70%",
  },
  button: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.black,
    width: "25%",
    borderRadius: 4,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.lightGray,
  },
  buttonText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.white,
    fontWeight: "bold",
  },

  searchResultContainer: {
    padding: theme.spacing[4],
  },
  resultTextContainer: {
    marginTop: theme.spacing[6],
    alignItems: "center",
  },
  resultText: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
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
