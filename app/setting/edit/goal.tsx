import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import theme from "@/styles/theme";
import Indicator from "@/components/common/Indicator";
import { format } from "date-fns";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import RNPickerSelect from "react-native-picker-select";
import { getActiveLevelExplanation } from "@/constants/activeLevelExplain";
import { genderOptions } from "@/constants/genderOptions";
import { activeOptions } from "@/constants/activeOptions";
import { apiRequestWithRefresh } from "@/lib/apiClient";
import { UserGoalResponse, UserInfoResponse } from "@/types/api";
import { router } from "expo-router";
import { pfcOptions } from "@/constants/pfcOptions";
import { getPfcBalanceExplanation } from "@/constants/pfcBalanceExplain";
import { Feather, FontAwesome6 } from "@expo/vector-icons";

export default function GoalScreen() {
  const [weight, setWeight] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [start, setStart] = useState<Date>(new Date());
  const [finish, setFinish] = useState<Date>(new Date());
  const [pfc, setPfc] = useState("");

  const [isLoading, setLoading] = useState(false);
  const [isStart, setIsStart] = useState(false);
  const [isFinish, setIsFinish] = useState(false);

  const pfcBalanceExplanation = getPfcBalanceExplanation(pfc);

  // 開始日ピッカー
  const showStartPicker = () => {
    setIsStart(true);
  };
  const hideStartPicker = () => {
    setIsStart(false);
  };
  const startConfirm = (date: Date) => {
    setStart(date);
    hideStartPicker();
  };

  // 終了日ピッカー
  const showFinishPicker = () => {
    setIsFinish(true);
  };
  const hideFinishPicker = () => {
    setIsFinish(false);
  };
  const finishConfirm = (date: Date) => {
    setFinish(date);
    hideFinishPicker();
  };

  // 目標設定更新
  const fetchUpdateGoal = async () => {
    const URL = "/users/goal";
    setLoading(true);
    const requestBody = {
      weight: parseFloat(weight),
      goalWeight: parseFloat(goalWeight),
      start: format(start, "yyyy-MM-dd"),
      finish: format(finish, "yyyy-MM-dd"),
      pfc: parseInt(pfc),
    };

    try {
      await apiRequestWithRefresh(URL, "POST", requestBody);
      router.back();
    } catch (e) {
      Alert.alert("エラー", "時間をおいて再度実行してください");
      return;
    } finally {
      setLoading(false);
    }
  };

  //更新ボタン押下
  const onUpdate = () => {
    if (!weight || !goalWeight) {
      Alert.alert("値を入力してください");
      return;
    }

    if (start >= finish) {
      Alert.alert("終了日は開始日以降を選択してください");
      return;
    }

    if (!pfc) {
      Alert.alert("値を選択してください");
      return;
    }

    if (isNaN(parseFloat(weight)) || isNaN(parseFloat(goalWeight))) {
      Alert.alert("数値を正しく入力してください");
      return;
    }

    fetchUpdateGoal();
  };

  useEffect(() => {
    const fetchApi = async () => {
      const URL = "/users/goal";

      const res = await apiRequestWithRefresh<UserGoalResponse>(URL, "GET");
      if (res) {
        if (res.weight) {
          setWeight(String(res.weight));
        }

        if (res.goalWeight) {
          setGoalWeight(String(res.goalWeight));
        }

        if (res.start) {
          setStart(new Date(res.start));
        }

        if (res.finish) {
          setFinish(new Date(res.finish));
        }

        if (res.pfc) {
          setPfc(String(res.pfc));
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
        <View style={styles.inputItem}>
          <Text style={styles.label}>目標体重（kg）</Text>
          <View style={styles.row}>
            <TextInput
              onChangeText={setWeight}
              style={[styles.inputValue, styles.smallInput]}
              keyboardType="numeric"
              value={weight}
            />
            <FontAwesome6 name="arrow-right" size={30} />
            <TextInput
              onChangeText={setGoalWeight}
              style={[styles.inputValue, styles.smallInput]}
              keyboardType="numeric"
              value={goalWeight}
            />
          </View>
        </View>
        <View style={styles.inputItem}>
          <Text style={styles.label}>開始日</Text>
          <Text style={styles.inputValue} onPress={showStartPicker}>
            {format(start, "yyyy年MM月dd日")}
          </Text>
          <DateTimePickerModal
            date={start}
            isVisible={isStart}
            mode="date"
            locale="ja"
            onConfirm={startConfirm}
            onCancel={hideStartPicker}
            pickerStyleIOS={{ alignSelf: "center" }}
            confirmTextIOS="完了"
            cancelTextIOS="キャンセル"
          />
        </View>
        <View style={styles.inputItem}>
          <Text style={styles.label}>終了日</Text>
          <Text style={styles.inputValue} onPress={showFinishPicker}>
            {format(finish, "yyyy年MM月dd日")}
          </Text>
          <DateTimePickerModal
            date={finish}
            isVisible={isFinish}
            mode="date"
            locale="ja"
            onConfirm={finishConfirm}
            onCancel={hideFinishPicker}
            pickerStyleIOS={{ alignSelf: "center" }}
            confirmTextIOS="完了"
            cancelTextIOS="キャンセル"
          />
        </View>
        <View style={styles.inputItem}>
          <Text style={styles.label}>PFCバランス</Text>
          <RNPickerSelect
            onValueChange={(value) => {
              setPfc(value);
            }}
            items={pfcOptions}
            value={pfc}
            placeholder={{ label: "選択してください", value: "" }}
            style={pickerSelectStyles}
          />
          {pfcBalanceExplanation ? (
            <Text style={styles.explanation}>{pfcBalanceExplanation}</Text>
          ) : null}
        </View>
        <TouchableOpacity style={styles.inputItem} onPress={onUpdate}>
          <Text style={styles.button}>プロフィールを更新</Text>
        </TouchableOpacity>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.light,
    flex: 1,
    padding: theme.spacing[3],
  },
  inputItem: {
    marginHorizontal: theme.spacing[3],
    marginVertical: theme.spacing[3],
  },
  label: {
    fontSize: theme.fontSizes.medium,
    marginBottom: theme.spacing[2],
  },
  inputValue: {
    fontSize: theme.fontSizes.medium,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[3],
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    backgroundColor: theme.colors.background.lightGray,
    borderRadius: 8,
  },
  button: {
    marginVertical: theme.spacing[3],
    fontSize: theme.fontSizes.medium,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[3],
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    fontWeight: "bold",
    textAlign: "center",
    borderRadius: 8,
  },
  explanation: {
    margin: theme.spacing[2],
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  smallInput: {
    width: "35%",
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: styles.inputValue,
  inputIOSContainer: {
    pointerEvents: "none",
  },
});
