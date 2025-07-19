import Indicator from "@/components/common/Indicator";
import EatingRow from "@/components/eating/EatingRow";
import Summary from "@/components/eating/Summary";
import { PFC_LABELS } from "@/constants/pfc";
import { useAlert } from "@/context/AlertContext";
import { apiRequestWithRefresh } from "@/lib/apiClient";
import theme from "@/styles/theme";
import { EatType } from "@/types/eating";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
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
  const { setError } = useAlert();

  const [data, setData] = useState<EatType>();
  const [isLoading, setLoading] = useState(false);

  const [isFetching, setFetching] = useState(false);
  const [isRefreshing, setRefreshing] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchEatingData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setFetching(true);
    }

    const URL = "/eating?date=" + selectedDate;

    try {
      const data = await apiRequestWithRefresh<EatType>(URL, "GET", null);
      if (data != null) {
        setData(data);
      }
    } catch (e) {
      setError("時間をおいて再度アプリを起動してください", () => {
        router.replace("/auth/signIn");
      });
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setFetching(false);
      }
    }
  };

  useEffect(() => {
    fetchEatingData(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchEatingData(true);
    }, [selectedDate])
  );

  if (isFetching) {
    return <Indicator />;
  }

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
        {data?.meals && data.meals.length > 0 ? (
          <FlatList
            data={data.meals}
            renderItem={({ item }) => <EatingRow meal={item} />}
            scrollEnabled={false}
            refreshing={isRefreshing}
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
