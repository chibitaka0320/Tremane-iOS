import { apiRequestWithRefresh } from "@/lib/apiClient";
import {
  deleteMyExerciseDao,
  setMyExercisesSynced,
} from "@/localDb/dao/myExerciseDao";
import theme from "@/styles/theme";
import { BodypartWithExercise } from "@/types/bodyPart";
import { AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";

type Props = {
  data: BodypartWithExercise;
};

export default function ExerciseScreen({ data }: Props) {
  const [exercises, setExercises] = useState(data.exercises);

  useEffect(() => {
    setExercises(data.exercises);
  }, [data.exercises]);

  const onDelete = async (exerciseId: string) => {
    Alert.alert("", "種目を削除しますか？", [
      { text: "キャンセル", style: "cancel" },
      {
        text: "削除する",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMyExerciseDao(exerciseId);

            setExercises((prev) =>
              prev.filter((e) => e.exerciseId !== exerciseId)
            );
          } catch (e) {
            console.error(e);
          }

          try {
            const res = await apiRequestWithRefresh(
              "/exercise/myself/" + exerciseId,
              "DELETE",
              null
            );
            if (res?.ok) {
              await setMyExercisesSynced([exerciseId]);
            }
          } catch (e) {
            console.error(e);
          }
        },
      },
    ]);
  };

  const onEdit = (exerciseId: string) => {
    router.push({
      pathname: "/(main)/(edit)/exercise/edit",
      params: { exerciseId },
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {exercises.map((exercise, idx) =>
        exercise.myFlg ? (
          <View style={styles.itemContainer} key={idx}>
            <TouchableOpacity
              style={styles.itemTextContainer}
              onPress={() => {
                onEdit(exercise.exerciseId);
              }}
            >
              <Text style={styles.itemText}>{exercise.name}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                onDelete(exercise.exerciseId);
              }}
            >
              <AntDesign name="delete" size={20} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.itemContainer} key={idx}>
            <Text style={styles.itemText}>{exercise.name}</Text>
          </View>
        )
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light,
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.lightGray,
  },
  itemTextContainer: {
    width: "90%",
  },
  itemText: {
    paddingVertical: theme.spacing[3],
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
  },
  contentContainer: {
    paddingBottom: theme.spacing[6],
  },
});
