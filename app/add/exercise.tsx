import CustomTextInput from "@/components/common/CustomTextInput";
import Indicator from "@/components/common/Indicator";
import { apiRequestWithRefresh } from "@/lib/apiClient";
import { auth } from "@/lib/firebaseConfig";
import {
  insertMyExerciseDao,
  updateMyExerciseDao,
} from "@/localDb/dao/myExerciseDao";
import { getBodyPartsWithExercises } from "@/localDb/service/bodyPartService";
import theme from "@/styles/theme";
import { selectLabel } from "@/types/common";
import { Exercise } from "@/types/localDb";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";

export default function ExerciseScreen() {
  const [bodyParts, setBodyParts] = useState("");
  const [exercise, setExercise] = useState("");

  const [bodyPartOptions, setBodyPartOptions] = useState<selectLabel[]>([]);

  const [isLoading, setLoading] = useState(false);
  const [isDisabled, setDisabled] = useState(true);

  const handleBodyPartChange = useCallback(
    (value: string) => {
      if (value !== bodyParts) {
        setBodyParts(value);
      }
    },
    [bodyParts]
  );

  // 部位情報取得
  useEffect(() => {
    const fetchBodyParts = async () => {
      const res = await getBodyPartsWithExercises();
      if (res) {
        setBodyPartOptions(
          res.map((part) => ({
            label: part.name,
            value: String(part.partsId),
          }))
        );
      }
    };
    fetchBodyParts();
  }, []);

  // ボタン活性・非活性
  useEffect(() => {
    if (bodyParts && exercise) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [bodyParts, exercise]);

  // 種目追加
  const addExercise = async () => {
    setLoading(true);

    if (auth.currentUser === null) return;

    const exercises: Exercise[] = [
      {
        exerciseId: 0,
        partsId: Number(bodyParts),
        name: exercise,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    let insertedIds: number[] = [];

    try {
      const result = await insertMyExerciseDao(exercises, 0, 0);
      if (result) {
        insertedIds = result;
      }
    } catch (error) {
      console.error(error);
    } finally {
      insertedIds.map((id) => {
        router.back();
        setLoading(false);
      });
    }

    if (insertedIds.length === 1) {
      exercises[0].exerciseId = insertedIds[0];

      try {
        const res = await apiRequestWithRefresh(
          "/exercise/myself",
          "POST",
          exercises
        );
        if (res?.ok) {
          await updateMyExerciseDao(exercises, 1, 0);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (isLoading) {
    return <Indicator />;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.item}>
          <Text style={styles.label}>部位</Text>
          <RNPickerSelect
            onValueChange={handleBodyPartChange}
            items={bodyPartOptions}
            value={bodyParts}
            placeholder={{ label: "選択してください", value: "" }}
            style={pickerSelectStyles}
          />
        </View>
        <View style={styles.item}>
          <Text style={styles.label}>種目名</Text>
          <CustomTextInput onChangeText={setExercise} value={exercise} />
        </View>

        <TouchableOpacity
          style={[styles.button, isDisabled && styles.buttonDisabled]}
          onPress={addExercise}
          disabled={isDisabled}
        >
          <Text style={styles.buttonText}>種目を追加</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.lightGray,
    paddingTop: theme.spacing[5],
    paddingHorizontal: theme.spacing[5],
  },

  // インプットアイテム
  item: {
    marginBottom: theme.spacing[4],
  },
  label: {
    marginBottom: theme.spacing[1],
  },
  inputValue: {
    justifyContent: "center",
    paddingHorizontal: theme.spacing[3],
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
    backgroundColor: theme.colors.background.light,
    borderRadius: 5,
    height: 48,
  },
  inputValueText: {
    fontSize: theme.fontSizes.medium,
  },

  // 通常ボタン
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: 5,
    paddingVertical: theme.spacing[3],
    alignItems: "center",
    marginVertical: theme.spacing[3],
    color: theme.colors.white,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.lightGray,
  },
  buttonText: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.white,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: styles.inputValue,
  inputIOSContainer: {
    pointerEvents: "none",
  },
});
