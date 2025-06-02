import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import TrainingItem from "@/components/Training/TrainingItem";
import theme from "@/config/theme";

type Props = {
  selectedDate: string;
};

const data = [1, 2, 3];

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
          renderItem={() => <TrainingItem />}
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
    paddingVertical: theme.spacing[3],
  },
  trainingItemFooter: {
    height: theme.spacing[6],
  },
});
