import theme from "@/styles/theme";
import { ExerciseType } from "@/types/training";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";

type Props = {
  partsId: number;
  exercise: ExerciseType;
};

export default function Exercise({ partsId, exercise }: Props) {
  const { exerciseId, name, sets } = exercise;

  const onTraining = (trainingId: number) => {
    router.push({
      pathname: "/edit/training",
      params: { trainingId },
    });
  };

  const onPlus = () => {
    router.push({
      pathname: "/add/trainingWithExercise",
      params: { partsId, exerciseId },
    });
  };

  return (
    <View style={styles.exerciseContainer}>
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseName}>{name}</Text>
        <TouchableOpacity>
          <AntDesign
            name="pluscircleo"
            color="black"
            style={styles.addButton}
            onPress={onPlus}
          />
        </TouchableOpacity>
      </View>
      {sets.map((set, setIndex) => (
        <TouchableOpacity
          key={setIndex}
          style={styles.setContainer}
          onPress={() => onTraining(set.trainingId)}
        >
          <Text style={styles.setNumber}>{setIndex + 1}</Text>
          <Text style={styles.setValue}>{set.weight} kg</Text>
          <Text style={styles.setValue}>{set.reps} 回</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  exerciseContainer: {
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
    paddingTop: theme.spacing[1],
    paddingBottom: theme.spacing[2],
    marginBottom: theme.spacing[2],
  },
  exerciseName: {
    fontSize: theme.fontSizes.medium,
  },
  addButton: {
    marginRight: theme.spacing[2],
    fontSize: theme.fontSizes.large,
  },
  setContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[5],
  },
  setNumber: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
  },
  setValue: {
    fontSize: theme.fontSizes.medium,
  },
});
