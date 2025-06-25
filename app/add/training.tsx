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

const bodyPartValues = [
  { label: "胸", value: "1" },
  { label: "背中", value: "2" },
  { label: "型", value: "3" },
];

const exerciseValues = [
  { label: "ベンチプレス", value: "1" },
  { label: "スクワット", value: "2" },
  { label: "デッドリフト", value: "3" },
];

export default function TrainingScreen() {
  const navigation = useNavigation();

  const [date, setDate] = useState(new Date());
  const [bodyParts, setbodyParts] = useState("");
  const [exercise, setExercise] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isLoading, setLoading] = useState(false);

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
            items={bodyPartValues}
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
            items={exerciseValues}
            value={exercise}
            placeholder={{ label: "選択してください", value: "" }}
            style={pickerSelectStyles}
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
