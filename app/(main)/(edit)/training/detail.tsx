import Indicator from "@/components/common/Indicator";
import { bodyPartImages } from "@/constants/bodyPartImages";
import * as trainingService from "@/service/trainingService";
import theme from "@/styles/theme";
import { PastTraining, Training } from "@/types/dto/trainingDto";
import { Ionicons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const PAST_TRAINING_LIMIT = 5;

// トレーニング詳細画面（種目別・日別のセット一覧）
export default function TrainingDetailScreen() {
  const { date, partsId, partName, exerciseId, exerciseName } =
    useLocalSearchParams<{
      date: string;
      partsId: string;
      partName: string;
      exerciseId: string;
      exerciseName: string;
    }>();

  const [isLoading, setLoading] = useState(true);
  const [todaysSets, setTodaysSets] = useState<Training[]>([]);
  const [pastTrainings, setPastTrainings] = useState<PastTraining[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [sets, past] = await Promise.all([
        trainingService.getTrainingsByExerciseAndDate(exerciseId, date),
        trainingService.getPastTrainingsByExerciseId(
          exerciseId,
          date,
          PAST_TRAINING_LIMIT
        ),
      ]);
      setTodaysSets(sets);
      setPastTrainings(past);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [exerciseId, date]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onPressSet = (trainingId: string, setNumber: number) => {
    router.push({
      pathname: "/(main)/(edit)/training/edit",
      params: {
        trainingId,
        setNumber: String(setNumber),
        partsId,
        partName,
        exerciseName,
      },
    });
  };

  const onDeleteSet = (trainingId: string) => {
    Alert.alert("", "データを削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除する",
        style: "destructive",
        onPress: async () => {
          try {
            await trainingService.deleteTraining(trainingId);
            fetchData();
          } catch (error) {
            console.error("トレーニング削除失敗：" + error);
            Alert.alert("トレーニングの削除に失敗しました。");
          }
        },
      },
    ]);
  };

  const onAddSet = () => {
    router.push({
      pathname: "/(main)/(add)/training/record",
      params: {
        date,
        partsId,
        partName,
        exerciseId,
        exerciseName,
        fromRecent: "false",
        fromDetail: "true",
      },
    });
  };

  if (isLoading) {
    return <Indicator />;
  }

  const addSetButton = (
    <TouchableOpacity style={styles.addSetButton} onPress={onAddSet}>
      <Ionicons name="add" size={18} color={theme.colors.secondary} />
      <Text style={styles.addSetButtonText}>セットを追加</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.exerciseCard}>
          <Image
            source={bodyPartImages[Number(partsId)]}
            style={styles.exerciseImage}
            resizeMode="contain"
          />
          <View style={styles.exerciseTextArea}>
            <Text style={styles.exerciseName}>{exerciseName}</Text>
            <Text style={styles.partName}>{partName}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>
          今回の記録（{format(parseISO(date), "yyyy/MM/dd")}）
        </Text>
        {todaysSets.length > 0 ? (
          <>
            <View style={styles.table}>
              <View style={styles.tableHeaderRow}>
                <View style={styles.setCell}>
                  <Text style={styles.tableHeaderCell}>SET</Text>
                </View>
                <Text style={[styles.tableHeaderCell, styles.weightCell]}>
                  重量(kg)
                </Text>
                <Text style={[styles.tableHeaderCell, styles.valueCell]}>
                  回数(回)
                </Text>
                <View style={styles.actionCell} />
              </View>
              {todaysSets.map((set, index) => (
                <TouchableOpacity
                  key={set.trainingId}
                  style={styles.tableRow}
                  onPress={() => onPressSet(set.trainingId, index + 1)}
                >
                  <View style={styles.setCell}>
                    <Text style={[styles.tableCell, styles.setNumberText]}>
                      {index + 1}
                    </Text>
                  </View>
                  <Text style={[styles.tableCell, styles.weightCell]}>
                    {set.weight}
                  </Text>
                  <Text style={[styles.tableCell, styles.valueCell]}>
                    {set.reps}
                  </Text>
                  <TouchableOpacity
                    style={styles.actionCell}
                    onPress={() => onDeleteSet(set.trainingId)}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color={theme.colors.font.gray}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
            {addSetButton}
          </>
        ) : (
          <View style={styles.emptySetsCard}>
            <View style={styles.emptySetsIconCircle}>
              <Ionicons
                name="clipboard-outline"
                size={32}
                color={theme.colors.secondary}
              />
            </View>
            <Text style={styles.emptySetsText}>まだセットがありません</Text>
            <Text style={styles.emptySetsSubText}>
              セットを追加して記録を始めましょう
            </Text>
            {addSetButton}
          </View>
        )}

        <Text style={styles.sectionLabel}>過去の記録（5回）</Text>
        {pastTrainings.length === 0 ? (
          <Text style={styles.noPastRecordText}>過去の記録はありません</Text>
        ) : (
          pastTrainings.map((past) => (
            <View key={past.date} style={styles.pastRecordCard}>
              <Text style={styles.pastRecordDate}>
                {format(parseISO(past.date), "yyyy/MM/dd")}
              </Text>
              <View style={styles.pastRecordSets}>
                {past.sets.map((set, index) => (
                  <Text key={index} style={styles.pastRecordValue}>
                    　{set.weight} kg   ×   {set.reps} 回
                  </Text>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
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

  // 種目カード
  exerciseCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[3],
    paddingVertical: theme.spacing[1],
    marginBottom: theme.spacing[5],
  },
  exerciseImage: {
    width: 64,
    height: 64,
  },
  exerciseTextArea: {
    flex: 1,
  },
  exerciseName: {
    flexShrink: 1,
    fontSize: theme.fontSizes.large,
    fontWeight: "bold",
    color: theme.colors.dark,
  },
  partName: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
  },

  sectionLabel: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
    color: theme.colors.dark,
    marginBottom: theme.spacing[2],
  },

  // 今回の記録テーブル
  table: {
    backgroundColor: theme.colors.background.light,
    borderRadius: 8,
    marginBottom: theme.spacing[4],
    overflow: "hidden",
    borderColor: theme.colors.lightGray,
    borderWidth: 0.5,
  },
  tableHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background.lightGray,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
  },
  tableHeaderCell: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[3],
  },
  tableCell: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.dark,
  },
  setCell: {
    flex: 1,
    alignItems: "center",
  },
  setNumberText: {
    fontWeight: "bold",
  },
  valueCell: {
    flex: 1,
    textAlign: "center",
  },
  weightCell: {
    flex: 1.2,
    textAlign: "center",
  },
  actionCell: {
    width: 36,
    alignItems: "center",
  },

  // セットなし時の空状態
  emptySetsCard: {
    alignItems: "center",
    backgroundColor: theme.colors.background.light,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: theme.colors.lightGray,
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[4],
    marginBottom: theme.spacing[4],
  },
  emptySetsIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.background.lightGray,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing[3],
  },
  emptySetsText: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
    color: theme.colors.dark,
    marginBottom: theme.spacing[1],
  },
  emptySetsSubText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
    marginBottom: theme.spacing[4],
  },

  // セット追加ボタン
  addSetButton: {
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing[1],
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    borderRadius: 8,
    paddingVertical: theme.spacing[3],
    marginBottom: theme.spacing[5],
  },
  addSetButtonText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.secondary,
    fontWeight: "bold",
  },

  // 過去の記録
  noPastRecordText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
  },
  pastRecordCard: {
    flexDirection: "row",
    gap: theme.spacing[5],
    paddingHorizontal: theme.spacing[2],
    paddingVertical: theme.spacing[3],
    borderTopColor: theme.colors.lightGray,
    borderTopWidth: 0.5,
  },
  pastRecordDate: {
    fontSize: theme.fontSizes.small,
    lineHeight: 20,
    color: theme.colors.font.gray,
  },
  pastRecordSets: {
    alignItems: "stretch",
  },
  pastRecordValue: {
    fontSize: theme.fontSizes.medium,
    lineHeight: 20,
    color: theme.colors.dark,
    textAlign: "right",
  },
});
