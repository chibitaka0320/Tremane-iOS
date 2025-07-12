import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Alert,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import theme from "@/styles/theme";
import { format } from "date-fns";
import { apiRequestWithRefresh } from "@/lib/apiClient";
import Indicator from "@/components/common/Indicator";
import { router, useLocalSearchParams } from "expo-router";
import { BodyPartExerciseResponse, TrainingResponse } from "@/types/api";
import { selectLabel } from "@/types/common";
import CustomTextInput from "@/components/common/CustomTextInput";
import { validateReps, validateWeight } from "@/lib/validators";

export default function TrainingScreen() {
  // パスパラメーター
  const { trainingId } = useLocalSearchParams<{ trainingId: string }>();

  // API定数
  const API_ENDPOINTS = {
    bodyParts: "/bodyparts",
    training: (id: string) => `/training/${id}`,
    saveTraining: (id: string) => `/training/${id}`,
  };

  // 表示データ
  const [date, setDate] = useState(new Date());
  const [bodyParts, setBodyParts] = useState("");
  const [exercise, setExercise] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");

  // ピッカーデータ
  const [changeBodyParts, setChangeBodyParts] = useState("");
  const [bodyPartData, setBodyPartData] = useState<BodyPartExerciseResponse[]>(
    []
  );
  const [bodyPartOptions, setBodyPartOptions] = useState<selectLabel[]>([]);
  const [exerciseOptions, setExerciseOptions] = useState<selectLabel[]>([]);

  // フラグ
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isDisabled, setDisabled] = useState(true);

  // 部位・種別情報取得
  useEffect(() => {
    const fetchBodyParts = async () => {
      const res = await apiRequestWithRefresh<BodyPartExerciseResponse[]>(
        API_ENDPOINTS.bodyParts,
        "GET"
      );
      if (res) {
        setBodyPartData(res);
        setBodyPartOptions(
          res.map((part) => ({
            label: part.name,
            value: String(part.partsId),
          }))
        );
      }
    };
    fetchBodyParts();
  }, []);

  // トレーニング詳細取得
  useEffect(() => {
    const fetchTraining = async () => {
      if (!trainingId) return;
      const res = await apiRequestWithRefresh<TrainingResponse>(
        API_ENDPOINTS.training(trainingId),
        "GET"
      );
      if (res) {
        setDate(new Date(res.date));
        setBodyParts(res.partsId.toString());
        setExercise(res.exerciseId.toString());
        setWeight(res.weight.toString());
        setReps(res.reps.toString());
      }
    };

    fetchTraining();
  }, [trainingId]);

  // 種目オプション更新
  useEffect(() => {
    const selected = bodyPartData.find(
      (part) => String(part.partsId) === bodyParts
    );
    if (selected) {
      setExerciseOptions(
        selected.exercises.map((ex) => ({
          label: ex.name,
          value: String(ex.exerciseId),
        }))
      );
    } else {
      setExerciseOptions([]);
      setExercise("");
    }
  }, [bodyParts, bodyPartData]);

  // ボタン活性・非活性
  useEffect(() => {
    if (validateWeight(weight) && validateReps(reps) && bodyParts && exercise) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [bodyParts, exercise, weight, reps]);

  // ピッカー開閉
  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };
  const handleConfirm = (date: Date) => {
    setDate(date);
    hideDatePicker();
  };

  // トレーニング更新処理
  const onRecordTraining = async () => {
    setLoading(true);
    const requestBody = {
      date: format(date, "yyyy-MM-dd"),
      exerciseId: exercise,
      weight: parseFloat(weight),
      reps: parseInt(reps),
    };
    try {
      await apiRequestWithRefresh(
        API_ENDPOINTS.saveTraining(trainingId),
        "PUT",
        requestBody
      );
      router.dismissAll();
      router.replace("/(tabs)/training");
    } catch (e) {
      Alert.alert("エラー", "時間をおいて再度実行してください");
      return;
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <Indicator />;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.item}>
          <Text style={styles.label}>日付</Text>
          <TouchableOpacity style={styles.inputValue} onPress={showDatePicker}>
            <Text style={styles.inputValueText}>
              {format(date, "yyyy年MM月dd日")}
            </Text>
          </TouchableOpacity>
          <DateTimePickerModal
            date={date}
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
          <Text style={styles.label}>部位</Text>
          <RNPickerSelect
            onValueChange={(value) => {
              setChangeBodyParts(value);
            }}
            onClose={() => {
              if (changeBodyParts !== bodyParts) {
                setExercise("");
              }
              setBodyParts(changeBodyParts);
            }}
            items={bodyPartOptions}
            value={bodyParts}
            placeholder={{ label: "選択してください", value: "" }}
            style={pickerSelectStyles}
          />
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>種目</Text>
          <RNPickerSelect
            onValueChange={(value) => {
              setExercise(value);
            }}
            items={exerciseOptions}
            value={exercise}
            placeholder={{ label: "選択してください", value: "" }}
            style={pickerSelectStyles}
            disabled={!bodyParts}
          />
        </View>
        <View style={[styles.item, styles.row]}>
          <View style={styles.rowItem}>
            <Text style={styles.label}>重量（kg）</Text>
            <CustomTextInput
              onChangeText={setWeight}
              keyboardType="numeric"
              value={weight}
            />
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.label}>回数</Text>
            <CustomTextInput
              onChangeText={setReps}
              keyboardType="numeric"
              value={reps}
            />
          </View>
        </View>
        <TouchableOpacity
          style={[styles.button, isDisabled && styles.buttonDisabled]}
          onPress={onRecordTraining}
          disabled={isDisabled}
        >
          <Text style={styles.buttonText}>トレーニングを記録</Text>
        </TouchableOpacity>
      </View>
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rowItem: {
    width: "45%",
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
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: styles.inputValue,
  inputIOSContainer: {
    pointerEvents: "none",
  },
});
