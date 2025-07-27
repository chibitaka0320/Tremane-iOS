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
import { apiRequestWithRefreshNew } from "@/lib/apiClient";
import { router } from "expo-router";
import { pfcOptions } from "@/constants/pfcOptions";
import { getPfcBalanceExplanation } from "@/constants/pfcBalanceExplain";
import { FontAwesome6 } from "@expo/vector-icons";
import { validateWeight } from "@/lib/validators";
import { auth } from "@/lib/firebaseConfig";
import { UserGoal } from "@/types/localDb";
import {
  insertUserGoalDao,
  setUserGoalSynced,
} from "@/localDb/dao/userGoalDao";
import { getUserGoal } from "@/localDb/service/userGoalService";

export default function GoalScreen() {
  const [weight, setWeight] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [start, setStart] = useState<Date>(new Date());
  const [finish, setFinish] = useState<Date>(new Date());
  const [pfc, setPfc] = useState("0");

  const [isLoading, setLoading] = useState(false);
  const [isDisabled, setDisabled] = useState(true);

  const [isStart, setIsStart] = useState(false);
  const [isFinish, setIsFinish] = useState(false);

  const pfcBalanceExplanation = getPfcBalanceExplanation(pfc);

  // ボタン活性・非活性
  useEffect(() => {
    if (
      validateWeight(weight) &&
      validateWeight(goalWeight) &&
      !(start >= finish)
    ) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [weight, goalWeight, start, finish]);

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

  //更新ボタン押下
  const onUpdate = async () => {
    setLoading(true);

    if (auth.currentUser === null) return;

    const userGoal: UserGoal = {
      userId: auth.currentUser.uid,
      weight: parseFloat(weight),
      goalWeight: parseFloat(goalWeight),
      start: format(start, "yyyy-MM-dd"),
      finish: format(finish, "yyyy-MM-dd"),
      pfc: parseInt(pfc),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await insertUserGoalDao(userGoal, 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      router.back();
    }

    try {
      const res = await apiRequestWithRefreshNew(
        "/users/goal",
        "POST",
        userGoal
      );
      if (res?.ok) {
        await setUserGoalSynced();
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const fetchApi = async () => {
      const URL = "/users/goal";

      const res = await getUserGoal();
      if (res) {
        if (res.weight != null) {
          setWeight(String(res.weight));
        }

        if (res.goalWeight != null) {
          setGoalWeight(String(res.goalWeight));
        }

        if (res.start != null) {
          setStart(new Date(res.start));
        }

        if (res.finish != null) {
          setFinish(new Date(res.finish));
        }

        if (res.pfc != null) {
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
        <View style={styles.item}>
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
        <View style={styles.item}>
          <Text style={styles.label}>開始日</Text>
          <TouchableOpacity style={styles.inputValue} onPress={showStartPicker}>
            <Text style={styles.inputValueText}>
              {format(start, "yyyy年MM月dd日")}
            </Text>
          </TouchableOpacity>
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
        <View style={styles.item}>
          <Text style={styles.label}>終了日</Text>
          <TouchableOpacity
            style={styles.inputValue}
            onPress={showFinishPicker}
          >
            <Text style={styles.inputValueText}>
              {format(finish, "yyyy年MM月dd日")}
            </Text>
          </TouchableOpacity>
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

        <View style={styles.item}>
          <Text style={styles.label}>PFCバランス</Text>
          <View style={styles.selectContainer}>
            {pfcOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.selectButton,
                  pfc === option.value && styles.selectedButton,
                ]}
                onPress={() => setPfc(option.value)}
              >
                <Text
                  style={[
                    styles.selectText,
                    pfc === option.value && styles.selectedText,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {pfcBalanceExplanation ? (
            <Text style={styles.explanation}>{pfcBalanceExplanation}</Text>
          ) : null}
        </View>
        <TouchableOpacity
          style={[styles.button, isDisabled && styles.buttonDisabled]}
          onPress={onUpdate}
          disabled={isDisabled}
        >
          <Text style={styles.buttonText}>目標を更新</Text>
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
    fontSize: theme.fontSizes.medium,
  },
  inputValueText: {
    fontSize: theme.fontSizes.medium,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  smallInput: {
    width: "35%",
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

const pickerSelectStyles = StyleSheet.create({
  inputIOS: styles.inputValue,
  inputIOSContainer: {
    pointerEvents: "none",
  },
});
