import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import theme from "@/styles/theme";
import { format } from "date-fns";
import { apiRequestWithRefresh } from "@/lib/apiClient";
import Indicator from "@/components/common/Indicator";
import { router } from "expo-router";
import { selectLabel } from "@/types/common";
import CustomTextInput from "@/components/common/CustomTextInput";
import { validateReps, validateWeight } from "@/lib/validators";
import { BodypartWithExercise } from "@/types/bodyPart";
import { getBodyPartsWithExercises } from "@/localDb/service/bodyPartService";
import { Training } from "@/types/localDb";
import uuid from "react-native-uuid";
import { auth } from "@/lib/firebaseConfig";
import { upsertTrainingDao } from "@/localDb/dao/trainingDao";

export default function TrainingScreen() {
  // 表示データ
  const [date, setDate] = useState(new Date());
  const [bodyParts, setbodyParts] = useState("");
  const [exercise, setExercise] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");

  // フラグ
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isDisabled, setDisabled] = useState(true);

  // ピッカーデータ関連
  const [bodyPartData, setBodyPartData] = useState<BodypartWithExercise[]>([]);
  const [bodyPartOptions, setBodyPartOptions] = useState<selectLabel[]>([]);
  const [exerciseOptions, setExerciseOptions] = useState<selectLabel[]>([]);

  // 部位・種別情報取得
  useEffect(() => {
    const fetchBodyParts = async () => {
      const res = await getBodyPartsWithExercises();
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

  // トレーニング記録
  const onRecordTraining = async () => {
    setLoading(true);

    if (auth.currentUser === null) return;

    const training: Training[] = [
      {
        trainingId: uuid.v4(),
        date: format(date, "yyyy-MM-dd"),
        userId: auth.currentUser.uid,
        exerciseId: exercise,
        weight: parseFloat(weight),
        reps: parseInt(reps),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    try {
      await upsertTrainingDao(training, 0, 0);
    } catch (error) {
      console.error(error);
    } finally {
      router.dismissAll();
      router.replace("/(tabs)/(main)/training");
      setLoading(false);
    }

    try {
      const res = await apiRequestWithRefresh("/training", "POST", training);
      if (res?.ok) {
        await upsertTrainingDao(training, 1, 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBodyPartChange = useCallback(
    (value: string) => {
      if (value !== bodyParts) {
        setbodyParts(value);
      }
    },
    [bodyParts]
  );

  const handleExerciseChange = useCallback(
    (value: string) => {
      if (value !== exercise) {
        setExercise(value);
      }
    },
    [exercise]
  );

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
            onValueChange={handleBodyPartChange}
            items={bodyPartOptions}
            value={bodyParts}
            placeholder={{ label: "選択してください", value: "" }}
            style={pickerSelectStyles}
          />
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>種目</Text>
          <RNPickerSelect
            onValueChange={handleExerciseChange}
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
