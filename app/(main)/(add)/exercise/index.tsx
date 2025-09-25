import theme from "@/styles/theme";
import { BodyPart } from "@/types/dto/bodyPartDto";
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
import * as exerciseService from "@/service/exerciseService";

type Props = {
  data: BodyPart;
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
            await exerciseService.deleteMyExercise(exerciseId);

            setExercises((prev) =>
              prev.filter((e) => e.exerciseId !== exerciseId)
            );
          } catch (error) {
            console.error("食事追加失敗：" + error);
            Alert.alert("食事の追加に失敗しました。");
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
        exercise.myExerciseFlg ? (
          <View style={styles.itemContainer} key={idx}>
            <TouchableOpacity
              style={styles.itemTextContainer}
              onPress={() => {
                onEdit(exercise.exerciseId);
              }}
            >
              <Text style={styles.itemText}>{exercise.exerciseName}</Text>
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
            <Text style={styles.itemText}>{exercise.exerciseName}</Text>
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
