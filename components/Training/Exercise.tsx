import theme from "@/styles/theme";
import { ExerciseType } from "@/types/training";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type Props = {
  exercise: ExerciseType;
};

export default function Exercise({ exercise }: Props) {
  const { name, sets } = exercise;

  return (
    <View style={styles.exerciseContainer}>
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseName}>{name}</Text>
        <TouchableOpacity>
          <Text style={styles.addButton}>＋</Text>
        </TouchableOpacity>
      </View>
      {sets.map((set, setIndex) => (
        <View key={setIndex} style={styles.setContainer}>
          <Text style={styles.setNumber}>{setIndex + 1}</Text>
          <Text style={styles.setValue}>{set.weight} kg</Text>
          <Text style={styles.setValue}>{set.reps} 回</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  exerciseContainer: {
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exerciseName: {
    fontSize: theme.fontSizes.midium,
  },
  addButton: {
    fontSize: 24,
    color: "#007bff",
  },
  setContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: theme.spacing[2],
  },
  setNumber: {
    fontSize: theme.fontSizes.midium,
    fontWeight: "bold",
  },
  setValue: {
    fontSize: theme.fontSizes.midium,
  },
});
