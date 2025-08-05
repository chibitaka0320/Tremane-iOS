import theme from "@/styles/theme";
import { BodypartWithExercise } from "@/types/bodyPart";
import { View, Text, StyleSheet, ScrollView } from "react-native";

type Props = {
  data: BodypartWithExercise;
};

export default function ExerciseScreen({ data }: Props) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {data.exercises.map((exercise) => (
        <View style={styles.itemContainer}>
          <Text style={styles.itemText}>{exercise.name}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light,
    padding: theme.spacing[4],
  },
  itemContainer: {},
  itemText: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.lightGray,
    paddingVertical: theme.spacing[3],
  },
  contentContainer: {
    paddingBottom: theme.spacing[6],
  },
});
