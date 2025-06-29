import EatingRow from "@/components/eating/EatingRow";
import Summary from "@/components/eating/Summary";
import { PFC_LABELS } from "@/constants/pfc";
import { apiRequestWithRefresh } from "@/lib/apiClient";
import theme from "@/styles/theme";
import { EatType } from "@/types/eating";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  FlatList,
  Alert,
} from "react-native";

type Props = {
  selectedDate: string;
};

export default function EatingScreen({ selectedDate }: Props) {
  const [data, setData] = useState<EatType>();
  const [isLoading, setLoading] = useState(false);

  const fetchEatingData = async () => {
    const URL = "/eating?date=" + selectedDate;
    setLoading(true);
    try {
      const data = await apiRequestWithRefresh<EatType>(URL, "GET", null);
      if (data != null) {
        console.log(data);
        setData(data);
      }
    } catch (e) {
      Alert.alert("エラー", "時間をおいて再度ログインしてください");
      return;
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEatingData();
    }, [selectedDate])
  );
  return (
    <ScrollView style={styles.container}>
      <Summary total={data?.total} goal={data?.goal} rate={data?.rate} />
      <View style={styles.eatingContainer}>
        <View style={styles.row}>
          <Text style={styles.eating}>食べ物</Text>
          <Text style={styles.calories}>カロリー</Text>
          {PFC_LABELS.map(({ key, label }) => (
            <Text style={styles.pfc} key={key}>
              {label}
            </Text>
          ))}
        </View>
        <View style={styles.border}></View>
        {data?.meals ? (
          <FlatList
            data={data.meals}
            renderItem={({ item }) => <EatingRow meal={item} />}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.nonDataContainer}>
            <Text style={styles.text}>データがありません</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.main,
    paddingVertical: theme.spacing[5],
  },
  eatingContainer: {
    borderRadius: 8,
    width: "90%",
    alignSelf: "center",
    backgroundColor: theme.colors.background.light,
    marginBottom: theme.spacing[5],
    padding: theme.spacing[3],
  },
  row: {
    flexDirection: "row",
  },
  eating: {
    width: "30%",
    textAlign: "center",
    fontWeight: "bold",
  },
  calories: {
    width: "30%",
    textAlign: "center",
    fontWeight: "bold",
  },
  pfc: {
    width: "13%",
    textAlign: "center",
    fontWeight: "bold",
  },
  border: {
    width: "100%",
    height: 1,
    backgroundColor: theme.colors.black,
    marginVertical: theme.spacing[3],
  },
  nonDataContainer: {
    padding: theme.spacing[5],
    borderRadius: 8,
    backgroundColor: theme.colors.background.light,
    alignItems: "center",
  },
  text: {
    fontSize: theme.fontSizes.large,
    fontWeight: "bold",
  },
});
