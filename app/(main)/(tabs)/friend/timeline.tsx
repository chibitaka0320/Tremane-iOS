import Indicator from "@/components/common/Indicator";
import { apiRequestWithRefresh } from "@/lib/apiClient";
import { partsColors } from "@/styles/partsColor";
import theme from "@/styles/theme";
import { TimelineTrainingResponse } from "@/types/api";
import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, RefreshControl } from "react-native";

export default function FriendScreen() {
  const [timelineList, setTimelineList] = useState<TimelineTrainingResponse[]>(
    []
  );
  const [isLoading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const getTimeline = async () => {
    setLoading(true);
    try {
      const res = await apiRequestWithRefresh(`/friends/timeline`);
      if (res?.ok) {
        const data: TimelineTrainingResponse[] = await res.json();
        setTimelineList(data);
      } else {
        console.error(res);
      }
    } catch (e) {
      console.error(e);
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
          <Text style={styles.userName}>{item.userId}</Text>
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
});
