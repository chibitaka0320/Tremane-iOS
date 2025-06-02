import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

type Exercise = {
  name: string;
  sets: Array<{
    weight: number;
    reps: number;
  }>;
};

export default function TrainingItem() {
  const exercises: Exercise[] = [
    {
      name: "ベンチプレス",
      sets: [
        { weight: 80, reps: 6 },
        { weight: 90, reps: 5 },
      ],
    },
    {
      name: "ダンベルプレス",
      sets: [{ weight: 38, reps: 5 }],
    },
  ];

  return (
    <View>
      <View style={styles.categoryContainer}>
        <Text style={styles.categoryTitle}>胸</Text>
      </View>
      {exercises.map((exercise, index) => (
        <View key={index} style={styles.exerciseContainer}>
          <View style={styles.exerciseHeader}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <TouchableOpacity>
              <Text style={styles.addButton}>+</Text>
            </TouchableOpacity>
          </View>
          {exercise.sets.map((set, setIndex) => (
            <View key={setIndex} style={styles.setContainer}>
              <Text style={styles.setNumber}>{setIndex + 1}</Text>
              <Text style={styles.setValue}>{set.weight} kg</Text>
              <Text style={styles.setValue}>{set.reps} 回</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  categoryContainer: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 5,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  exerciseContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  addButton: {
    fontSize: 24,
    color: "#007bff",
  },
  setContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 5,
  },
  setNumber: {
    fontSize: 14,
    fontWeight: "bold",
  },
  setValue: {
    fontSize: 14,
  },
});
