import Indicator from "@/components/common/Indicator";
import TrainingItem from "@/components/training/TrainingItem";
import { useAlert } from "@/context/AlertContext";
import { useCalendar } from "@/context/CalendarContext";
import * as trainingService from "@/service/trainingService";
import theme from "@/styles/theme";
import { DailyTraining } from "@/types/dto/trainingDto";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
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
        <TouchableOpacity style={styles.nonDataContainer}>
          <MaterialIcons name="note-add" size={60} color="#ccc" />
          <Text style={styles.text}>データがありません</Text>
          <Text style={styles.subText}>トレーニングを追加しましょう</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 4. データあり
  return (
    <View style={styles.container}>
      <FlatList
        data={dailyTraining.bodyParts}
        style={styles.trainingContainer}
        renderItem={({ item }) => <TrainingItem bodyPart={item} />}
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
  trainingContainer: {
    paddingVertical: theme.spacing[5],
  },
  text: {
    fontSize: theme.fontSizes.large,
    fontWeight: "bold",
    marginVertical: theme.spacing[2],
  },
  subText: {
    fontSize: theme.fontSizes.medium,
  },
  trainingItemFooter: {
    height: theme.spacing[7],
  },
});
