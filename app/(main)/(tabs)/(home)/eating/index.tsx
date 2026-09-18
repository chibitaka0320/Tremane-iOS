import Indicator from "@/components/common/Indicator";
import EatingRow from "@/components/eating/EatingRow";
import MealRow from "@/components/eating/MealRow";
import Summary from "@/components/eating/Summary";
import { PFC_LABELS } from "@/constants/pfc";
import { useAlert } from "@/context/AlertContext";
import { useCalendar } from "@/context/CalendarContext";
import * as eatingService from "@/service/eatingService";
import theme from "@/styles/theme";
import { DailyEating } from "@/types/dto/eatingDto";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// 食事一覧画面
export default function EatingScreen() {
  const { selectedDate } = useCalendar(); // カレンダーで選択された日付
  const { setError } = useAlert();

  const [dailyEating, setDailyEating] = useState<DailyEating>(); // 食事データ

  const [isLoading, setLoading] = useState(true); // ローディング判定
  const [isRefreshing, setRefreshing] = useState(false); // リフレッシュ判定

  // 「食事を記録」ボタン押下時の記録方法選択モーダル
  const chooseSheetRef = useRef<BottomSheetModal>(null);

  const renderChooseBackdrop = useCallback(
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

  const onChooseMeal = () => {
    chooseSheetRef.current?.dismiss();
    router.push("/(main)/(add)/meal/add");
  };

  const onChooseFood = () => {
    chooseSheetRef.current?.dismiss();
    router.push("/(main)/(add)/eating/add");
  };

  // 選択された日付の食事データを取得
  const fetchDailyEating = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const fetchedDailyEating =
        await eatingService.getEatingByDate(selectedDate);
      if (fetchedDailyEating) {
        setDailyEating(fetchedDailyEating);
      }
    } catch (error) {
      // TODO: エラーハンドリングのルールを検討
      console.error(error);
      if (!dailyEating) {
        // TODO: ログイン画面に戻さなくて良いかしばらく検証
        // setError("時間をおいて再度アプリを起動してください", () => {
        //   router.replace("/(auth)/signIn");
        // });
        setError("食事データの読み込みに失敗しました。");
      }
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  // 初期表示のみ
  useEffect(() => {
    fetchDailyEating(false);
  }, []);

  // 画面表示毎
  useFocusEffect(
    useCallback(() => {
      fetchDailyEating(true);
    }, [selectedDate]),
  );

  // 1. 初期ロード（キャッシュなし）
  if (isLoading && !dailyEating) {
    return <Indicator />;
  }

  // 2. データ取得失敗（キャッシュなし）
  if (!dailyEating) {
    // TODO: UIは別途検討
    return <Text>データを読み込めませんでした</Text>;
  }

  // 3. データ取得完了
  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <Summary
          total={dailyEating.total}
          goal={dailyEating.goal}
          rate={dailyEating.rate}
        />
        {dailyEating.items.length === 0 ? (
          // データが空
          <View style={styles.nonDataContainer}>
            <View style={styles.iconWrapper}>
              <MaterialCommunityIcons
                name="noodles"
                size={64}
                color={theme.colors.border.dark}
              />
              <View style={styles.iconBadge}>
                <Ionicons name="add" size={16} color={theme.colors.white} />
              </View>
            </View>
            <Text style={styles.text}>まだ食事の記録がありません</Text>
            <Text style={styles.subText}>
              食事を記録してカロリーやPFCを管理しましょう
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => chooseSheetRef.current?.present()}
            >
              <Ionicons name="add" size={18} color={theme.colors.secondary} />
              <Text style={styles.addButtonText}>食事を記録</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // データあり
          <View style={styles.eatingContainer}>
            <View style={styles.row}>
              <Text style={styles.eating}>食べ物</Text>
              <Text style={styles.calories}>カロリー</Text>
              {PFC_LABELS.map(({ key, label }) => (
                <Text style={styles.pfc} key={key}>
                  {label}
                </Text>
              ))}
            </View>
            <View style={styles.border}></View>
            <FlatList
              data={dailyEating.items}
              keyExtractor={(item) =>
                item.type === "food" ? item.food.eatingId : item.meal.mealId
              }
              renderItem={({ item }) =>
                item.type === "food" ? (
                  <EatingRow meal={item.food} />
                ) : (
                  <MealRow
                    meal={item.meal}
                    total={item.total}
                    foodCount={item.foodCount}
                  />
                )
              }
              scrollEnabled={false}
              refreshing={isRefreshing}
            />
          </View>
        )}
      </ScrollView>

      <BottomSheetModal
        ref={chooseSheetRef}
        backdropComponent={renderChooseBackdrop}
      >
        <BottomSheetView style={styles.chooseSheetContent}>
          <Text style={styles.chooseSheetTitle}>記録する内容を選択</Text>
          <TouchableOpacity
            style={styles.chooseMealButton}
            onPress={onChooseMeal}
          >
            <Ionicons name="restaurant" size={18} color={theme.colors.white} />
            <Text style={styles.chooseMealButtonText}>食事を記録</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.chooseFoodButton}
            onPress={onChooseFood}
          >
            <Ionicons name="add" size={18} color={theme.colors.secondary} />
            <Text style={styles.chooseFoodButtonText}>食品を記録</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.dark,
  },
  contentContainer: {
    paddingTop: theme.spacing[5],
    paddingBottom: theme.spacing[7],
  },
  eatingContainer: {
    borderRadius: 8,
    width: "90%",
    alignSelf: "center",
    backgroundColor: theme.colors.background.light,
    marginBottom: theme.spacing[5],
    padding: theme.spacing[3],
  },
  row: {
    flexDirection: "row",
  },
  eating: {
    width: "30%",
    textAlign: "center",
    fontWeight: "bold",
  },
  calories: {
    width: "30%",
    textAlign: "center",
    fontWeight: "bold",
  },
  pfc: {
    width: "13%",
    textAlign: "center",
    fontWeight: "bold",
  },
  border: {
    width: "100%",
    height: 1,
    backgroundColor: theme.colors.black,
    marginVertical: theme.spacing[3],
  },
  nonDataContainer: {
    padding: theme.spacing[4],
    borderRadius: 8,
    width: "90%",
    alignSelf: "center",
    backgroundColor: theme.colors.background.light,
    alignItems: "center",
  },
  iconWrapper: {
    marginBottom: theme.spacing[4],
  },
  iconBadge: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.secondary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.background.light,
  },
  text: {
    fontSize: theme.fontSize.lg,
    fontWeight: "bold",
    color: theme.colors.dark,
    marginBottom: theme.spacing[2],
  },
  subText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.font.gray,
    textAlign: "center",
    marginBottom: theme.spacing[5],
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing[1],
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    borderRadius: 8,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[5],
  },
  addButtonText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.secondary,
    fontWeight: "bold",
  },

  // 記録方法選択モーダル
  chooseSheetContent: {
    paddingHorizontal: theme.spacing[5],
    paddingBottom: theme.spacing[6],
  },
  chooseSheetTitle: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
    color: theme.colors.dark,
    textAlign: "center",
    marginBottom: theme.spacing[4],
  },
  chooseMealButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing[1],
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: theme.spacing[3],
    marginBottom: theme.spacing[3],
  },
  chooseMealButtonText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.white,
    fontWeight: "bold",
  },
  chooseFoodButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing[1],
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    backgroundColor: theme.colors.background.light,
    borderRadius: 8,
    paddingVertical: theme.spacing[3],
  },
  chooseFoodButtonText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.secondary,
    fontWeight: "bold",
  },
});
