import Indicator from "@/components/common/Indicator";
import { PFC_LABELS } from "@/constants/pfc";
import { unitOptions } from "@/constants/unitOptions";
import * as eatingService from "@/service/eatingService";
import theme from "@/styles/theme";
import { FoodRecord } from "@/types/dto/eatingDto";
import { Ionicons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// 食品記録詳細画面
export default function EatingDetailScreen() {
  const { eatingId } = useLocalSearchParams<{ eatingId: string }>();

  const [isLoading, setLoading] = useState(true);
  const [food, setFood] = useState<FoodRecord | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await eatingService.getEating(eatingId);
      setFood(res);
    } catch (error) {
      console.error("食品記録詳細取得失敗：" + error);
    } finally {
      setLoading(false);
    }
  }, [eatingId]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  const onEdit = () => {
    router.push({
      pathname: "/(main)/(edit)/eating/edit",
      params: { eatingId },
    });
  };

  const onDelete = () => {
    Alert.alert("", "この食品記録を削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除する",
        style: "destructive",
        onPress: async () => {
          try {
            await eatingService.deleteEating(eatingId);
            router.back();
          } catch (error) {
            console.error("食品記録削除失敗：" + error);
            Alert.alert("食品記録の削除に失敗しました。");
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return <Indicator />;
  }

  if (!food) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>食品記録が見つかりませんでした</Text>
      </View>
    );
  }

  const unitLabel = unitOptions.find((o) => o.value === food.unit)?.label;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerCard}>
          <Text style={styles.foodName}>{food.name}</Text>
          <View style={styles.dateRow}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={theme.colors.font.gray}
            />
            <Text style={styles.dateText}>
              {format(parseISO(food.date), "yyyy年M月d日（E）", {
                locale: ja,
              })}
            </Text>
          </View>
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>カロリー</Text>
            <Text style={styles.statValue}>{food.calories}</Text>
            <Text style={styles.statUnit}>kcal</Text>
          </View>
          {PFC_LABELS.map(({ key, label }) => (
            <React.Fragment key={key}>
              <View style={styles.statDivider} />
              <View style={styles.statCol}>
                <Text style={styles.statLabel}>{label}</Text>
                <Text style={styles.statValue}>
                  {food[key as keyof FoodRecord]}
                </Text>
                <Text style={styles.statUnit}>g</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>量</Text>
          <Text
            style={[
              styles.infoValue,
              food.quantity == null && styles.infoValueEmpty,
            ]}
          >
            {food.quantity != null
              ? `${food.quantity} ${unitLabel}`
              : "登録なし"}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <Text style={styles.buttonText}>編集</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Text style={styles.buttonText}>削除</Text>
        </TouchableOpacity>
      </View>
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

  // ヘッダーカード
  headerCard: {
    backgroundColor: theme.colors.background.light,
    borderRadius: 8,
    padding: theme.spacing[4],
    marginBottom: theme.spacing[4],
  },
  foodName: {
    fontSize: theme.fontSize.xl,
    fontWeight: "bold",
    color: theme.colors.dark,
    marginBottom: theme.spacing[1],
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[1],
  },
  dateText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
  },

  // 栄養素カード
  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background.light,
    borderRadius: 8,
    paddingVertical: theme.spacing[4],
    marginBottom: theme.spacing[4],
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

  // 量カード
  infoCard: {
    backgroundColor: theme.colors.background.light,
    borderRadius: 8,
    padding: theme.spacing[4],
    marginBottom: theme.spacing[4],
  },
  infoLabel: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
    color: theme.colors.dark,
    marginBottom: theme.spacing[1],
  },
  infoValue: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.dark,
  },
  infoValueEmpty: {
    color: theme.colors.font.gray,
  },

  // フッターボタン
  footer: {
    paddingHorizontal: theme.spacing[5],
    paddingBottom: theme.spacing[5],
  },
  editButton: {
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
  buttonText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.white,
  },
});
