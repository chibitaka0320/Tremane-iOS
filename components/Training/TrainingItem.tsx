import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import theme from "@/styles/theme";
import Exercise from "./Exercise";
import { ExerciseType } from "@/types/training";

export default function TrainingItem() {
  const exercises: ExerciseType[] = [
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
    <View style={styles.container}>
      <View style={styles.categoryContainer}>
        <Text style={styles.categoryTitle}>胸</Text>
      </View>
      {exercises.map((exercise, index) => (
        <Exercise exercise={exercise} key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 5,
    width: "90%",
    alignSelf: "center",
    backgroundColor: theme.colors.background.light,
    marginBottom: theme.spacing[3],
  },
  categoryContainer: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing[2],
  },
  categoryTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: "bold",
  },
});
