import Indicator from "@/components/common/Indicator";
import { auth } from "@/lib/firebaseConfig";
import { validateReps, validateWeight } from "@/lib/validators";
import * as trainingService from "@/service/trainingService";
import theme from "@/styles/theme";
import { LastTraining } from "@/types/dto/trainingDto";
import { Ionicons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import uuid from "react-native-uuid";

type PendingSet = {
  localId: string;
  weight: number;
  reps: number;
};

// トレーニング追加画面（セット入力）
export default function TrainingRecordScreen() {
  const { date, partName, exerciseId, exerciseName, fromRecent, fromDetail } =
    useLocalSearchParams<{
      date: string;
      partsId: string;
      partName: string;
      exerciseId: string;
      exerciseName: string;
      fromRecent: string;
      fromDetail?: string;
    }>();

  const [isLoading, setLoading] = useState(true);
  const [isSubmitting, setSubmitting] = useState(false);
  const [lastTraining, setLastTraining] = useState<LastTraining | null>(null);

  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [sets, setSets] = useState<PendingSet[]>([]);

  // 前回の記録取得
  useEffect(() => {
    const init = async () => {
      try {
        const last = await trainingService.getLastTrainingByExerciseId(
          exerciseId
        );
        setLastTraining(last);
        if (last && fromRecent === "true") {
          setWeight(String(last.weight));
          setReps(String(last.reps));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [exerciseId, fromRecent]);

  const isInputValid = validateWeight(weight) && validateReps(reps);

  // セット追加
  const onAddSet = () => {
    if (!isInputValid) return;
    setSets((prev) => [
      ...prev,
      {
        localId: uuid.v4() as string,
        weight: parseFloat(weight),
        reps: parseInt(reps),
      },
    ]);
  };

  // セット削除
  const onDeleteSet = (targetLocalId: string) => {
    setSets((prev) => prev.filter((set) => set.localId !== targetLocalId));
  };

  // トレーニング記録
  const onSubmit = async () => {
    if (sets.length === 0 || auth.currentUser === null) return;

    setSubmitting(true);
    try {
      const userId = auth.currentUser.uid;
      const targetDate = parseISO(date);

      for (const set of sets) {
        await trainingService.upsertTraining(
          uuid.v4() as string,
          targetDate,
          userId,
          exerciseId,
          set.weight,
          set.reps
        );
      }

      if (fromDetail === "true") {
        router.back();
      } else {
        router.dismissAll();
        router.replace("/(main)/(tabs)/(home)/training");
      }
    } catch (error) {
      console.error("トレーニング記録失敗：" + error);
      Alert.alert("トレーニングの記録に失敗しました。");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return <Indicator />;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>{exerciseName}</Text>

          {lastTraining && (
            <TouchableOpacity
              style={styles.lastRecordCard}
              onPress={() => {
                setWeight(String(lastTraining.weight));
                setReps(String(lastTraining.reps));
              }}
            >
              <Text style={styles.lastRecordLabel}>前回の記録</Text>
              <View style={styles.lastRecordRow}>
                <Text style={styles.lastRecordValue}>
                  {lastTraining.weight}
                  <Text style={styles.lastRecordUnit}> kg</Text>
                  <Text style={styles.lastRecordUnit}>  ×  </Text>
                  {lastTraining.reps}
                  <Text style={styles.lastRecordUnit}> 回</Text>
                </Text>
                <Text style={styles.lastRecordDate}>
                  {format(parseISO(lastTraining.date), "yyyy/MM/dd")}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          <View style={styles.inputRow}>
            <View style={styles.inputItem}>
              <Text style={styles.inputLabel}>重量</Text>
              <View style={styles.inputRowWithUnit}>
                <View style={styles.inputBox}>
                  <TextInput
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="numeric"
                    style={styles.inputValueText}
                  />
                </View>
                <Text style={styles.unitText}>kg</Text>
              </View>
            </View>
            <View style={styles.inputItem}>
              <Text style={styles.inputLabel}>回数</Text>
              <View style={styles.inputRowWithUnit}>
                <View style={styles.inputBox}>
                  <TextInput
                    value={reps}
                    onChangeText={setReps}
                    keyboardType="numeric"
                    style={styles.inputValueText}
                  />
                </View>
                <Text style={styles.unitText}>回</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.addSetButton,
              !isInputValid && styles.addSetButtonDisabled,
            ]}
            onPress={onAddSet}
            disabled={!isInputValid}
          >
            <Ionicons name="add" size={18} color={theme.colors.secondary} />
            <Text style={styles.addSetButtonText}>セットを追加</Text>
          </TouchableOpacity>

          {sets.length > 0 && (
            <>
              <View style={styles.setListHeader}>
                <Text style={styles.sectionLabel}>セット一覧</Text>
                <Text style={styles.setCount}>{sets.length}セット</Text>
              </View>
              {sets.map((set, index) => (
                <View key={set.localId} style={styles.setRow}>
                  <Text style={styles.setIndex}>{index + 1}セット目</Text>
                  <View style={styles.setRowRight}>
                    <Text style={styles.setValue}>
                      {set.weight}kg × {set.reps}回
                    </Text>
                    <TouchableOpacity onPress={() => onDeleteSet(set.localId)}>
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color={theme.colors.font.gray}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </>
          )}
        </ScrollView>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (sets.length === 0 || isSubmitting) && styles.submitButtonDisabled,
          ]}
          onPress={onSubmit}
          disabled={sets.length === 0 || isSubmitting}
        >
          <Text style={styles.submitButtonText}>トレーニングを記録</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
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
    paddingTop: theme.spacing[3],
    paddingBottom: theme.spacing[6],
  },
  title: {
    marginTop: theme.spacing[3],
    fontSize: theme.fontSizes.large,
    fontWeight: "bold",
    color: theme.colors.dark,
    marginBottom: theme.spacing[3],
  },

  // 前回の記録
  lastRecordCard: {
    backgroundColor: theme.colors.background.light,
    borderRadius: 8,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    marginBottom: theme.spacing[5],
  },
  lastRecordLabel: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
    marginBottom: theme.spacing[1],
  },
  lastRecordRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  lastRecordValue: {
    fontSize: theme.fontSizes.large,
    fontWeight: "bold",
    color: theme.colors.secondary,
  },
  lastRecordUnit: {
    fontSize: theme.fontSizes.small,
    fontWeight: "normal",
    color: theme.colors.dark,
  },
  lastRecordDate: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
  },

  // 重量・回数入力
  inputRow: {
    flexDirection: "row",
    gap: theme.spacing[4],
    marginBottom: theme.spacing[4],
  },
  inputItem: {
    flex: 1,
  },
  inputLabel: {
    fontSize: theme.fontSizes.small,
    fontWeight: "bold",
    marginBottom: theme.spacing[2],
  },
  inputRowWithUnit: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
  },
  inputBox: {
    flex: 1,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 8,
    backgroundColor: theme.colors.background.light,
    paddingHorizontal: theme.spacing[3],
    height: 48,
  },
  inputValueText: {
    flex: 1,
    padding: 0,
    fontSize: theme.fontSize.xl,
    fontWeight: "bold",
  },
  unitText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.font.gray,
  },

  // セット追加ボタン
  addSetButton: {
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
  addSetButtonDisabled: {
    borderColor: theme.colors.lightGray,
  },
  addSetButtonText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.secondary,
    fontWeight: "bold",
  },

  // セット一覧
  setListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing[3],
  },
  sectionLabel: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
    color: theme.colors.dark,
  },
  setCount: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
  },
  setRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.background.light,
    borderRadius: 8,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    marginBottom: theme.spacing[2],
  },
  setIndex: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.dark,
  },
  setRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[4],
  },
  setValue: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
    color: theme.colors.dark,
  },

  // 記録ボタン
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 5,
    paddingVertical: theme.spacing[3],
    alignItems: "center",
    marginHorizontal: theme.spacing[5],
    marginBottom: theme.spacing[5],
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.lightGray,
  },
  submitButtonText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.white,
  },
});
