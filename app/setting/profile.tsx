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
} from "react-native";
import theme from "@/styles/theme";
import Indicator from "@/components/common/Indicator";
import { format } from "date-fns";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import RNPickerSelect from "react-native-picker-select";
import { getActiveLevelExplanation } from "@/constants/activeLevelExplain";
import { genderOptions } from "@/constants/genderOptions";
import { activeOptions } from "@/constants/activeOptions";

export default function ProfileScreen() {
  const [nickname, setNickname] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [birthDate, setBirthDate] = useState<Date>(new Date("2000-01-01"));
  const [gender, setGender] = useState("");
  const [activeLevel, setActiveLevel] = useState("");

  const [isLoading, setLoading] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const activeLevelExplanation = getActiveLevelExplanation(activeLevel);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date: Date) => {
    setBirthDate(date);
    hideDatePicker();
  };

  /** API実装後作成 */
  const onUpdate = () => {
    console.log({ nickname, height, weight, birthDate, gender, activeLevel });
  };

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
          <Text style={styles.label}>ニックネーム</Text>
          <TextInput
            onChangeText={setNickname}
            style={styles.inputValue}
            value={nickname}
          />
        </View>
        <View style={styles.inputItem}>
          <Text style={styles.label}>身長（cm）</Text>
          <TextInput
            onChangeText={setHeight}
            style={styles.inputValue}
            keyboardType="numeric"
            value={height}
          />
        </View>
        <View style={styles.inputItem}>
          <Text style={styles.label}>体重（kg）</Text>
          <TextInput
            onChangeText={setWeight}
            style={styles.inputValue}
            keyboardType="numeric"
            value={weight}
          />
        </View>
        <View style={styles.inputItem}>
          <Text style={styles.label}>生年月日</Text>
          <Text style={styles.inputValue} onPress={showDatePicker}>
            {format(birthDate, "yyyy年MM月dd日")}
          </Text>
          <DateTimePickerModal
            date={birthDate}
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
          <Text style={styles.label}>性別</Text>
          <RNPickerSelect
            onValueChange={(value) => {
              setGender(value);
            }}
            items={genderOptions}
            value={gender}
            placeholder={{ label: "選択してください", value: "" }}
            style={pickerSelectStyles}
          />
        </View>
        <View style={styles.inputItem}>
          <Text style={styles.label}>活動レベル</Text>
          <RNPickerSelect
            onValueChange={(value) => {
              setActiveLevel(value);
            }}
            items={activeOptions}
            value={activeLevel}
            placeholder={{ label: "選択してください", value: "" }}
            style={pickerSelectStyles}
          />
          {activeLevelExplanation ? (
            <Text style={styles.explanation}>{activeLevelExplanation}</Text>
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
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: styles.inputValue,
  inputIOSContainer: {
    pointerEvents: "none",
  },
});
