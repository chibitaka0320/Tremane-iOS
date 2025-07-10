import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
} from "react-native";
import TrainingItem from "@/components/training/TrainingItem";
import theme from "@/styles/theme";
import { BodyPartType } from "@/types/training";
import { useCallback, useEffect, useState } from "react";
import { apiRequestWithRefresh } from "@/lib/apiClient";
import Indicator from "@/components/common/Indicator";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";

type Props = {
  selectedDate: string;
};

export default function TrainingScreen({ selectedDate }: Props) {
  const [data, setData] = useState<BodyPartType[]>([]);
  const [isLoading, setLoading] = useState(false);

  const URL = "/training?date=" + selectedDate;

  const fetchTrainingData = async () => {
    try {
      const data = await apiRequestWithRefresh<BodyPartType[]>(
        URL,
        "GET",
        null
      );
      if (data != null) {
        setData(data);
      }
    } catch (e) {
      Alert.alert("エラー", "時間をおいて再度ログインしてください");
      return;
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTrainingData();
    }, [selectedDate])
  );

  if (isLoading) {
    return <Indicator />;
  }

  return (
    <View style={styles.container}>
      {data.length == 0 ? (
        <TouchableOpacity style={styles.nonDataContainer}>
          <MaterialIcons name="note-add" size={60} color="#ccc" />
          <Text style={styles.text}>データがありません</Text>
          <Text style={styles.subText}>トレーニングを追加しましょう</Text>
        </TouchableOpacity>
      ) : (
        <FlatList
          data={data}
          style={styles.trainingContainer}
          renderItem={({ item }) => <TrainingItem bodyPart={item} />}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.name}
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
  nonDataContainer: {
    padding: theme.spacing[5],
    borderRadius: 8,
    width: "90%",
    alignSelf: "center",
    backgroundColor: theme.colors.background.light,
    alignItems: "center",
    marginVertical: theme.spacing[5],
  },
  trainingContainer: {
    paddingVertical: theme.spacing[5],
  },
  text: {
    fontSize: theme.fontSizes.large,
    fontWeight: "bold",
    marginVertical: theme.spacing[2],
  },
  subText: {
    fontSize: theme.fontSizes.medium,
  },
  trainingItemFooter: {
    height: theme.spacing[7],
  },
});
