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
import { router, useLocalSearchParams } from "expo-router";
import { apiRequestWithRefresh } from "@/lib/apiClient";
import CustomTextInput from "@/components/common/CustomTextInput";
import { validateEatName, validatePfc } from "@/lib/validators";
import {
  deleteEatingDao,
  getEatingDao,
  setEatingSynced,
  upsertEatingDao,
} from "@/localDb/dao/eatingDao";
import { auth } from "@/lib/firebaseConfig";
import { Eating } from "@/types/localDb";
import { calcKcal } from "@/lib/calc";

export default function EatingScreen() {
  // パスパラメーター
  const { eatingId } = useLocalSearchParams<{ eatingId: string }>();

  // APIエンドポイント
  const API_ENDPOINTS = {
    eating: (id: string) => `/eating/${id}`,
  };

  // 表示データ
  const [date, setDate] = useState(new Date());
  const [name, setName] = useState("");
  const [protein, setProtein] = useState("0");
  const [fat, setFat] = useState("0");
  const [carbo, setCarbo] = useState("0");
  const [createdAt, setCreatedAt] = useState("");

  // フラグ
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isDisabled, setDisabled] = useState(true);

  // 食事詳細取得
  useEffect(() => {
    const fetchEating = async () => {
      setLoading(true);
      try {
        const res = await getEatingDao(eatingId);

        if (res) {
          setDate(new Date(res.date));
          setName(res.name);
          setProtein(res.protein.toString());
          setFat(res.fat.toString());
          setCarbo(res.carbo.toString());
          setCreatedAt(res.createdAt);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchEating();
  }, [eatingId]);

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

  // ボタン活性・非活性
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

  // 食事記録更新
  const onUpdateEating = async () => {
    setLoading(true);

    if (auth.currentUser === null) return;

    const eatings: Eating[] = [
      {
        eatingId,
        date: format(date, "yyyy-MM-dd"),
        userId: auth.currentUser.uid,
        name,
        calories: calcKcal(protein, fat, carbo),
        protein: parseFloat(protein),
        fat: parseFloat(fat),
        carbo: parseFloat(carbo),
        createdAt: createdAt,
        updatedAt: new Date().toISOString(),
      },
    ];

    try {
      await upsertEatingDao(eatings, 0, 0);
    } catch (e) {
      console.error(e);
    } finally {
      router.back();
      setLoading(false);
    }

    try {
      const res = await apiRequestWithRefresh(
        API_ENDPOINTS.eating(eatingId),
        "PUT",
        eatings
      );
      if (res?.ok) {
        await upsertEatingDao(eatings, 1, 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 食事記録削除処理
  const onDeleteEating = async () => {
    Alert.alert("", "データを削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除する",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            await deleteEatingDao(eatingId);
          } catch (e) {
            console.error(e);
          } finally {
            router.back();
          }

          try {
            const res = await apiRequestWithRefresh(
              API_ENDPOINTS.eating(eatingId),
              "DELETE",
              null
            );
            if (res?.ok) {
              await setEatingSynced(eatingId);
            }
          } catch (e) {
            console.error(e);
          }
        },
      },
    ]);
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
                value={protein}
                onFocus={() => {
                  if (protein === "0") {
                    setProtein("");
                  }
                }}
                onBlur={() => {
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
                value={fat}
                onFocus={() => {
                  if (fat === "0") {
                    setFat("");
                  }
                }}
                onBlur={() => {
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
                value={carbo}
                onFocus={() => {
                  if (carbo === "0") {
                    setCarbo("");
                  }
                }}
                onBlur={() => {
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
          onPress={onUpdateEating}
          disabled={isDisabled}
        >
          <Text style={styles.buttonText}>更新</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.buttonDelete]}
          onPress={onDeleteEating}
          disabled={isDisabled}
        >
          <Text style={styles.buttonText}>削除</Text>
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
  buttonDelete: {
    backgroundColor: theme.colors.dark,
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
