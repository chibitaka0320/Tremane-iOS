import theme from "@/styles/theme";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Exercise } from "@/types/dto/trainingDto";

type Props = {
  partsId: number;
  partName: string;
  date: string;
  exercise: Exercise;
};

export default function ExerciseItem({
  partsId,
  partName,
  date,
  exercise,
}: Props) {
  const { exerciseId, name, trainings } = exercise;

  const onPress = () => {
    router.push({
      pathname: "/(main)/(edit)/training/detail",
      params: {
        date,
        partsId: String(partsId),
        partName,
        exerciseId,
        exerciseName: name,
      },
    });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
        {name}
      </Text>
      <View style={styles.right}>
        <Text style={styles.setCount}>{trainings.length}セット</Text>
        <Ionicons
          name="chevron-forward"
          size={18}
          color={theme.colors.font.gray}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing[1],
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.lightGray,
    marginBottom: theme.spacing[1],
  },
  name: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.dark,
    marginRight: theme.spacing[2],
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[1],
  },
  setCount: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
  },
});
