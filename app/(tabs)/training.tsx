import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import TrainingItem from "@/components/TrainingItem";
type Props = {
  selectedDate: string;
};

export default function TrainingScreen({ selectedDate }: Props) {
  return (
    <View style={styles.container}>
      <TrainingItem />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
