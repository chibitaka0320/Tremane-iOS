import { View, Text, StyleSheet } from "react-native";
import theme from "@/styles/theme";
import ExerciseItem from "./ExerciseItem";
import { partsColors } from "@/styles/partsColor";
import { BodyPart } from "@/types/dto/trainingDto";

type Props = {
  bodyPart: BodyPart;
};

export default function TrainingItem({ bodyPart }: Props) {
  const { bodyPartId, name, exercises } = bodyPart;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.categoryContainer,
          { backgroundColor: partsColors[bodyPartId] },
        ]}
      >
        <Text style={styles.categoryTitle}>{name}</Text>
      </View>
      {exercises.map((exercise, index) => (
        <ExerciseItem exercise={exercise} key={index} partsId={bodyPartId} />
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
