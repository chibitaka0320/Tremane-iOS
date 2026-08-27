import Indicator from "@/components/common/Indicator";
import TrainingItem from "@/components/training/TrainingItem";
import { useAlert } from "@/context/AlertContext";
import { useCalendar } from "@/context/CalendarContext";
import * as trainingService from "@/service/trainingService";
import theme from "@/styles/theme";
import { DailyTraining } from "@/types/dto/trainingDto";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// トレーニング一覧画面
export default function TrainingScreen() {
  const { selectedDate } = useCalendar(); // カレンダーで選択された日付
  const { setError } = useAlert();

  const [dailyTraining, setDailyTraining] = useState<DailyTraining>(); // トレーニングデータ

  const [isLoading, setLoading] = useState(true); // ローディング判定
  const [isRefreshing, setRefreshing] = useState(false); // リフレッシュ判定

  // 選択された日付のトレーニングデータを取得
  const fetchDailyTraining = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const fetchedDailyTraining = await trainingService.getTrainingByDate(
        selectedDate
      );
      if (fetchedDailyTraining) {
        setDailyTraining(fetchedDailyTraining);
      }
    } catch (error) {
      // TODO: エラーハンドリングのルールを検討
      console.error(`トレーニングデータ取得でエラー発生：${error}`);
      if (!dailyTraining) {
        // TODO: ログイン画面に戻さなくて良いかしばらく検証
        // setError("時間をおいて再度アプリを起動してください", () => {
        //   router.replace("/(auth)/signIn");
        // });

        setError("トレーニングデータの読み込みに失敗しました。");
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
    fetchDailyTraining(false);
  }, []);

  // 画面表示毎
  useFocusEffect(
    useCallback(() => {
      fetchDailyTraining(true);
    }, [selectedDate])
  );

  // 1. 初期ロード（キャッシュなし）
  if (isLoading && !dailyTraining) {
    return <Indicator />;
  }

  // 2. データ取得失敗（キャッシュなし）
  if (!dailyTraining) {
    // TODO: UIは別途検討
    return <Text>データを読み込めませんでした</Text>;
  }

  // 3. データはあるが空
  if (dailyTraining.bodyParts.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.nonDataContainer}>
          <View style={styles.iconWrapper}>
            <MaterialCommunityIcons
              name="notebook-outline"
              size={64}
              color={theme.colors.border.dark}
            />
            <View style={styles.iconBadge}>
              <Ionicons name="add" size={16} color={theme.colors.white} />
            </View>
          </View>
          <Text style={styles.text}>まだトレーニング記録がありません</Text>
          <Text style={styles.subText}>
            今日のトレーニングを記録して{"\n"}進捗をチェックしましょう！
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() =>
              router.push({
                pathname: "/(main)/(add)/training/add",
                params: { date: selectedDate },
              })
            }
          >
            <Ionicons name="add" size={18} color={theme.colors.secondary} />
            <Text style={styles.addButtonText}>トレーニングを追加</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 4. データあり
  return (
    <View style={styles.container}>
      <FlatList
        data={dailyTraining.bodyParts}
        style={styles.trainingContainer}
        renderItem={({ item }) => (
          <TrainingItem bodyPart={item} date={selectedDate} />
        )}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.bodyPartId.toString()}
        ListFooterComponent={<View style={styles.trainingItemFooter}></View>}
        refreshing={isRefreshing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.dark,
  },
  nonDataContainer: {
    padding: theme.spacing[5],
    borderRadius: 8,
    width: "90%",
    alignSelf: "center",
    backgroundColor: theme.colors.background.light,
    alignItems: "center",
    marginVertical: theme.spacing[5],
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
  trainingContainer: {
    paddingVertical: theme.spacing[5],
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
  trainingItemFooter: {
    height: theme.spacing[7],
  },
});
