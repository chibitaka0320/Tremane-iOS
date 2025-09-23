import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import theme from "@/styles/theme";
import { format } from "date-fns";
import Indicator from "@/components/common/Indicator";
import { router } from "expo-router";
import { selectLabel } from "@/types/common";
import CustomTextInput from "@/components/common/CustomTextInput";
import { validateReps, validateWeight } from "@/lib/validators";
import uuid from "react-native-uuid";
import { auth } from "@/lib/firebaseConfig";
import { Picker } from "@react-native-picker/picker";
import * as trainingService from "@/service/trainingService";
import * as bodyPartRepository from "@/localDb/repository/bodyPartRepository";
import { BodyPartDto } from "@/types/dto";

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
  const [isDisabled, setDisabled] = useState(true);
  const [bodyPartsModal, setBodyPartsModal] = useState(false);
  const [exerciseModal, setExerciseModal] = useState(false);

  // ピッカーデータ関連
  const [bodyPartData, setBodyPartData] = useState<BodyPartDto[]>([]);
  const [bodyPartOptions, setBodyPartOptions] = useState<selectLabel[]>([]);
  const [exerciseOptions, setExerciseOptions] = useState<selectLabel[]>([]);

  const selectedBodyParts =
    bodyPartOptions.find((o) => o.value === bodyParts)?.label ||
    "選択してください";

  const selectedExercise =
    exerciseOptions.find((o) => o.value === exercise)?.label ||
    "選択してください";

  // 部位・種別情報取得
  useEffect(() => {
    const fetchBodyParts = async () => {
      const res = await bodyPartRepository.getBodyPartsWithExercises();
      if (res) {
        setBodyPartData(res);
        setBodyPartOptions(
          res.map((part) => ({
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
          <TouchableOpacity
            style={styles.inputValue}
            onPress={() => setBodyPartsModal(true)}
          >
            <Text>{selectedBodyParts}</Text>
          </TouchableOpacity>

          <Modal visible={bodyPartsModal} transparent animationType="slide">
            <TouchableWithoutFeedback onPress={() => setBodyPartsModal(false)}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.modalContent}>
                    <View style={styles.header}>
                      <TouchableOpacity
                        onPress={() => setBodyPartsModal(false)}
                      >
                        <Text style={styles.headerText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                    <Picker
                      selectedValue={bodyParts}
                      onValueChange={(itemValue) => setBodyParts(itemValue)}
                    >
                      <Picker.Item
                        label="選択してください"
                        value=""
                        enabled={false}
                      />
                      {bodyPartOptions.map(({ label, value }) => (
                        <Picker.Item key={value} label={label} value={value} />
                      ))}
                    </Picker>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>種目</Text>
          <TouchableOpacity
            style={styles.inputValue}
            onPress={() => setExerciseModal(true)}
            disabled={!bodyParts}
          >
            <Text>{selectedExercise}</Text>
          </TouchableOpacity>

          <Modal visible={exerciseModal} transparent animationType="slide">
            <TouchableWithoutFeedback onPress={() => setExerciseModal(false)}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.modalContent}>
                    <View style={styles.header}>
                      <TouchableOpacity onPress={() => setExerciseModal(false)}>
                        <Text style={styles.headerText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                    <Picker
                      selectedValue={exercise}
                      onValueChange={(itemValue) => setExercise(itemValue)}
                    >
                      <Picker.Item
                        label="選択してください"
                        value=""
                        enabled={false}
                      />
                      {exerciseOptions.map(({ label, value }) => (
                        <Picker.Item key={value} label={label} value={value} />
                      ))}
                    </Picker>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
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
