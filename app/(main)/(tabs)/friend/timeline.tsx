import Indicator from "@/components/common/Indicator";
import theme from "@/styles/theme";
import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, RefreshControl } from "react-native";
import * as timelineService from "@/service/timelineService";
import { ApiError } from "@/lib/error";
import { TrainingTimeline } from "@/types/dto/friendDto";
import {
  differenceInCalendarDays,
  format,
  formatDistanceToNow,
  parseISO,
} from "date-fns";
import { ja } from "date-fns/locale";

// 最終活動日時を「2時間前」「昨日 20:15」「2日前 18:30」のような表記に変換
const formatActivityTime = (isoString: string) => {
  const date = parseISO(isoString);
  const diffDays = differenceInCalendarDays(new Date(), date);

  if (diffDays <= 0) {
    return formatDistanceToNow(date, { locale: ja, addSuffix: true });
  }
  if (diffDays === 1) {
    return `昨日 ${format(date, "HH:mm")}`;
  }
  return `${diffDays}日前 ${format(date, "HH:mm")}`;
};

export default function FriendScreen() {
  const [timelineList, setTimelineList] = useState<TrainingTimeline[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const getTimeline = async () => {
    setLoading(true);
    try {
      const res = await timelineService.getTrainingTimeline();
      setTimelineList(res);
    } catch (error) {
      if (error instanceof ApiError) {
        console.error(
          `タイムライン取得APIレスポンスエラー：[${error.status}]${error.message}`
        );
      } else {
        console.error(`タイムライン取得に失敗：${error}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getTimeline(); // 最新データ再取得
    setRefreshing(false);
  };

  useEffect(() => {
    getTimeline();
  }, []);

  if (isLoading && timelineList.length === 0) {
    return <Indicator />;
  }

  return (
    <FlatList
      style={styles.container}
      data={timelineList}
      keyExtractor={(_, index) => index.toString()}
      renderItem={({ item }) => (
        <View style={styles.recordContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.userName}>{item.nickname}</Text>
            <Text style={styles.recordDatetime}>
              {formatActivityTime(item.lastActivityAt)}
            </Text>
          </View>

          <View style={styles.bodyPartsItem}>
            {item.bodyParts.map((parts, idx) => (
              <Text style={styles.item} key={idx}>
                {parts.bodyPartsName}
              </Text>
            ))}
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>種目数</Text>
              <Text style={styles.statValue}>{item.exerciseCount} 種目</Text>
            </View>
            {item.estimatedCalories !== null && (
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>消費カロリー</Text>
                <Text style={styles.statValue}>
                  {item.estimatedCalories.toLocaleString()} kcal
                </Text>
              </View>
            )}
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>総負荷量</Text>
              <Text style={styles.statValue}>
                {item.totalVolume.toLocaleString()} kg
              </Text>
            </View>
          </View>
        </View>
      )}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>まだ記録がありません</Text>
        </View>
      }
      contentContainerStyle={{ flexGrow: 1 }}
      alwaysBounceVertical={true}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing[4],
  },
  recordContainer: {
    backgroundColor: theme.colors.background.light,
    borderRadius: 8,
    padding: theme.spacing[4],
    marginBottom: theme.spacing[3],
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
    marginBottom: theme.spacing[3],
  },
  userName: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
    color: theme.colors.dark,
  },
  recordDatetime: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
  },
  bodyPartsItem: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing[2],
    marginBottom: theme.spacing[3],
  },
  item: {
    fontSize: theme.fontSizes.small,
    fontWeight: "bold",
    color: theme.colors.secondary,
    backgroundColor: "rgba(114, 210, 255, 0.15)",
    borderRadius: 12,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
  },
  statsRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: theme.colors.background.lightGray,
    paddingTop: theme.spacing[3],
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
    marginBottom: theme.spacing[1],
  },
  statValue: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
    color: theme.colors.dark,
  },

  // リストが空の時
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
  },
});
