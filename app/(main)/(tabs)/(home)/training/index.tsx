import Indicator from "@/components/common/Indicator";
import TrainingItem from "@/components/training/TrainingItem";
import { useAlert } from "@/context/AlertContext";
import { useCalendar } from "@/context/CalendarContext";
import * as trainingRepository from "@/localDb/repository/trainingRepository";
import theme from "@/styles/theme";
import { DailyTraining } from "@/types/dto/trainingDto";
import { MaterialIcons } from "@expo/vector-icons";
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

  const [dailyTraining, setDailyTraining] = useState<DailyTraining>();

  const [isFetching, setFetching] = useState(true);
  const [isRefreshing, setRefreshing] = useState(false);

  const fetchTrainingData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setFetching(true);
    }

    try {
      const data = await trainingRepository.getTrainingByDate(selectedDate);
      if (data != null) {
        setDailyTraining(data);
      }
    } catch (e) {
      console.error(e);
      setError("時間をおいて再度アプリを起動してください", () => {
        router.replace("/(auth)/signIn");
      });
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setFetching(false);
      }
    }
  };

  useEffect(() => {
    fetchTrainingData(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTrainingData(true);
    }, [selectedDate])
  );

  if (isFetching) {
    return <Indicator />;
  }

  return (
    <View style={styles.container}>
      {dailyTraining?.bodyParts.length === 0 ? (
        <TouchableOpacity style={styles.nonDataContainer}>
          <MaterialIcons name="note-add" size={60} color="#ccc" />
          <Text style={styles.text}>データがありません</Text>
          <Text style={styles.subText}>トレーニングを追加しましょう</Text>
        </TouchableOpacity>
      ) : (
        <FlatList
          data={dailyTraining?.bodyParts}
          style={styles.trainingContainer}
          renderItem={({ item }) => <TrainingItem bodyPart={item} />}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.name}
          ListFooterComponent={<View style={styles.trainingItemFooter}></View>}
          refreshing={isRefreshing}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.main,
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
