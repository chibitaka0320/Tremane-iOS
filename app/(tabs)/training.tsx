import { View, Text, StyleSheet, FlatList } from "react-native";
import TrainingItem from "@/components/training/TrainingItem";
import theme from "@/styles/theme";
import { BodyPartType } from "@/types/training";

type Props = {
  selectedDate: string;
};

const data: BodyPartType[] = [
  {
    name: "胸",
    exercises: [
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
    ],
  },
  {
    name: "背中",
    exercises: [
      {
        name: "チンニング",
        sets: [
          { weight: 0, reps: 6 },
          { weight: 10, reps: 5 },
        ],
      },
    ],
  },
];

export default function TrainingScreen({ selectedDate }: Props) {
  return (
    <View style={styles.container}>
      {data.length == 0 ? (
        <View>
          <Text>データなし</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={({ item }) => <TrainingItem bodyPart={item} />}
          showsVerticalScrollIndicator={false}
          style={styles.trainingItem}
          ListFooterComponent={<View style={styles.trainingItemFooter}></View>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.main,
  },
  trainingItem: {
    paddingVertical: theme.spacing[4],
  },
  trainingItemFooter: {
    height: theme.spacing[6],
  },
});
