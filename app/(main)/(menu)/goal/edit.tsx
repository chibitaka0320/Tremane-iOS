import Indicator from "@/components/common/Indicator";
import { pfcOptions } from "@/constants/pfcOptions";
import { pfcPlanDetails } from "@/constants/pfcPlanDetails";
import { auth } from "@/lib/firebaseConfig";
import { validateWeight } from "@/lib/validators";
import * as userGoalService from "@/service/userGoalService";
import theme from "@/styles/theme";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { addMonths, format } from "date-fns";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

// 目標設定更新画面
export default function GoalEditScreen() {
  const [weight, setWeight] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [start, setStart] = useState<Date>(new Date());
  // 終了日の初期値は現在日の3ヶ月後（date-fnsのaddMonthsは月末日数の差を自動調整する）
  const [finish, setFinish] = useState<Date>(addMonths(new Date(), 3));
  const [pfc, setPfc] = useState("0");

  const [isLoading, setLoading] = useState(false);
  const [isDisabled, setDisabled] = useState(true);

  const [isStart, setIsStart] = useState(false);
  const [isFinish, setIsFinish] = useState(false);

  const pfcPlanDetail = pfcPlanDetails[pfc];

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

    try {
      await userGoalService.upsertUserGoal(
        auth.currentUser.uid,
        parseFloat(weight),
        parseFloat(goalWeight),
        start,
        finish,
        parseInt(pfc)
      );
      router.back();
    } catch (error) {
      console.error("目標更新失敗：" + error);
      Alert.alert("目標の更新に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchApi = async () => {
      const res = await userGoalService.getUserGoal();
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
        contentContainerStyle={styles.content}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>目標体重</Text>
          <View style={styles.weightRow}>
            <View style={styles.weightInputWrap}>
              <TextInput
                onChangeText={setWeight}
                style={styles.weightInput}
                keyboardType="numeric"
                value={weight}
              />
              <Text style={styles.weightUnit}>kg</Text>
            </View>
            <FontAwesome6
              name="arrow-right"
              size={18}
              color={theme.colors.font.gray}
            />
            <View style={styles.weightInputWrap}>
              <TextInput
                onChangeText={setGoalWeight}
                style={styles.weightInput}
                keyboardType="numeric"
                value={goalWeight}
              />
              <Text style={styles.weightUnit}>kg</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>期間</Text>
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>開始日</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={showStartPicker}
            >
              <Text style={styles.dateButtonText}>
                {format(start, "yyyy年M月d日")}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={theme.colors.font.gray}
              />
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
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>終了日</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={showFinishPicker}
            >
              <Text style={styles.dateButtonText}>
                {format(finish, "yyyy年M月d日")}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={theme.colors.font.gray}
              />
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
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PFCバランス</Text>
          <View style={styles.segmentedControl}>
            {pfcOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.segment,
                  pfc === option.value && styles.segmentSelected,
                ]}
                onPress={() => setPfc(option.value)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    pfc === option.value && styles.segmentTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {pfcPlanDetail ? (
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Ionicons
                  name="information-circle"
                  size={18}
                  color={theme.colors.secondary}
                />
                <Text style={styles.infoTitle}>プランの特徴</Text>
              </View>
              <Text style={styles.infoDescription}>
                {pfcPlanDetail.description}
              </Text>
              <Text style={styles.infoRatio}>{pfcPlanDetail.ratio}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.footnote}>
          ※
          目標摂取カロリーは、目標体重・期間・PFCバランスから自動で計算されます。
        </Text>

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
  },
  content: {
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[6],
  },

  section: {
    marginBottom: theme.spacing[5],
  },
  sectionTitle: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "700",
    color: theme.colors.font.black,
    marginBottom: theme.spacing[2],
  },

  // 目標体重
  weightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
  },
  weightInputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: 4,
    backgroundColor: theme.colors.background.light,
    paddingHorizontal: theme.spacing[3],
  },
  weightInput: {
    flex: 1,
    fontSize: theme.fontSizes.large,
    fontWeight: "600",
    color: theme.colors.font.black,
    paddingVertical: 12,
  },
  weightUnit: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
    marginLeft: theme.spacing[2],
  },

  // 期間
  dateItem: {
    marginBottom: theme.spacing[3],
  },
  dateLabel: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
    marginBottom: theme.spacing[1],
  },
  dateButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: 4,
    backgroundColor: theme.colors.background.light,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 12,
  },
  dateButtonText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.font.black,
  },

  // PFCバランス
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: theme.colors.background.dark,
    borderRadius: 4,
    marginBottom: theme.spacing[3],
  },
  segment: {
    flex: 1,
    paddingVertical: theme.spacing[2],
    borderRadius: 4,
    alignItems: "center",
  },
  segmentSelected: {
    backgroundColor: theme.colors.secondary,
  },
  segmentText: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "600",
    color: theme.colors.font.gray,
  },
  segmentTextSelected: {
    color: theme.colors.white,
  },
  infoCard: {
    backgroundColor: "rgba(66, 169, 230, 0.08)",
    borderRadius: 12,
    padding: theme.spacing[4],
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
    marginBottom: theme.spacing[2],
  },
  infoTitle: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "700",
    color: theme.colors.secondary,
  },
  infoDescription: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.black,
    lineHeight: 20,
    marginBottom: theme.spacing[2],
  },
  infoRatio: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "600",
    color: theme.colors.secondary,
  },

  footnote: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
    lineHeight: 18,
    marginBottom: theme.spacing[4],
  },

  // 通常ボタン
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingVertical: theme.spacing[3],
    alignItems: "center",
    color: theme.colors.white,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.lightGray,
  },
  buttonText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.white,
  },
});
