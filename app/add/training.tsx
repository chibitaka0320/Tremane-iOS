import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TextInput,
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
import { router, useNavigation } from "expo-router";
import { BodyPartExerciseResponse } from "@/types/api";
import { selectLabel } from "@/types/common";

export default function TrainingScreen() {
  const navigation = useNavigation();

  const [date, setDate] = useState(new Date());
  const [bodyParts, setbodyParts] = useState("");
  const [exercise, setExercise] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const [bodyPartData, setBodyPartData] = useState<BodyPartExerciseResponse[]>(
    []
  );
  const [bodyPartOptions, setBodyPartOptions] = useState<selectLabel[]>([]);
  const [exerciseOptions, setExerciseOptions] = useState<selectLabel[]>([]);

  useEffect(() => {
    const fetchApi = async () => {
      const URL = "/bodyparts";
      const res = await apiRequestWithRefresh<BodyPartExerciseResponse[]>(
        URL,
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
    fetchApi();
  }, []);

  useEffect(() => {
    if (!bodyParts) {
      setExerciseOptions([]);
      setExercise("");
      return;
    }
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
      setExercise("");
    }
  }, [bodyParts, bodyPartData]);

  const fetchInsertTraining = async () => {
    const URL = "/training";
    setLoading(true);
    const requestBody = {
      date: format(date, "yyyy-MM-dd"),
      exerciseId: exercise,
      weight: parseFloat(weight),
      reps: parseInt(reps),
    };
    try {
      await apiRequestWithRefresh(URL, "POST", requestBody);
      router.dismissAll();
      router.replace("/(tabs)/training");
    } catch (e) {
      Alert.alert("エラー", "時間をおいて再度実行してください");
      return;
    } finally {
      setLoading(false);
    }
  };

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

  const onRecordTraining = () => {
    if (!bodyParts || !exercise) {
      Alert.alert("値を選択してください");
      return;
    }

    if (!weight || !reps) {
      Alert.alert("値を入力してください");
      return;
    }
    if (isNaN(parseFloat(weight)) || isNaN(parseInt(reps))) {
      Alert.alert("数値を正しく入力してください");
      return;
    }
    fetchInsertTraining();
  };

  if (isLoading) {
    return <Indicator />;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.inputItem}>
          <Text style={styles.label}>日付</Text>
          <Text style={styles.inputValue} onPress={showDatePicker}>
            {format(date, "yyyy年MM月dd日")}
          </Text>
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
        <View style={styles.inputItem}>
          <Text style={styles.label}>部位</Text>
          <RNPickerSelect
            onValueChange={(value) => {
              setbodyParts(value);
            }}
            items={bodyPartOptions}
            value={bodyParts}
            placeholder={{ label: "選択してください", value: "" }}
            style={pickerSelectStyles}
          />
        </View>
        <View style={styles.inputItem}>
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
        <View style={[styles.inputItem, styles.row]}>
          <View style={styles.rowItem}>
            <Text style={styles.label}>重量（kg）</Text>
            <TextInput
              onChangeText={setWeight}
              style={styles.inputValue}
              keyboardType="numeric"
              value={weight}
            />
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.label}>回数</Text>
            <TextInput
              onChangeText={setReps}
              style={styles.inputValue}
              keyboardType="numeric"
              value={reps}
            />
          </View>
        </View>
        <TouchableOpacity style={styles.inputItem} onPress={onRecordTraining}>
          <Text style={styles.button}>トレーニングを記録</Text>
        </TouchableOpacity>
      </View>
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
    margin: theme.spacing[3],
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
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rowItem: {
    width: "45%",
  },
  button: {
    fontSize: theme.fontSizes.medium,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[3],
    backgroundColor: theme.colors.primary,
    color: theme.colors.white,
    fontWeight: "bold",
    textAlign: "center",
    borderRadius: 8,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: styles.inputValue,
  inputIOSContainer: {
    pointerEvents: "none",
  },
});
