import Indicator from "@/components/common/Indicator";
import { bodyPartImages } from "@/constants/bodyPartImages";
import { auth } from "@/lib/firebaseConfig";
import { validateReps, validateWeight } from "@/lib/validators";
import * as trainingService from "@/service/trainingService";
import theme from "@/styles/theme";
import { parseISO } from "date-fns";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function TrainingEditScreen() {
  const { trainingId, setNumber, partsId, partName, exerciseName } =
    useLocalSearchParams<{
      trainingId: string;
      setNumber: string;
      partsId: string;
      partName: string;
      exerciseName: string;
    }>();

  const [isLoading, setLoading] = useState(true);
  const [isSubmitting, setSubmitting] = useState(false);

  const [date, setDate] = useState<string>("");
  const [exerciseId, setExerciseId] = useState("");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");

  // トレーニング詳細取得
  useEffect(() => {
    const init = async () => {
      try {
        const detail = await trainingService.getTrainingDetail(trainingId);
        if (detail) {
          setDate(detail.date);
          setExerciseId(detail.exerciseId);
          setWeight(String(detail.weight));
          setReps(String(detail.reps));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [trainingId]);

  const isInputValid = validateWeight(weight) && validateReps(reps);

  // トレーニング更新処理
  const onUpdateTraining = async () => {
    if (!isInputValid || auth.currentUser === null) return;

    setSubmitting(true);
    try {
      await trainingService.upsertTraining(
        trainingId,
        parseISO(date),
        auth.currentUser.uid,
        exerciseId,
        parseFloat(weight),
        parseInt(reps)
      );
      router.back();
    } catch (error) {
      console.error("トレーニング更新失敗：" + error);
      Alert.alert("トレーニングの更新に失敗しました。");
    } finally {
      setSubmitting(false);
    }
  };

  // トレーニング削除処理
  const onDeleteTraining = async () => {
    Alert.alert("", "データを削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除する",
        style: "destructive",
        onPress: async () => {
          setSubmitting(true);
          try {
            await trainingService.deleteTraining(trainingId);
            router.back();
          } catch (error) {
            console.error("トレーニング削除失敗：" + error);
            Alert.alert("トレーニングの削除に失敗しました。");
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
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

          <View style={styles.setNumberBadgeWrapper}>
            <Text style={styles.setNumberBadgeText}>
              {setNumber}セット目を編集
            </Text>
          </View>

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
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.updateButton,
              (!isInputValid || isSubmitting) && styles.buttonDisabled,
            ]}
            onPress={onUpdateTraining}
            disabled={!isInputValid || isSubmitting}
          >
            <Text style={styles.buttonText}>更新</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.deleteButton, isSubmitting && styles.buttonDisabled]}
            onPress={onDeleteTraining}
            disabled={isSubmitting}
          >
            <Text style={styles.buttonText}>削除</Text>
          </TouchableOpacity>
        </View>
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

  // セット番号バッジ
  setNumberBadgeWrapper: {
    marginTop: theme.spacing[2],
    marginBottom: theme.spacing[4],
  },
  setNumberBadgeText: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
    color: theme.colors.secondary,
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

  // 前回の記録
  // フッターボタン
  footer: {
    paddingHorizontal: theme.spacing[5],
    paddingBottom: theme.spacing[5],
  },
  updateButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 5,
    paddingVertical: theme.spacing[3],
    alignItems: "center",
    marginBottom: theme.spacing[3],
  },
  deleteButton: {
    backgroundColor: theme.colors.dark,
    borderRadius: 5,
    paddingVertical: theme.spacing[3],
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: theme.colors.lightGray,
  },
  buttonText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.white,
  },
});
