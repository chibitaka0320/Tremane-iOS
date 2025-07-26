import { View, Text, StyleSheet } from "react-native";
import theme from "@/styles/theme";
import Exercise from "./Exercise";
import { TrainingByDate } from "@/types/training";

type Props = {
  bodyPart: TrainingByDate;
};

export default function TrainingItem({ bodyPart }: Props) {
  const { partsId, name, exercises } = bodyPart;

  return (
    <View style={styles.container}>
      <View style={styles.categoryContainer}>
        <Text style={styles.categoryTitle}>{name}</Text>
      </View>
      {exercises.map((exercise, index) => (
        <Exercise exercise={exercise} key={index} partsId={partsId} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    width: "90%",
    alignSelf: "center",
    backgroundColor: theme.colors.background.light,
    marginBottom: theme.spacing[5],
    overflow: "hidden",
  },
  categoryContainer: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing[2],
  },
  categoryTitle: {
    fontSize: theme.fontSizes.large,
    fontWeight: "bold",
    color: theme.colors.white,
  },
});
