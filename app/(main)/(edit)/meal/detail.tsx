import Indicator from "@/components/common/Indicator";
import EatingRow from "@/components/eating/EatingRow";
import { PFC_LABELS } from "@/constants/pfc";
import * as mealService from "@/service/mealService";
import theme from "@/styles/theme";
import { MealDetail } from "@/types/dto/eatingDto";
import { Ionicons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// 食事記録詳細画面（内包する食品一覧・合計値・食品追加・食事記録削除）
export default function MealDetailScreen() {
  const { mealId } = useLocalSearchParams<{ mealId: string }>();

  const [isLoading, setLoading] = useState(true);
  const [meal, setMeal] = useState<MealDetail | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await mealService.getMealDetail(mealId);
      setMeal(res);
    } catch (error) {
      console.error("食事記録詳細取得失敗：" + error);
    } finally {
      setLoading(false);
    }
  }, [mealId]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  const onAddFood = () => {
    router.push({
      pathname: "/(main)/(add)/eating/add",
      params: { mealId },
    });
  };

  const onDeleteMeal = () => {
    Alert.alert(
      "",
      "この食事記録を削除しますか？\n含まれる食品もすべて削除されます。",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除する",
          style: "destructive",
          onPress: async () => {
            try {
              await mealService.deleteMeal(mealId);
              router.back();
            } catch (error) {
              console.error("食事記録削除失敗：" + error);
              Alert.alert("食事記録の削除に失敗しました。");
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return <Indicator />;
  }

  if (!meal) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>食事記録が見つかりませんでした</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerCard}>
          <Text style={styles.mealName}>{meal.name}</Text>
          <Text style={styles.mealDate}>
            {format(parseISO(meal.date), "yyyy年M月d日（E）", {
              locale: ja,
            })}
          </Text>
        </View>

        <View style={styles.statsCard}>
          <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>
            合計
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>カロリー</Text>
              <Text style={styles.statValue}>
                {meal.total.calories.toLocaleString()}
              </Text>
              <Text style={styles.statUnit}>kcal</Text>
            </View>
            {PFC_LABELS.map(({ key, label }) => (
              <React.Fragment key={key}>
                <View style={styles.statDivider} />
                <View style={styles.statCol}>
                  <Text style={styles.statLabel}>{label}</Text>
                  <Text style={styles.statValue}>
                    {meal.total[key as keyof typeof meal.total]}
                  </Text>
                  <Text style={styles.statUnit}>g</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>

        <View style={styles.foodListSection}>
          <View style={styles.foodListHeader}>
            <Text style={styles.sectionLabel}>
              食品（{meal.foods.length}件）
            </Text>
            <TouchableOpacity style={styles.addFoodButton} onPress={onAddFood}>
              <Ionicons name="add" size={16} color={theme.colors.secondary} />
              <Text style={styles.addFoodButtonText}>食品を追加</Text>
            </TouchableOpacity>
          </View>
          {meal.foods.length === 0 ? (
            <Text style={styles.emptyFoodText}>
              まだ食品が登録されていません
            </Text>
          ) : (
            <>
              <View style={styles.row}>
                <Text style={styles.eating}>食べ物</Text>
                <Text style={styles.calories}>カロリー</Text>
                {PFC_LABELS.map(({ key, label }) => (
                  <Text style={styles.pfc} key={key}>
                    {label}
                  </Text>
                ))}
              </View>
              <View style={styles.border} />
              <FlatList
                data={meal.foods}
                keyExtractor={(item) => item.eatingId}
                renderItem={({ item }) => <EatingRow meal={item} />}
                scrollEnabled={false}
              />
            </>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.deleteButton} onPress={onDeleteMeal}>
        <Text style={styles.deleteButtonText}>この食事記録を削除</Text>
      </TouchableOpacity>
    </View>
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

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
  },

  sectionLabel: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
    color: theme.colors.dark,
  },
  sectionLabelSpaced: {
    marginBottom: theme.spacing[2],
  },

  // ヘッダーカード
  headerCard: {
    backgroundColor: theme.colors.background.light,
    borderRadius: 8,
    padding: theme.spacing[4],
    marginBottom: theme.spacing[4],
  },
  mealName: {
    fontSize: theme.fontSize.xl,
    fontWeight: "bold",
    color: theme.colors.dark,
    marginBottom: theme.spacing[1],
  },
  mealDate: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
  },

  // 合計カード
  statsCard: {
    backgroundColor: theme.colors.background.light,
    borderRadius: 8,
    padding: theme.spacing[4],
    marginBottom: theme.spacing[4],
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statCol: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
    marginBottom: theme.spacing[1],
  },
  statValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: "bold",
    color: theme.colors.dark,
  },
  statUnit: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.lightGray,
  },

  // 食品一覧
  foodListSection: {
    backgroundColor: theme.colors.background.light,
    borderRadius: 8,
    padding: theme.spacing[4],
  },
  foodListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing[3],
  },
  addFoodButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[1],
  },
  addFoodButtonText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.secondary,
    fontWeight: "bold",
  },
  emptyFoodText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
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

  // 削除ボタン
  deleteButton: {
    backgroundColor: theme.colors.dark,
    borderRadius: 5,
    paddingVertical: theme.spacing[3],
    alignItems: "center",
    marginHorizontal: theme.spacing[5],
    marginBottom: theme.spacing[5],
  },
  deleteButtonText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.white,
  },
});
