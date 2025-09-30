import Indicator from "@/components/common/Indicator";
import { partsColors } from "@/styles/partsColor";
import theme from "@/styles/theme";
import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, RefreshControl } from "react-native";
import * as timelineService from "@/service/timelineService";
import { ApiError } from "@/lib/error";
import { TrainingTimeline } from "@/types/dto/friendDto";

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
          <Text style={styles.userName}>{item.nickname}</Text>
          <Text style={styles.recordDatetime}>{item.date.toString()}</Text>
          <View style={styles.bodyPartsItem}>
            {item.bodyParts.map((parts, idx) => (
              <Text
                style={[
                  styles.item,
                  { backgroundColor: partsColors[Number(parts.partsId)] },
                ]}
                key={idx}
              >
                {parts.bodyPartsName}
              </Text>
            ))}
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
    borderRadius: 4,
    padding: theme.spacing[3],
    marginBottom: theme.spacing[3],
  },
  userName: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
    marginBottom: theme.spacing[1],
  },
  recordDatetime: {
    color: theme.colors.font.gray,
  },
  bodyPartsItem: {
    marginTop: theme.spacing[2],
    flexDirection: "row",
    flexWrap: "wrap",
  },
  item: {
    color: theme.colors.white,
    fontWeight: "bold",
    width: 50,
    borderRadius: 4,
    textAlign: "center",
    marginHorizontal: theme.spacing[2],
    marginVertical: theme.spacing[2],
    paddingVertical: theme.spacing[2],
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
