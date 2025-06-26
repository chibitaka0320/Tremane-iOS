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

export default function EatingScreen() {
  const navigation = useNavigation();

  const [date, setDate] = useState(new Date());
  const [name, setName] = useState("");
  const [kcal, setKcal] = useState("0");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isKcalFocused, setIsKcalFocused] = useState(false);

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

  const onRecordEating = () => {};

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
          <Text style={styles.label}>食事名</Text>
          <TextInput
            style={styles.inputValue}
            onChangeText={setName}
            value={name}
          />
        </View>
        <View style={styles.inputItem}>
          <Text style={styles.label}>カロリー</Text>
          <TextInput
            style={styles.inputValue}
            keyboardType="numeric"
            value={isKcalFocused ? (kcal === "0" ? "" : kcal) : kcal}
            onFocus={() => setIsKcalFocused(true)}
            onBlur={() => {
              setIsKcalFocused(false);
              // 空欄でフォーカスアウトしたら0に戻す
              if (kcal === "" || isNaN(Number(kcal))) {
                setKcal("0");
              } else if (/^0\d+/.test(kcal)) {
                // 先頭が0で2桁以上の場合はトリム（例: 0123→123, 00→0）
                const trimmed = String(Number(kcal));
                setKcal(trimmed);
              }
              // 1桁の"0"はそのまま許容
            }}
            onChangeText={setKcal}
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
        <TouchableOpacity style={styles.inputItem} onPress={onRecordEating}>
          <Text style={styles.button}>食事を記録</Text>
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
