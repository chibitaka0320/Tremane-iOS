import theme from "@/styles/theme";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { router } from "expo-router";
import { Exercise } from "@/types/dto/trainingDto";

type Props = {
  partsId: number;
  exercise: Exercise;
};

export default function ExerciseItem({ partsId, exercise }: Props) {
  const { exerciseId, name, trainings } = exercise;

  const onTraining = (trainingId: string) => {
    router.push({
      pathname: "/(main)/(edit)/training/edit",
      params: { trainingId },
    });
  };

  const onPlus = () => {
    router.push({
      pathname: "/(main)/(add)/training/addExercise",
      params: { partsId, exerciseId },
    });
  };

  return (
    <View style={styles.exerciseContainer}>
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseName}>{name}</Text>
        <TouchableOpacity>
          <AntDesign
            name="plus-circle"
            color="black"
            style={styles.addButton}
            onPress={onPlus}
          />
        </TouchableOpacity>
      </View>
      {trainings.map((training, setIndex) => (
        <TouchableOpacity
          key={setIndex}
          style={styles.setContainer}
          onPress={() => onTraining(training.trainingId)}
        >
          <Text style={styles.setNumber}>{setIndex + 1}</Text>
          <Text style={styles.setValue}>{training.weight} kg</Text>
          <Text style={styles.setValue}>{training.reps} 回</Text>
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
