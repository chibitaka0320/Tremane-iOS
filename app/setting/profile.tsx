import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import theme from "@/styles/theme";
import Indicator from "@/components/common/Indicator";
import { getActiveLevelExplanation } from "@/constants/activeLevelExplain";
import { apiRequestWithRefresh } from "@/lib/apiClient";
import { UserInfoResponse } from "@/types/api";
import { router, useFocusEffect } from "expo-router";
import { genderOptions } from "@/constants/genderOptions";
import NotSetProfile from "@/components/setting/NotSetProfile";
import { Feather } from "@expo/vector-icons";
import { activeOptions } from "@/constants/activeOptions";

export default function ProfileScreen() {
  const [nickname, setNickname] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [birthday, setBirthday] = useState<Date>();
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [activeLevel, setActiveLevel] = useState("");
  const [bmr, setBmr] = useState("");
  const [totalCalorie, setTotalCalorie] = useState("");
  const [isNotSet, setIsNotSet] = useState<Boolean>();

  const [isLoading, setLoading] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const activeLevelExplanation = getActiveLevelExplanation(activeLevel);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      const fetchApi = async () => {
        const URL = "/users/profile";
        try {
          const res = await apiRequestWithRefresh<UserInfoResponse>(URL, "GET");
          if (res) {
            setNickname(res.nickname);
            if (res.height != null) {
              setHeight(String(res.height));
            }
            if (res.weight != null) {
              setWeight(String(res.weight));
            }

            if (res.birthday != null) {
              setBirthday(new Date(res.birthday));
            }

            if (res.gender != null) {
              setGender(String(res.gender));
            }

            if (res.age != null) {
              setAge(String(res.age));
            }

            if (res.activeLevel != null) {
              setActiveLevel(String(res.activeLevel));
            }

            if (res.bmr != null) {
              setBmr(String(res.bmr));
            }

            if (res.totalCalorie != null) {
              setTotalCalorie(String(res.totalCalorie));
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
    router.push("/setting/edit/profile");
  };

  if (isLoading && isNotSet == null) {
    return <Indicator />;
  }

  if (isNotSet) {
    return <NotSetProfile />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.item}>
        <Text style={styles.title}>プロフィール設定</Text>
        <TouchableOpacity onPress={onEdit}>
          <Feather name="edit" size={24} />
        </TouchableOpacity>
      </View>
      <View style={styles.item}>
        <Text style={styles.label}>ニックネーム</Text>
        <Text style={styles.value}>{nickname}</Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.label}>身長</Text>
        <Text style={styles.value}>{height} cm</Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.label}>体重</Text>
        <Text style={styles.value}>{weight} kg</Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.label}>年齢</Text>
        <Text style={styles.value}>{age} 歳</Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.label}>性別</Text>
        <Text style={styles.value}>
          {genderOptions.find((g) => g.value === gender)?.label ?? ""}
        </Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.label}>活動レベル</Text>
        <Text style={styles.value}>
          {activeOptions.find((active) => active.value === activeLevel)
            ?.label ?? ""}
        </Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.label}>基礎代謝</Text>
        <Text style={styles.value}>{bmr} kcal</Text>
      </View>
      <View style={styles.item}>
        <Text style={styles.label}>総消費カロリー</Text>
        <Text style={styles.value}>{totalCalorie} kcal</Text>
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
});
