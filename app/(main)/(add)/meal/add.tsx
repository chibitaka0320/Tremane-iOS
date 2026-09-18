import Indicator from "@/components/common/Indicator";
import SelectModal, {
  SelectModalHandle,
} from "@/components/common/SelectModal";
import { unitOptions } from "@/constants/unitOptions";
import { calcKcal } from "@/lib/calc";
import { auth } from "@/lib/firebaseConfig";
import { validateEatName, validatePfc } from "@/lib/validators";
import * as eatingService from "@/service/eatingService";
import * as mealService from "@/service/mealService";
import theme from "@/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import uuid from "react-native-uuid";

// 食事記録に追加した食品（登録前の一時的な状態）
type PendingFood = {
  id: string;
  name: string;
  protein: number;
  fat: number;
  carbo: number;
  unit: string;
  quantity: number | null;
};

export default function MealAddScreen() {
  const [date, setDate] = useState(new Date());
  const [mealName, setMealName] = useState("");
  const [foods, setFoods] = useState<PendingFood[]>([]);

  // 食品追加・編集フォーム（ボトムシート）
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  // 食品名入力欄を開くたびに作り直すためのkey（日本語IMEの未確定文字を壊さないよう、
  // 入力中はvalueで書き戻さずdefaultValueのみで初期化するため、シートを開く度に再マウントが必要）
  const [foodFormToken, setFoodFormToken] = useState(0);
  const [foodName, setFoodName] = useState("");
  const [foodProtein, setFoodProtein] = useState("0");
  const [foodFat, setFoodFat] = useState("0");
  const [foodCarbo, setFoodCarbo] = useState("0");
  const [foodUnit, setFoodUnit] = useState(unitOptions[0].value);
  const [foodQuantity, setFoodQuantity] = useState("");
  const [isFoodDisabled, setFoodDisabled] = useState(true);

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isDisabled, setDisabled] = useState(true);

  const unitRef = useRef<SelectModalHandle>(null);
  const foodSheetRef = useRef<BottomSheetModal>(null);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirm = (date: Date) => {
    setDate(date);
    hideDatePicker();
  };

  const onConfirmUnit = (value: string) => {
    unitRef.current?.dismiss();
    setFoodUnit(value);
  };

  const renderFoodSheetBackdrop = useCallback(
    (props: BottomSheetDefaultBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    [],
  );

  // 食品追加・編集フォームの活性・非活性
  useEffect(() => {
    if (
      validateEatName(foodName) &&
      validatePfc(foodProtein) &&
      validatePfc(foodFat) &&
      validatePfc(foodCarbo)
    ) {
      setFoodDisabled(false);
    } else {
      setFoodDisabled(true);
    }
  }, [foodName, foodProtein, foodFat, foodCarbo]);

  // 登録ボタンの活性・非活性
  useEffect(() => {
    setDisabled(!(validateEatName(mealName) && foods.length > 0));
  }, [mealName, foods]);

  // 食品追加フォームをリセットして開く
  const onOpenAddFood = () => {
    setEditingFoodId(null);
    setFoodName("");
    setFoodProtein("0");
    setFoodFat("0");
    setFoodCarbo("0");
    setFoodUnit(unitOptions[0].value);
    setFoodQuantity("");
    setFoodFormToken((prev) => prev + 1);
    foodSheetRef.current?.present();
  };

  // 追加済み食品を編集フォームに読み込んで開く
  const onOpenEditFood = (food: PendingFood) => {
    setEditingFoodId(food.id);
    setFoodName(food.name);
    setFoodProtein(String(food.protein));
    setFoodFat(String(food.fat));
    setFoodCarbo(String(food.carbo));
    setFoodUnit(food.unit);
    setFoodQuantity(food.quantity != null ? String(food.quantity) : "");
    setFoodFormToken((prev) => prev + 1);
    foodSheetRef.current?.present();
  };

  // 食品追加・更新フォームの確定
  const onConfirmFood = () => {
    const quantity =
      foodQuantity === "" || isNaN(Number(foodQuantity))
        ? null
        : Number(foodQuantity);
    const food: PendingFood = {
      id: editingFoodId ?? (uuid.v4() as string),
      name: foodName,
      protein: parseFloat(foodProtein),
      fat: parseFloat(foodFat),
      carbo: parseFloat(foodCarbo),
      unit: foodUnit,
      quantity,
    };

    if (editingFoodId) {
      setFoods((prev) => prev.map((f) => (f.id === editingFoodId ? food : f)));
    } else {
      setFoods((prev) => [...prev, food]);
    }
    foodSheetRef.current?.dismiss();
  };

  // 編集中の食品をリストから削除
  const onDeleteFood = () => {
    if (!editingFoodId) return;
    setFoods((prev) => prev.filter((food) => food.id !== editingFoodId));
    foodSheetRef.current?.dismiss();
  };

  // 合計栄養素
  const total = foods.reduce(
    (sum, food) => ({
      calories: sum.calories + calcKcal(food.protein, food.fat, food.carbo),
      protein: sum.protein + food.protein,
      fat: sum.fat + food.fat,
      carbo: sum.carbo + food.carbo,
    }),
    { calories: 0, protein: 0, fat: 0, carbo: 0 },
  );

  // 食事記録登録ボタン押下
  const onRecordMeal = async () => {
    setLoading(true);
    if (auth.currentUser === null) return;
    const userId = auth.currentUser.uid;

    try {
      const mealId = uuid.v4() as string;
      await mealService.upsertMeal(mealId, date, userId, mealName);

      for (const food of foods) {
        await eatingService.upsertEating(
          uuid.v4() as string,
          date,
          userId,
          food.name,
          food.protein,
          food.fat,
          food.carbo,
          mealId,
          food.unit,
          food.quantity,
        );
      }
      router.back();
    } catch (error) {
      console.error("食事記録追加失敗：" + error);
      Alert.alert("食事記録の追加に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <Indicator />;
  }

  return (
    <BottomSheetModalProvider>
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={Keyboard.dismiss}
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
            <View style={styles.nameInputBox}>
              <TextInput
                style={styles.nameInputText}
                placeholder="例：朝食"
                onChangeText={setMealName}
                value={mealName}
                clearButtonMode="while-editing"
              />
            </View>
          </View>

          <View style={styles.item}>
            <View style={styles.totalLabelRow}>
              <Text style={[styles.sectionLabel, styles.totalLabelText]}>
                合計（自動計算）
              </Text>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={theme.colors.font.gray}
              />
            </View>
            <View style={styles.totalCard}>
              <View style={styles.totalKcalRow}>
                <Text style={styles.totalKcalNumber}>
                  {total.calories.toLocaleString()}
                </Text>
                <Text style={styles.totalKcalUnit}>kcal</Text>
              </View>
              <View style={styles.totalPfcRow}>
                <View style={styles.totalPfcCol}>
                  <Text style={styles.totalPfcLabel}>P</Text>
                  <Text style={styles.totalPfcValue}>{total.protein} g</Text>
                </View>
                <View style={styles.totalPfcDivider} />
                <View style={styles.totalPfcCol}>
                  <Text style={styles.totalPfcLabel}>F</Text>
                  <Text style={styles.totalPfcValue}>{total.fat} g</Text>
                </View>
                <View style={styles.totalPfcDivider} />
                <View style={styles.totalPfcCol}>
                  <Text style={styles.totalPfcLabel}>C</Text>
                  <Text style={styles.totalPfcValue}>{total.carbo} g</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.item}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionLabel, styles.totalLabelText]}>
                含まれる食品
              </Text>
              {foods.length > 0 && (
                <Text style={styles.sectionCount}>{foods.length}件</Text>
              )}
            </View>

            {foods.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons
                  name="restaurant-outline"
                  size={40}
                  color={theme.colors.black}
                />
                <Text style={styles.emptyTitle}>
                  まだ食品が追加されていません
                </Text>
                <Text style={styles.emptySubtext}>
                  下のボタンから食品を追加してください。
                </Text>
              </View>
            ) : (
              foods.map((food) => {
                const unitLabel = unitOptions.find(
                  (o) => o.value === food.unit,
                )?.label;
                return (
                  <TouchableOpacity
                    style={styles.foodRow}
                    key={food.id}
                    onPress={() => onOpenEditFood(food)}
                  >
                    <View style={styles.foodRowTop}>
                      <View style={styles.foodRowNameGroup}>
                        <Text style={styles.foodRowName}>{food.name}</Text>
                        {food.quantity != null && (
                          <Text style={styles.foodRowQuantity}>
                            {food.quantity} {unitLabel}
                          </Text>
                        )}
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={theme.colors.font.gray}
                      />
                    </View>
                    <View style={styles.foodRowBottom}>
                      <Text style={styles.foodRowKcal}>
                        {calcKcal(food.protein, food.fat, food.carbo)} kcal
                      </Text>
                      <View style={styles.foodRowPfcGroup}>
                        <Text style={styles.foodRowPfcText}>
                          P {food.protein} g
                        </Text>
                        <Text style={styles.foodRowPfcText}>
                          F {food.fat} g
                        </Text>
                        <Text style={styles.foodRowPfcText}>
                          C {food.carbo} g
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}

            <TouchableOpacity
              style={styles.addFoodOutlineButton}
              onPress={onOpenAddFood}
            >
              <Ionicons name="add" size={18} color={theme.colors.secondary} />
              <Text style={styles.addFoodOutlineButtonText}>食品を追加</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <TouchableOpacity
          style={[styles.submitButton, isDisabled && styles.buttonDisabled]}
          onPress={onRecordMeal}
          disabled={isDisabled}
        >
          <Text style={styles.submitButtonText}>この食事を登録する</Text>
        </TouchableOpacity>

        <SelectModal
          ref={unitRef}
          title="単位を選択してください"
          value={foodUnit}
          options={unitOptions}
          onConfirm={onConfirmUnit}
        />

        <BottomSheetModal
          ref={foodSheetRef}
          backdropComponent={renderFoodSheetBackdrop}
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
        >
          <BottomSheetView style={styles.sheetContent}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View>
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>
                    {editingFoodId ? "食品を編集" : "食品を追加"}
                  </Text>
                  <TouchableOpacity
                    onPress={() => foodSheetRef.current?.dismiss()}
                  >
                    <Ionicons
                      name="close"
                      size={24}
                      color={theme.colors.font.gray}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.item}>
                  <Text style={styles.sectionLabel}>食品名</Text>
                  <View style={styles.nameInputBox}>
                    <BottomSheetTextInput
                      key={foodFormToken}
                      style={styles.nameInputText}
                      placeholder="例：鶏むね肉"
                      onChangeText={setFoodName}
                      defaultValue={foodName}
                    />
                  </View>
                </View>

                <View style={styles.item}>
                  <Text style={styles.sectionLabel}>数量（任意）</Text>
                  <View style={styles.quantityRow}>
                    <View style={styles.quantityInputBox}>
                      <BottomSheetTextInput
                        keyboardType="numeric"
                        style={styles.quantityInputText}
                        placeholder="例：100"
                        onChangeText={setFoodQuantity}
                        value={foodQuantity}
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.unitCard}
                      onPress={() => unitRef.current?.present()}
                    >
                      <Text style={styles.dateText}>
                        {unitOptions.find((o) => o.value === foodUnit)?.label}
                      </Text>
                      <Ionicons
                        name="chevron-down"
                        size={18}
                        color={theme.colors.font.gray}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.sectionLabel}>栄養素</Text>
                <View style={styles.pfcRow}>
                  <View style={styles.pfcCard}>
                    <Text style={styles.pfcLetter}>P</Text>
                    <Text style={styles.pfcLabel}>タンパク質（P）</Text>
                    <View style={styles.pfcInputRow}>
                      <View style={styles.pfcInputBox}>
                        <BottomSheetTextInput
                          keyboardType="numeric"
                          style={styles.pfcInputText}
                          onChangeText={setFoodProtein}
                          value={foodProtein}
                          onFocus={() => {
                            if (foodProtein === "0") setFoodProtein("");
                          }}
                          onBlur={() => {
                            if (
                              foodProtein === "" ||
                              isNaN(Number(foodProtein))
                            ) {
                              setFoodProtein("0");
                            } else if (/^0\d+/.test(foodProtein)) {
                              setFoodProtein(String(Number(foodProtein)));
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
                        <BottomSheetTextInput
                          keyboardType="numeric"
                          style={styles.pfcInputText}
                          onChangeText={setFoodFat}
                          value={foodFat}
                          onFocus={() => {
                            if (foodFat === "0") setFoodFat("");
                          }}
                          onBlur={() => {
                            if (foodFat === "" || isNaN(Number(foodFat))) {
                              setFoodFat("0");
                            } else if (/^0\d+/.test(foodFat)) {
                              setFoodFat(String(Number(foodFat)));
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
                        <BottomSheetTextInput
                          keyboardType="numeric"
                          style={styles.pfcInputText}
                          onChangeText={setFoodCarbo}
                          value={foodCarbo}
                          onFocus={() => {
                            if (foodCarbo === "0") setFoodCarbo("");
                          }}
                          onBlur={() => {
                            if (foodCarbo === "" || isNaN(Number(foodCarbo))) {
                              setFoodCarbo("0");
                            } else if (/^0\d+/.test(foodCarbo)) {
                              setFoodCarbo(String(Number(foodCarbo)));
                            }
                          }}
                        />
                      </View>
                      <Text style={styles.pfcUnit}>g</Text>
                    </View>
                  </View>
                </View>

                {editingFoodId && (
                  <TouchableOpacity
                    style={styles.sheetDeleteButton}
                    onPress={onDeleteFood}
                  >
                    <Text style={styles.sheetDeleteButtonText}>
                      この食品を削除
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.sheetConfirmButton,
                    isFoodDisabled && styles.buttonDisabled,
                  ]}
                  onPress={onConfirmFood}
                  disabled={isFoodDisabled}
                >
                  <Text style={styles.sheetConfirmButtonText}>
                    {editingFoodId ? "更新する" : "追加する"}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </BottomSheetView>
        </BottomSheetModal>
      </View>
    </BottomSheetModalProvider>
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
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing[2],
  },
  sectionCount: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
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

  // テキスト入力（食事名・食品名）
  nameInputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    borderRadius: 5,
    backgroundColor: theme.colors.background.light,
    paddingHorizontal: theme.spacing[3],
    height: 48,
  },
  nameInputText: {
    flex: 1,
    fontSize: theme.fontSizes.medium,
    color: theme.colors.dark,
    paddingVertical: 0,
  },

  // 数量・単位
  quantityRow: {
    flexDirection: "row",
    gap: theme.spacing[2],
  },
  quantityInputBox: {
    flex: 2,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    backgroundColor: theme.colors.background.light,
    borderRadius: 8,
    paddingHorizontal: theme.spacing[4],
  },
  quantityInputText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.dark,
    paddingVertical: theme.spacing[3],
  },
  unitCard: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    backgroundColor: theme.colors.background.light,
    borderRadius: 8,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
  },

  // 含まれる食品一覧
  addFoodOutlineButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing[1],
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    backgroundColor: theme.colors.background.light,
    borderRadius: 8,
    paddingVertical: theme.spacing[3],
    marginBottom: theme.spacing[3],
  },
  addFoodOutlineButtonText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.secondary,
    fontWeight: "bold",
  },
  emptyCard: {
    alignItems: "center",
    marginTop: theme.spacing[3],
    marginBottom: theme.spacing[5],
  },
  emptyTitle: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
    color: theme.colors.dark,
    marginTop: theme.spacing[3],
    marginBottom: theme.spacing[1],
  },
  emptySubtext: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
    textAlign: "center",
  },
  foodRow: {
    backgroundColor: theme.colors.background.light,
    borderRadius: 8,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    marginBottom: theme.spacing[2],
  },
  foodRowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  foodRowNameGroup: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: theme.spacing[2],
  },
  foodRowName: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
    color: theme.colors.dark,
  },
  foodRowQuantity: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
  },
  foodRowBottom: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing[2],
  },
  foodRowKcal: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
    color: theme.colors.dark,
    marginRight: theme.spacing[4],
  },
  foodRowPfcGroup: {
    flexDirection: "row",
    gap: theme.spacing[3],
  },
  foodRowPfcText: {
    fontSize: theme.fontSizes.small,
    fontWeight: "bold",
    color: theme.colors.dark,
  },

  // 合計カード
  totalLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[1],
    marginBottom: theme.spacing[2],
  },
  totalLabelText: {
    marginBottom: 0,
  },
  totalCard: {
    backgroundColor: theme.colors.background.light,
    borderRadius: 8,
    paddingVertical: theme.spacing[5],
    paddingHorizontal: theme.spacing[4],
    alignItems: "center",
  },
  totalKcalRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: theme.spacing[4],
  },
  totalKcalNumber: {
    fontSize: 34,
    fontWeight: "bold",
    color: theme.colors.dark,
  },
  totalKcalUnit: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
    color: theme.colors.dark,
    marginLeft: theme.spacing[1],
  },
  totalPfcRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    justifyContent: "center",
  },
  totalPfcCol: {
    flex: 1,
    alignItems: "center",
  },
  totalPfcLabel: {
    fontSize: theme.fontSizes.small,
    fontWeight: "bold",
    color: theme.colors.dark,
    marginBottom: theme.spacing[1],
  },
  totalPfcValue: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
    color: theme.colors.dark,
  },
  totalPfcDivider: {
    width: 1,
    height: 32,
    backgroundColor: theme.colors.lightGray,
  },

  // 記録ボタン
  submitButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing[2],
    backgroundColor: theme.colors.primary,
    borderRadius: 5,
    paddingVertical: theme.spacing[3],
    marginHorizontal: theme.spacing[5],
    marginBottom: theme.spacing[5],
  },
  buttonDisabled: {
    backgroundColor: theme.colors.lightGray,
  },
  submitButtonText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.white,
  },

  // 栄養素カード
  pfcRow: {
    flexDirection: "row",
    gap: theme.spacing[2],
    marginBottom: theme.spacing[4],
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

  // 食品追加・編集シート
  sheetContent: {
    padding: theme.spacing[5],
    paddingBottom: theme.spacing[6],
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing[4],
  },
  sheetTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: "bold",
    color: theme.colors.dark,
  },
  sheetDeleteButton: {
    borderWidth: 1,
    borderColor: theme.colors.error,
    backgroundColor: theme.colors.background.light,
    borderRadius: 8,
    paddingVertical: theme.spacing[3],
    alignItems: "center",
    marginBottom: theme.spacing[3],
  },
  sheetDeleteButtonText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.error,
    fontWeight: "bold",
  },
  sheetConfirmButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: theme.spacing[3],
    alignItems: "center",
  },
  sheetConfirmButtonText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.white,
    fontWeight: "bold",
  },
});
