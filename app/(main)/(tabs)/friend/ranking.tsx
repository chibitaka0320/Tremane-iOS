import Indicator from "@/components/common/Indicator";
import { apiRequestWithRefresh } from "@/lib/apiClient";
import theme from "@/styles/theme";
import { TrainingRankingResponse } from "@/types/api";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function RankingScreen() {
  const [rankingList, setRankingList] = useState<TrainingRankingResponse[]>();

  const [isLoading, setLoading] = useState(false);

  const getRanking = async () => {
    setLoading(true);
    try {
      const res = await apiRequestWithRefresh(`/friends/ranking`);

      if (res?.ok) {
        const data: TrainingRankingResponse[] = await res.json();
        setRankingList(data);
      } else {
        console.log(res);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  // useFocusEffect(
  //   useCallback(() => {
  //     getRanking();
  //   }, [])
  // );

  useEffect(() => {
    getRanking();
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
                <Text style={styles.count}>{ranking.trainingCounts}</Text>
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
