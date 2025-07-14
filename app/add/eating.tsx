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
  ScrollView,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import theme from "@/styles/theme";
import { format } from "date-fns";
import Indicator from "@/components/common/Indicator";
import { router, useNavigation } from "expo-router";
import { apiRequestWithRefresh } from "@/lib/apiClient";
import CustomTextInput from "@/components/common/CustomTextInput";
import { validateEatName, validatePfc } from "@/lib/validators";

export default function EatingScreen() {
  const navigation = useNavigation();

  const [date, setDate] = useState(new Date());
  const [name, setName] = useState("");
  const [protein, setProtein] = useState("0");
  const [fat, setFat] = useState("0");
  const [carbo, setCarbo] = useState("0");
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isDisabled, setDisabled] = useState(true);

  const [isProtein, setIsProtein] = useState(false);
  const [isFat, setIsFat] = useState(false);
  const [isCarbo, setIsCarbo] = useState(false);

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

  useEffect(() => {
    if (
      validateEatName(name) &&
      validatePfc(protein) &&
      validatePfc(fat) &&
      validatePfc(carbo)
    ) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [name, protein, fat, carbo]);

  // 食事記録ボタン押下
  const onRecordEating = async () => {
    const URL = "/eating";
    setLoading(true);
    const requestBody = {
      date: format(date, "yyyy-MM-dd"),
      name,
      protein: parseFloat(protein),
      fat: parseFloat(fat),
      carbo: parseFloat(carbo),
    };

    try {
      await apiRequestWithRefresh(URL, "POST", requestBody);
      router.back();
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
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: theme.spacing[6] }}
      >
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
          <Text style={styles.label}>食事名</Text>
          <CustomTextInput onChangeText={setName} value={name} />
        </View>
        <View style={styles.item}>
          <View style={styles.pfcHeader}>
            <Text style={styles.label}>タンパク質（P）</Text>
            <View style={styles.valuesContainer}>
              <TextInput
                keyboardType="numeric"
                style={[styles.inputValue, styles.pfcValue]}
                onChangeText={setProtein}
                value={isProtein ? (protein === "0" ? "" : protein) : protein}
                onFocus={() => setIsProtein(true)}
                onBlur={() => {
                  setIsProtein(false);
                  if (protein === "" || isNaN(Number(protein))) {
                    setProtein("0");
                  } else if (/^0\d+/.test(protein)) {
                    const trimmed = String(Number(protein));
                    setProtein(trimmed);
                  }
                }}
              />
              <Text style={styles.unit}>g</Text>
            </View>
          </View>
        </View>
        <View style={styles.item}>
          <View style={styles.pfcHeader}>
            <Text style={styles.label}>脂質（F）</Text>
            <View style={styles.valuesContainer}>
              <TextInput
                keyboardType="numeric"
                style={[styles.inputValue, styles.pfcValue]}
                onChangeText={setFat}
                value={isFat ? (fat === "0" ? "" : fat) : fat}
                onFocus={() => setIsFat(true)}
                onBlur={() => {
                  setIsFat(false);
                  if (fat === "" || isNaN(Number(fat))) {
                    setFat("0");
                  } else if (/^0\d+/.test(fat)) {
                    const trimmed = String(Number(fat));
                    setFat(trimmed);
                  }
                }}
              />
              <Text style={styles.unit}>g</Text>
            </View>
          </View>
        </View>
        <View style={styles.item}>
          <View style={styles.pfcHeader}>
            <Text style={styles.label}>糖質（C）</Text>
            <View style={styles.valuesContainer}>
              <TextInput
                keyboardType="numeric"
                style={[styles.inputValue, styles.pfcValue]}
                onChangeText={setCarbo}
                value={isCarbo ? (carbo === "0" ? "" : carbo) : carbo}
                onFocus={() => setIsCarbo(true)}
                onBlur={() => {
                  setIsCarbo(false);
                  if (carbo === "" || isNaN(Number(carbo))) {
                    setCarbo("0");
                  } else if (/^0\d+/.test(carbo)) {
                    const trimmed = String(Number(carbo));
                    setCarbo(trimmed);
                  }
                }}
              />
              <Text style={styles.unit}>g</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, isDisabled && styles.buttonDisabled]}
          onPress={onRecordEating}
          disabled={isDisabled}
        >
          <Text style={styles.buttonText}>食事を記録</Text>
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
  },
  inputValueText: {
    fontSize: theme.fontSizes.medium,
  },

  pfcValue: { width: 80 },

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

  pfcHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  valuesContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  unit: {
    marginLeft: theme.spacing[2],
  },
});
