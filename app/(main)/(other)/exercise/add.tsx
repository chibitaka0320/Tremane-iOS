import CustomTextInput from "@/components/common/CustomTextInput";
import Indicator from "@/components/common/Indicator";
import { apiRequestWithRefresh } from "@/lib/apiClient";
import { auth } from "@/lib/firebaseConfig";
import {
  insertMyExerciseDao,
  updateMyExerciseDao,
} from "@/localDb/dao/myExerciseDao";
import theme from "@/styles/theme";
import { selectLabel } from "@/types/common";
import { Exercise } from "@/types/localDb";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import uuid from "react-native-uuid";
import * as bodyPartRepository from "@/localDb/repository/bodyPartRepository";

export default function ExerciseAddScreen() {
  const [bodyParts, setBodyParts] = useState("");
  const [exercise, setExercise] = useState("");
  const [bodyPartsModal, setBodyPartsModal] = useState(false);

  const [bodyPartOptions, setBodyPartOptions] = useState<selectLabel[]>([]);

  const [isLoading, setLoading] = useState(false);
  const [isDisabled, setDisabled] = useState(true);

  const selectedBodyParts =
    bodyPartOptions.find((o) => o.value === bodyParts)?.label ||
    "選択してください";

  // 部位情報取得
  useEffect(() => {
    const fetchBodyParts = async () => {
      const res = await bodyPartRepository.getBodyPartsWithExercises();
      if (res) {
        setBodyPartOptions(
          res.map((part) => ({
            label: part.partName,
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
        exerciseId: uuid.v4(),
        ownerUserId: auth.currentUser.uid,
        partsId: Number(bodyParts),
        name: exercise,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    try {
      const result = await insertMyExerciseDao(exercises, 0, 0);
    } catch (error) {
      console.error(error);
    } finally {
      router.back();
      setLoading(false);
    }

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
  };

  if (isLoading) {
    return <Indicator />;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.item}>
          <Text style={styles.label}>部位</Text>
          <TouchableOpacity
            style={styles.inputValue}
            onPress={() => setBodyPartsModal(true)}
          >
            <Text>{selectedBodyParts}</Text>
          </TouchableOpacity>

          <Modal visible={bodyPartsModal} transparent animationType="slide">
            <TouchableWithoutFeedback onPress={() => setBodyPartsModal(false)}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.modalContent}>
                    <View style={styles.header}>
                      <TouchableOpacity
                        onPress={() => setBodyPartsModal(false)}
                      >
                        <Text style={styles.headerText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                    <Picker
                      selectedValue={bodyParts}
                      onValueChange={(itemValue) => setBodyParts(itemValue)}
                    >
                      <Picker.Item
                        label="選択してください"
                        value=""
                        enabled={false}
                      />
                      {bodyPartOptions.map(({ label, value }) => (
                        <Picker.Item key={value} label={label} value={value} />
                      ))}
                    </Picker>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
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

  // モーダル
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopWidth: 1,
    borderTopColor: "#d5d9da8f",
    backgroundColor: "#d7e0e2ff",
    paddingBottom: theme.spacing[5],
  },
  header: {
    backgroundColor: theme.colors.background.light,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerText: {
    fontSize: 16,
    color: "blue",
    textAlign: "right",
  },
});
