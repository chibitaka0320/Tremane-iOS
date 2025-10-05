import CustomTextInput from "@/components/common/CustomTextInput";
import Indicator from "@/components/common/Indicator";
import PickerModal, { SelectLabel } from "@/components/common/PickerModal";
import { auth } from "@/lib/firebaseConfig";
import { validateReps, validateWeight } from "@/lib/validators";
import * as bodyPartService from "@/service/bodyPartService";
import * as trainingService from "@/service/trainingService";
import theme from "@/styles/theme";
import { BodyPart } from "@/types/dto/bodyPartDto";
import { format } from "date-fns";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import uuid from "react-native-uuid";

// トレーニング追加画面
export default function TrainingAddScreen() {
  // 表示データ
  const [date, setDate] = useState(new Date());
  const [bodyParts, setBodyParts] = useState("");
  const [exercise, setExercise] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");

  // フラグ
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isBodyPartsModalVisible, setBodyPartsModalVisible] = useState(false);
  const [isExerciseModalVisible, setExerciseModalVisible] = useState(false);

  // ピッカーデータ関連
  const [bodyPartData, setBodyPartData] = useState<BodyPart[]>([]);
  const [bodyPartOptions, setBodyPartOptions] = useState<SelectLabel[]>([]);
  const [exerciseOptions, setExerciseOptions] = useState<SelectLabel[]>([]);

  const selectedBodyParts =
    bodyPartOptions.find((o) => o.value === bodyParts)?.label ||
    "選択してください";

  const selectedExercise =
    exerciseOptions.find((o) => o.value === exercise)?.label ||
    "選択してください";

  // 部位・種別情報取得
  useEffect(() => {
    const fetchBodyParts = async () => {
      const fetchedBodyParts =
        await bodyPartService.getBodyPartsWithExercises();
      if (fetchedBodyParts) {
        setBodyPartData(fetchedBodyParts);
        setBodyPartOptions(
          fetchedBodyParts.map((part) => ({
            label: part.partName,
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
          label: ex.exerciseName,
          value: String(ex.exerciseId),
        }))
      );
    } else {
      setExerciseOptions([]);
      setExercise("");
    }
  }, [bodyParts, bodyPartData]);

  // 入力値バリデーション
  const isFormValid = (): boolean => {
    return (
      validateWeight(weight) && validateReps(reps) && !!bodyParts && !!exercise
    );
  };

  // 日付選択送信
  const handleDatePickerConfirm = (date: Date) => {
    setDate(date);
    setDatePickerVisibility(false);
  };

  // トレーニング記録追加
  const handleAddTraining = async () => {
    setLoading(true);
    if (auth.currentUser === null) return;

    try {
      await trainingService.upsertTraining(
        uuid.v4(),
        date,
        auth.currentUser.uid,
        exercise,
        parseFloat(weight),
        parseInt(reps)
      );
      router.dismissAll();
      router.replace("/(main)/(tabs)/(home)/training");
    } catch (error) {
      console.error("トレーニング追加失敗：" + error);
      Alert.alert("トレーニングの追加に失敗しました。");
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
          <TouchableOpacity
            style={styles.inputValue}
            onPress={() => setDatePickerVisibility(true)}
          >
            <Text style={styles.inputValueText}>
              {format(date, "yyyy年MM月dd日")}
            </Text>
          </TouchableOpacity>
          <DateTimePickerModal
            date={date}
            isVisible={isDatePickerVisible}
            mode="date"
            locale="ja"
            onConfirm={handleDatePickerConfirm}
            onCancel={() => setDatePickerVisibility(false)}
            pickerStyleIOS={{ alignSelf: "center" }}
            confirmTextIOS="完了"
            cancelTextIOS="キャンセル"
          />
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>部位</Text>
          <TouchableOpacity
            style={styles.inputValue}
            onPress={() => setBodyPartsModalVisible(true)}
          >
            <Text>{selectedBodyParts}</Text>
          </TouchableOpacity>

          <PickerModal
            visible={isBodyPartsModalVisible}
            onClose={() => setBodyPartsModalVisible(false)}
            selectedValue={bodyParts}
            onChange={(val) => setBodyParts(val)}
            options={bodyPartOptions}
          />
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>種目</Text>
          <TouchableOpacity
            style={styles.inputValue}
            onPress={() => setExerciseModalVisible(true)}
            disabled={!bodyParts}
          >
            <Text>{selectedExercise}</Text>
          </TouchableOpacity>
          <PickerModal
            visible={isExerciseModalVisible}
            onClose={() => setExerciseModalVisible(false)}
            selectedValue={exercise}
            onChange={(val) => setExercise(val)}
            options={exerciseOptions}
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
          style={[styles.button, !isFormValid() && styles.buttonDisabled]}
          onPress={handleAddTraining}
          disabled={!isFormValid()}
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

  // モーダル
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopWidth: 1,
    borderTopColor: "#d5d9da8f",
    backgroundColor: "#d7e0e2ff",
    paddingBottom: theme.spacing[5],
  },
  header: {
    backgroundColor: theme.colors.background.light,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerText: {
    fontSize: 16,
    color: "blue",
    textAlign: "right",
  },
});
