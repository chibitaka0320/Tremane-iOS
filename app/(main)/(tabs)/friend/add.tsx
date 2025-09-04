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
} from "react-native";

interface Props {
  onClose: () => void;
}

export default function FriendAddScreen({ onClose }: Props) {
  const [email, setEmail] = useState("");
  const [resultText, setResultText] = useState("検索してください");
  const [user, setUser] = useState<UserAccountInfoResponse | null>();

  const [isLoading, setLoading] = useState(false);
  const [isDisabled, setDisabled] = useState(true);

  useEffect(() => {
    if (validateEmail(email)) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [email]);

  const search = async () => {
    setLoading(true);
    setUser(null);

    try {
      if (auth.currentUser === null) return;
      const res = await apiRequestWithRefresh(`/users/search?email=${email}`);
      if (res?.ok) {
        const data: UserAccountInfoResponse = await res.json();
        setUser(data);
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
              <TouchableOpacity>
                <Text
                  style={[
                    styles.addFriendButtonText,
                    user.status !== null && styles.already,
                  ]}
                >
                  {user.status === null && "+ 友達に追加"}
                  {user.status === "accepted" && (
                    <Text>
                      <FontAwesome name="check" color="white" size={16} /> 友達
                    </Text>
                  )}
                  {user.status === "pennding" && "申請中"}
                </Text>
              </TouchableOpacity>
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
  addFriendButtonText: {
    fontWeight: "700",
    width: 150,
    textAlign: "center",
    paddingVertical: theme.spacing[2],
    borderColor: theme.colors.font.gray,
    borderWidth: 0.5,
    borderRadius: 4,
  },
  already: {
    color: theme.colors.white,
    backgroundColor: theme.colors.black,
  },
});
