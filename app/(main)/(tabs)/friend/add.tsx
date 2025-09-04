import CustomTextInput from "@/components/common/CustomTextInput";
import Indicator from "@/components/common/Indicator";
import { apiRequestWithRefresh } from "@/lib/apiClient";
import { auth } from "@/lib/firebaseConfig";
import { validateEmail } from "@/lib/validators";
import theme from "@/styles/theme";
import { UserAccountInfoResponse } from "@/types/api";
import { FontAwesome6 } from "@expo/vector-icons";
import { User } from "firebase/auth";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";

interface Props {
  onClose: () => void;
}

export default function FriendAddScreen({ onClose }: Props) {
  const [email, setEmail] = useState("");
  const [resultText, setResultText] = useState("検索してください");
  const [user, setUser] = useState<UserAccountInfoResponse | null>();

  const [isLoading, setLoading] = useState(false);

  const search = async () => {
    setLoading(true);
    setUser(null);
    if (!validateEmail(email)) {
      Alert.alert("エラー");
      return;
    }

    if (auth.currentUser === null) return;

    try {
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
            <TouchableOpacity style={styles.button} onPress={search}>
              <Text style={styles.buttonText}>検索</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.searchResultContainer}>
          {user ? (
            <View style={styles.resultUserContainer}>
              <Text style={styles.userName}>{user.nickname}</Text>
              <TouchableOpacity style={styles.addFriendButton}>
                <Text style={styles.addFriendButtonText}>友達に追加</Text>
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
    backgroundColor: theme.colors.primary,
    width: "25%",
    borderRadius: 4,
  },
  buttonText: {
    fontSize: theme.fontSizes.medium,
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
  addFriendButton: {
    width: 150,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: theme.colors.font.gray,
    paddingVertical: theme.spacing[2],
    borderRadius: 4,
  },
  addFriendButtonText: {
    fontWeight: "700",
  },
});
