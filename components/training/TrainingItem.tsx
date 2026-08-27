import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import theme from "@/styles/theme";
import ExerciseItem from "./ExerciseItem";
import { bodyPartImages } from "@/constants/bodyPartImages";
import { BodyPart } from "@/types/dto/trainingDto";

type Props = {
  bodyPart: BodyPart;
  date: string;
};

export default function TrainingItem({ bodyPart, date }: Props) {
  const { bodyPartId, name, exercises } = bodyPart;
  const [isExpanded, setExpanded] = useState(true);

  const totalSets = exercises.reduce(
    (sum, exercise) => sum + exercise.trainings.length,
    0
  );

  const onAddExercise = () => {
    router.push({
      pathname: "/(main)/(add)/training/add",
      params: { date, partsId: String(bodyPartId) },
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        activeOpacity={0.7}
        onPress={() => setExpanded((prev) => !prev)}
      >
        <View style={styles.headerLeft}>
          <Image
            source={bodyPartImages[bodyPartId]}
            style={styles.iconImage}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.summary}>
              {exercises.length}種目・{totalSets}セット
            </Text>
          </View>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={theme.colors.font.gray}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.body}>
          {exercises.map((exercise) => (
            <ExerciseItem
              exercise={exercise}
              key={exercise.exerciseId}
              partsId={bodyPartId}
              partName={name}
              date={date}
            />
          ))}
          <TouchableOpacity
            style={styles.addExerciseButton}
            onPress={onAddExercise}
          >
            <Ionicons name="add" size={16} color={theme.colors.secondary} />
            <Text style={styles.addExerciseText}>種目を追加</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    width: "90%",
    alignSelf: "center",
    backgroundColor: theme.colors.background.light,
    marginBottom: theme.spacing[3],
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
  },
  iconImage: {
    width: 56,
    height: 56,
  },
  name: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
    color: theme.colors.dark,
  },
  summary: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
    marginTop: theme.spacing[1],
  },
  body: {
    paddingHorizontal: theme.spacing[3],
    paddingBottom: theme.spacing[1],
  },
  addExerciseButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing[1],
    paddingVertical: theme.spacing[3],
  },
  addExerciseText: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.secondary,
    fontWeight: "bold",
  },
});
