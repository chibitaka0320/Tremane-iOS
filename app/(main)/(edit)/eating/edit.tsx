import Indicator from "@/components/common/Indicator";
import CustomTextInput from "@/components/common/CustomTextInput";
import { auth } from "@/lib/firebaseConfig";
import { validateEatName, validatePfc } from "@/lib/validators";
import * as eatingService from "@/service/eatingService";
import theme from "@/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function EatingEditScreen() {
  // パスパラメーター
  const { eatingId } = useLocalSearchParams<{ eatingId: string }>();

  // 表示データ
  const [date, setDate] = useState(new Date());
  const [name, setName] = useState("");
  const [protein, setProtein] = useState("0");
  const [fat, setFat] = useState("0");
  const [carbo, setCarbo] = useState("0");

  // フラグ
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isDisabled, setDisabled] = useState(true);

  // 食事詳細取得
  useEffect(() => {
    const fetchEating = async () => {
      setLoading(true);
      try {
        const res = await eatingService.getEating(eatingId);

        if (res) {
          setDate(new Date(res.date));
          setName(res.name);
          setProtein(res.protein.toString());
          setFat(res.fat.toString());
          setCarbo(res.carbo.toString());
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

    try {
      await eatingService.upsertEating(
        eatingId,
        date,
        auth.currentUser.uid,
        name,
        parseFloat(protein),
        parseFloat(fat),
        parseFloat(carbo)
      );
      router.back();
    } catch (error) {
      console.error("食事更新失敗：" + error);
      Alert.alert("食事の更新に失敗しました。");
    } finally {
      setLoading(false);
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
            await eatingService.deleteEating(eatingId);
            router.back();
          } catch (error) {
            console.error("食事削除失敗：" + error);
            Alert.alert("食事の削除に失敗しました。");
          } finally {
            setLoading(false);
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
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.item}>
            <Text style={styles.sectionLabel}>日付</Text>
            <TouchableOpacity style={styles.dateCard} onPress={showDatePicker}>
              <View style={styles.dateCardLeft}>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={theme.colors.font.gray}
                />
                <Text style={styles.dateText}>
                  {format(date, "yyyy年M月d日（E）", { locale: ja })}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={theme.colors.font.gray}
              />
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
            <Text style={styles.sectionLabel}>食事名</Text>
            <CustomTextInput
              placeholder="例：鶏むね肉とご飯"
              onChangeText={setName}
              value={name}
            />
          </View>

          <View style={styles.item}>
            <Text style={styles.sectionLabel}>栄養素</Text>
            <View style={styles.pfcRow}>
              <View style={styles.pfcCard}>
                <Text style={styles.pfcLetter}>P</Text>
                <Text style={styles.pfcLabel}>タンパク質（P）</Text>
                <View style={styles.pfcInputRow}>
                  <View style={styles.pfcInputBox}>
                    <TextInput
                      keyboardType="numeric"
                      style={styles.pfcInputText}
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
                          setProtein(String(Number(protein)));
                        }
                      }}
                    />
                  </View>
                  <Text style={styles.pfcUnit}>g</Text>
                </View>
              </View>
              <View style={styles.pfcCard}>
                <Text style={styles.pfcLetter}>F</Text>
                <Text style={styles.pfcLabel}>脂質（F）</Text>
                <View style={styles.pfcInputRow}>
                  <View style={styles.pfcInputBox}>
                    <TextInput
                      keyboardType="numeric"
                      style={styles.pfcInputText}
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
                          setFat(String(Number(fat)));
                        }
                      }}
                    />
                  </View>
                  <Text style={styles.pfcUnit}>g</Text>
                </View>
              </View>
              <View style={styles.pfcCard}>
                <Text style={styles.pfcLetter}>C</Text>
                <Text style={styles.pfcLabel}>糖質（C）</Text>
                <View style={styles.pfcInputRow}>
                  <View style={styles.pfcInputBox}>
                    <TextInput
                      keyboardType="numeric"
                      style={styles.pfcInputText}
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
                          setCarbo(String(Number(carbo)));
                        }
                      }}
                    />
                  </View>
                  <Text style={styles.pfcUnit}>g</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.updateButton, isDisabled && styles.buttonDisabled]}
            onPress={onUpdateEating}
            disabled={isDisabled}
          >
            <Text style={styles.buttonText}>更新</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={onDeleteEating}>
            <Text style={styles.buttonText}>削除</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.lightGray,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[5],
    paddingBottom: theme.spacing[6],
  },

  item: {
    marginBottom: theme.spacing[5],
  },
  sectionLabel: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
    color: theme.colors.dark,
    marginBottom: theme.spacing[2],
  },

  // 日付カード
  dateCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.background.light,
    borderRadius: 8,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
  },
  dateCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
  },
  dateText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.dark,
  },

  // 栄養素カード
  pfcRow: {
    flexDirection: "row",
    gap: theme.spacing[2],
  },
  pfcCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: theme.colors.background.light,
    borderRadius: 8,
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[1],
  },
  pfcLetter: {
    fontSize: theme.fontSize.xl,
    color: theme.colors.dark,
    marginBottom: theme.spacing[1],
  },
  pfcLabel: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
    textAlign: "center",
    marginBottom: theme.spacing[3],
  },
  pfcInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[1],
  },
  pfcInputBox: {
    justifyContent: "center",
    width: 80,
    height: 40,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 8,
    backgroundColor: theme.colors.background.light,
    paddingHorizontal: theme.spacing[1],
  },
  pfcInputText: {
    width: "100%",
    padding: 0,
    fontSize: theme.fontSize.lg,
    fontWeight: "bold",
    color: theme.colors.dark,
    textAlign: "center",
  },
  pfcUnit: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
  },

  // フッターボタン
  footer: {
    paddingHorizontal: theme.spacing[5],
    paddingBottom: theme.spacing[5],
  },
  updateButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 5,
    paddingVertical: theme.spacing[3],
    alignItems: "center",
    marginBottom: theme.spacing[3],
  },
  deleteButton: {
    backgroundColor: theme.colors.dark,
    borderRadius: 5,
    paddingVertical: theme.spacing[3],
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: theme.colors.lightGray,
  },
  buttonText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.white,
  },
});
