import Indicator from "@/components/common/Indicator";
import NotSetGoal from "@/components/setting/NotSetGoal";
import { pfcOptions } from "@/constants/pfcOptions";
import { pfcPlanDetails } from "@/constants/pfcPlanDetails";
import * as userGoalService from "@/service/userGoalService";
import theme from "@/styles/theme";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function GoalScreen() {
  const [weight, setWeight] = useState("");
  const [goalWeight, setGoalWeight] = useState("");
  const [goalCalorie, setGoalCalorie] = useState("");
  const [start, setStart] = useState<Date>();
  const [finish, setFinish] = useState<Date>();
  const [pfc, setPfc] = useState("");
  const [isNotSet, setIsNotSet] = useState<boolean>();

  const [isLoading, setLoading] = useState(false);

  const pfcLabel = pfcOptions.find((option) => option.value === pfc)?.label;
  const pfcCompactRatio = pfcPlanDetails[pfc]?.compactRatio;

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      const fetchApi = async () => {
        try {
          const res = await userGoalService.getUserGoal();
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
          } else {
            setIsNotSet(true);
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
    router.push("/(main)/(menu)/goal/edit");
  };

  if (isLoading && isNotSet == null) {
    return <Indicator />;
  }

  if (isNotSet) {
    return <NotSetGoal />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="flag" size={16} color={theme.colors.primary} />
          <Text style={styles.headerTitle}>目標</Text>
        </View>
        <TouchableOpacity onPress={onEdit}>
          <Ionicons name="create-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <Row label="目標体重" value={`${weight} kg → ${goalWeight} kg`} />
      <Row label="開始日" value={start ? format(start, "yyyy/MM/dd") : ""} />
      <Row label="終了日" value={finish ? format(finish, "yyyy/MM/dd") : ""} />
      <Row
        label="PFCバランス"
        value={
          pfcLabel && pfcCompactRatio
            ? `${pfcLabel}（${pfcCompactRatio}）`
            : ""
        }
      />

      <View style={styles.calorieCard}>
        <View style={styles.calorieHeader}>
          <Ionicons name="flame" size={18} color={theme.colors.primary} />
          <Text style={styles.calorieTitle}>目標摂取カロリー（自動計算）</Text>
        </View>
        <View style={styles.calorieRow}>
          <Text style={styles.calorieLabel}>1日の摂取カロリー目安</Text>
          <Text style={styles.calorieValue}>
            {goalCalorie && goalCalorie !== "0"
              ? Number(goalCalorie).toLocaleString()
              : "-"}
            <Text style={styles.calorieUnit}>  kcal</Text>
          </Text>
        </View>
        <Text style={styles.calorieCaption}>
          ※ 目標体重・期間・PFCバランスから自動で計算されます
        </Text>
      </View>
    </View>
  );
}

type RowProps = {
  label: string;
  value: string;
};

function Row({ label, value }: RowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.light,
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[6],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: theme.spacing[3],
    marginBottom: theme.spacing[2],
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
  },
  headerTitle: {
    fontSize: theme.fontSizes.medium,
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  rowLabel: {
    color: theme.colors.font.black,
  },
  rowValue: {
    color: theme.colors.font.gray,
  },
  calorieCard: {
    backgroundColor: theme.colors.background.lightGray,
    borderRadius: 8,
    marginHorizontal: theme.spacing[4],
    marginTop: theme.spacing[5],
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[3],
  },
  calorieHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing[2],
    marginBottom: theme.spacing[3],
  },
  calorieTitle: {
    fontWeight: "500",
    color: theme.colors.font.black,
  },
  calorieRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: theme.spacing[2],
  },
  calorieLabel: {
    color: theme.colors.font.black,
  },
  calorieValue: {
    fontSize: 22,
    fontWeight: "700",
  },
  calorieUnit: {
    fontSize: theme.fontSizes.small,
    fontWeight: "400",
    color: theme.colors.font.gray,
  },
  calorieCaption: {
    fontSize: theme.fontSizes.small,
    color: theme.colors.font.gray,
    marginTop: theme.spacing[2],
  },
});
