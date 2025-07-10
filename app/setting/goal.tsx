import React, { useCallback, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import theme from "@/styles/theme";
import Indicator from "@/components/common/Indicator";
import { apiRequestWithRefresh } from "@/lib/apiClient";
import { UserGoalResponse } from "@/types/api";
import { router, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import NotSetGoal from "@/components/setting/NotSetGoal";
import { getPfcBalanceExplanation } from "@/constants/pfcBalanceExplain";

export default function GoalScreen() {
  const [weight, setWeight] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [goalCalorie, setGoalCalorie] = useState("");
  const [start, setStart] = useState<Date>();
  const [finish, setFinish] = useState<Date>();
  const [pfc, setPfc] = useState("");
  const [isNotSet, setIsNotSet] = useState<Boolean>();

  const [isLoading, setLoading] = useState(false);

  const pfcBalanceExplain = getPfcBalanceExplanation(pfc);

  useFocusEffect(
    useCallback(() => {
      const fetchApi = async () => {
        setLoading(true);
        const URL = "/users/goal";
        try {
          const res = await apiRequestWithRefresh<UserGoalResponse>(URL, "GET");
          if (res) {
            if (res.weight != null) {
              setWeight(String(res.weight));
            }

            if (res.goalWeight != null) {
              setGoalWeight(String(res.goalWeight));
            }

            if (res.goalCalorie != null) {
              setGoalCalorie(String(res.goalCalorie));
            }

            if (res.start != null) {
              setStart(new Date(res.start));
            }

            if (res.finish != null) {
              setFinish(new Date(res.finish));
            }

            if (res.pfc != null) {
              setPfc(String(res.pfc));
            }
            setIsNotSet(false);
          }
        } catch (e) {
          if (e instanceof Response && e.status === 404) {
            setIsNotSet(true);
          }
        } finally {
          setLoading(false);
        }
      };
      fetchApi();
    }, [])
  );

  const onEdit = () => {
    router.push("/setting/edit/goal");
  };

  if (isLoading && isNotSet == null) {
    return <Indicator />;
  }

  if (isNotSet) {
    return <NotSetGoal />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <Text style={styles.title}>目標設定</Text>
        <TouchableOpacity onPress={onEdit}>
          <Feather name="edit" size={24} />
        </TouchableOpacity>
      </View>
      <View style={styles.item}>
        <Text style={styles.label}>目標体重</Text>
        <View style={styles.weight}>
          <Text style={styles.value}>{weight}</Text>
          <Text style={styles.value}> → </Text>
          <Text style={styles.value}>{goalWeight} kg</Text>
        </View>
      </View>
      <View style={styles.item}>
        <Text style={styles.label}>目標摂取カロリー</Text>
        <Text style={styles.value}>{goalCalorie} kcal</Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.label}>開始日</Text>
        <Text style={styles.value}>
          {start ? start.toLocaleDateString() : ""}
        </Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.label}>終了</Text>
        <Text style={styles.value}>
          {finish ? finish.toLocaleDateString() : ""}
        </Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.label}>活動レベル</Text>
        <Text style={styles.value}>{pfcBalanceExplain}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background.light,
    flex: 1,
    padding: theme.spacing[5],
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    margin: theme.spacing[3],
  },
  title: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  label: {
    fontSize: theme.fontSizes.medium,
  },
  value: {
    fontSize: theme.fontSizes.medium,
    color: theme.colors.font.gray,
  },
  weight: {
    flexDirection: "row",
    alignItems: "center",
  },
});
