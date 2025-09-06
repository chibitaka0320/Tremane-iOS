import CustomTextInput from "@/components/common/CustomTextInput";
import Indicator from "@/components/common/Indicator";
import { apiRequestWithRefresh } from "@/lib/apiClient";
import { auth } from "@/lib/firebaseConfig";
import { validateEmail } from "@/lib/validators";
import theme from "@/styles/theme";
import { UserAccountInfoResponse } from "@/types/api";
import { FontAwesome, FontAwesome6 } from "@expo/vector-icons";
import { User } from "firebase/auth";
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

interface Props {
  onClose: () => void;
}

export default function FriendAddScreen({ onClose }: Props) {
  const [email, setEmail] = useState(""); // メールアドレス
  const [resultText, setResultText] = useState("検索してください"); // 結果テキスト
  const [user, setUser] = useState<UserAccountInfoResponse | null>(); // 検索ユーザー情報
  const [status, setStatus] = useState<string | null>(); // 友達ステータス
  const [requestId, setRequestId] = useState<string | null>(); // 友達リクエストID

  const [isLoading, setLoading] = useState(false); // ローディングフラグ
  const [isStatusLoading, setStatusLoading] = useState(false); // ステータスローディングフラグ
  const [isDisabled, setDisabled] = useState(true); // 検索ボタン活性非活性

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

    try {
      if (auth.currentUser === null) return;
      const res = await apiRequestWithRefresh(`/users/search?email=${email}`);
      if (res?.ok) {
        const data: UserAccountInfoResponse = await res.json();
        setUser(data);
        setStatus(data.status);
        setRequestId(data.requestId);
      } else {
        setResultText("見つかりませんでした");
        const data = await res?.json();
        console.log(data);
      }
    } catch (e) {
      console.error(e);
      setResultText("見つかりませんでした");
    } finally {
      setLoading(false);
    }
  };

  // 友達申請
  const addFriend = async () => {
    setStatusLoading(true);

    if (!user) return;

    try {
      const res = await apiRequestWithRefresh(
        `/friends/${user.userId}`,
        "POST"
      );

      if (res?.ok) {
        const requestId = await res.text();
        setStatus("pending");
        setRequestId(requestId);
      } else {
        Alert.alert("友達申請に失敗しました");
        console.error(res);
      }
    } catch (error) {
      Alert.alert("友達申請に失敗しました。");
      console.error(error);
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
          if (!requestId) return;

          try {
            const res = await apiRequestWithRefresh(
              `/friends/${requestId}`,
              "DELETE"
            );

            if (res?.ok) {
              setStatus(null);
              setRequestId(null);
            } else {
              Alert.alert("申請の取り消しに失敗しました。");
              console.error(res);
            }
          } catch (error) {
            Alert.alert("申請の取り消しに失敗しました。");
            console.error(error);
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
          onPress: () => setStatus(null),
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
});
