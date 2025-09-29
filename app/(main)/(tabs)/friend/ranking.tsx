import Indicator from "@/components/common/Indicator";
import theme from "@/styles/theme";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import * as rankingService from "@/service/rankingService";
import { TrainingRanking } from "@/types/dto/rankingDto";
import { ApiError } from "@/lib/error";

export default function RankingScreen() {
  const [rankingList, setRankingList] = useState<TrainingRanking[]>();

  const [isLoading, setLoading] = useState(false);

  const getRanking = async () => {
    try {
      const res = await rankingService.getTrainingRankingMonthly();
      setRankingList(res);
    } catch (error) {
      if (error instanceof ApiError) {
        console.error(
          `APIエラー(トレーニングランキング取得)：[${error.status}]${error.message}`
        );
      } else {
        console.error(`トレーニングランキング取得に失敗しました：${error}`);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      getRanking();
    }, [])
  );

  useEffect(() => {
    setLoading(true);
    getRanking();
    setLoading(false);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>今月のトレーニング日数</Text>
      </View>

      {isLoading ? (
        <View style={{ flex: 1 }}>
          <Indicator />
        </View>
      ) : (
        <ScrollView>
          {rankingList?.map((ranking, index) => (
            <View style={styles.listItem} key={index}>
              <View style={styles.itemLeft}>
                <Text style={styles.rank}>{index + 1}</Text>
                <Text style={styles.name}>{ranking.nickname}</Text>
              </View>
              <View style={styles.itemRight}>
                <Text style={styles.count}>{ranking.count}</Text>
                <Text style={styles.unit}>days</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    height: 60,
    backgroundColor: theme.colors.background.light,
    justifyContent: "center",
    alignItems: "center",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.lightGray,
  },
  headerTitle: {
    fontSize: theme.fontSizes.medium,
  },

  listItem: {
    backgroundColor: theme.colors.background.light,
    paddingHorizontal: theme.spacing[4],
    height: 60,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: theme.colors.lightGray,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  rank: {
    fontWeight: "bold",
    fontSize: theme.fontSizes.medium,
    marginRight: theme.spacing[3],
  },
  name: {
    fontSize: theme.fontSizes.medium + 2,
  },

  itemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  count: {
    fontSize: theme.fontSizes.medium + 2,
    marginRight: theme.spacing[2],
  },
  unit: {
    fontSize: theme.fontSizes.medium,
  },
});
