import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import theme from "@/styles/theme";
import Indicator from "@/components/common/Indicator";
import { format } from "date-fns";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { getActiveLevelExplanation } from "@/constants/activeLevelExplain";
import { genderOptions } from "@/constants/genderOptions";
import { activeOptions } from "@/constants/activeOptions";
import { apiRequestWithRefresh } from "@/lib/apiClient";
import { router } from "expo-router";
import CustomTextInput from "@/components/common/CustomTextInput";
import { validateHeight, validateWeight } from "@/lib/validators";
import { getUserProfile } from "@/localDb/service/userProfileService";
import { auth } from "@/lib/firebaseConfig";
import { UserProfile } from "@/types/localDb";
import {
  insertUserProfileDao,
  setUserProfileSynced,
} from "@/localDb/dao/userProfileDao";

export default function ProfileEditScreen() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [birthday, setBirthday] = useState<Date>(new Date("2000-01-01"));
  const [gender, setGender] = useState("0");
  const [activeLevel, setActiveLevel] = useState("0");

  const [isLoading, setLoading] = useState(false);
  const [isDisabled, setDisabled] = useState(true);

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const activeLevelExplanation = getActiveLevelExplanation(activeLevel);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date: Date) => {
    setBirthday(date);
    hideDatePicker();
  };

  // ボタン活性・非活性
  useEffect(() => {
    if (validateHeight(height) && validateWeight(weight)) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [height, weight]);

  // 更新ボタン押下
  const onUpdate = async () => {
    setLoading(true);

    if (auth.currentUser === null) return;

    const userProfile: UserProfile = {
      userId: auth.currentUser.uid,
      height: parseFloat(height),
      weight: parseFloat(weight),
      birthday: format(birthday, "yyyy-MM-dd"),
      gender: parseInt(gender),
      activeLevel: parseInt(activeLevel),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await insertUserProfileDao(userProfile, 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      router.back();
    }

    try {
      const res = await apiRequestWithRefresh(
        "/users/profile",
        "POST",
        userProfile
      );
      if (res?.ok) {
        await setUserProfileSynced();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 画面初期表示時
  useEffect(() => {
    const fetchApi = async () => {
      const res = await getUserProfile();

      if (res) {
        if (res.height != null) {
          setHeight(String(res.height));
        }
        if (res.weight != null) {
          setWeight(String(res.weight));
        }

        if (res.birthday != null) {
          setBirthday(new Date(res.birthday));
        }

        if (res.gender != null) {
          setGender(String(res.gender));
        }

        if (res.activeLevel != null) {
          setActiveLevel(String(res.activeLevel));
        }
      }
    };
    fetchApi();
  }, []);

  if (isLoading) {
    return <Indicator />;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: theme.spacing[6] }}
      >
        <View style={styles.item}>
          <Text style={styles.label}>身長（cm）</Text>
          <CustomTextInput
            onChangeText={setHeight}
            keyboardType="numeric"
            value={height}
          />
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>体重（kg）</Text>
          <CustomTextInput
            onChangeText={setWeight}
            keyboardType="numeric"
            value={weight}
          />
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>生年月日</Text>
          <TouchableOpacity style={styles.inputValue} onPress={showDatePicker}>
            <Text style={styles.inputValueText}>
              {format(birthday, "yyyy年MM月dd日")}
            </Text>
          </TouchableOpacity>
          <DateTimePickerModal
            date={birthday}
            isVisible={isDatePickerVisible}
            mode="date"
            locale="ja"
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
            pickerStyleIOS={{ alignSelf: "center" }}
            confirmTextIOS="完了"
            cancelTextIOS="キャンセル"
          />
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>性別</Text>
          <View style={styles.selectContainer}>
            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.selectButton,
                  gender === option.value && styles.selectedButton,
                ]}
                onPress={() => setGender(option.value)}
              >
                <Text
                  style={[
                    styles.selectText,
                    gender === option.value && styles.selectedText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.item}>
          <Text style={styles.label}>活動レベル</Text>
          <View style={styles.selectContainer}>
            {activeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.selectButton,
                  activeLevel === option.value && styles.selectedButton,
                ]}
                onPress={() => setActiveLevel(option.value)}
              >
                <Text
                  style={[
                    styles.selectText,
                    activeLevel === option.value && styles.selectedText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {activeLevelExplanation ? (
            <Text style={styles.explanation}>{activeLevelExplanation}</Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.button, isDisabled && styles.buttonDisabled]}
          onPress={onUpdate}
          disabled={isDisabled}
        >
          <Text style={styles.buttonText}>プロフィールを更新</Text>
        </TouchableOpacity>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.lightGray,
    paddingTop: theme.spacing[5],
    paddingHorizontal: theme.spacing[5],
  },

  // インプットアイテム
  item: {
    marginBottom: theme.spacing[4],
  },
  label: {
    marginBottom: theme.spacing[1],
  },
  inputValue: {
    justifyContent: "center",
    paddingHorizontal: theme.spacing[3],
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    backgroundColor: theme.colors.background.light,
    borderRadius: 5,
    height: 48,
  },
  inputValueText: {
    fontSize: theme.fontSizes.medium,
  },

  // 通常ボタン
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: 5,
    paddingVertical: theme.spacing[3],
    alignItems: "center",
    marginVertical: theme.spacing[3],
    color: theme.colors.white,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.lightGray,
  },
  buttonText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.white,
  },

  explanation: {
    margin: theme.spacing[2],
  },

  // 選択肢レイアウト
  selectContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderRadius: 5,
    overflow: "hidden",
  },
  selectButton: {
    padding: theme.spacing[2],
    backgroundColor: "#DDDDDD",
    flex: 1,
  },
  selectedButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  selectText: {
    textAlign: "center",
  },
  selectedText: {
    color: theme.colors.white,
    fontWeight: "bold",
  },
});
