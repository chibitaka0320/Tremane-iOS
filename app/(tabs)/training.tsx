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
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/apiClient";
import { getAccessToken, refreshAccessToken } from "@/lib/token";
import Indicator from "@/components/common/Indicator";
import { MaterialIcons } from "@expo/vector-icons";
import { authErrorHandler } from "@/lib/authErrorHandler";

type Props = {
  selectedDate: string;
};

export default function TrainingScreen({ selectedDate }: Props) {
  const [data, setData] = useState<BodyPartType[]>([]);
  const [isLoading, setLoading] = useState(false);

  const URL = "/training?date=" + selectedDate;

  const fetchTrainingData = async () => {
    setLoading(true);
    try {
      const TOKEN = await getAccessToken();
      if (TOKEN === null) {
        await authErrorHandler();
      } else {
        const data = await apiRequest<BodyPartType[]>(URL, "GET", null, TOKEN);
        if (data != null) {
          setData(data);
        }
      }
    } catch (e) {
      if (e instanceof Response) {
        if (e.status === 403) {
          try {
            // アクセストークン再発行処理
            await refreshAccessToken();

            // データ再取得
            const TOKEN = await getAccessToken();
            if (TOKEN === null) {
              await authErrorHandler();
            } else {
              const data = await apiRequest<BodyPartType[]>(
                URL,
                "GET",
                null,
                TOKEN
              );
              if (data != null) {
                setData(data);
              }
            }
          } catch (e) {
            await authErrorHandler();
          }
        } else {
          Alert.alert("エラー", "時間をおいて再度ログインしてください");
          return;
        }
      } else {
        Alert.alert("エラー", "時間をおいて再度ログインしてください");
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainingData();
  }, [selectedDate]);

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
