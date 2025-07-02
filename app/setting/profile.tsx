import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import theme from "@/styles/theme";
import Indicator from "@/components/common/Indicator";
import { getActiveLevelExplanation } from "@/constants/activeLevelExplain";
import { apiRequestWithRefresh } from "@/lib/apiClient";
import { UserInfoResponse } from "@/types/api";
import { router, useFocusEffect } from "expo-router";
import { genderOptions } from "@/constants/genderOptions";
import { calcAge } from "@/lib/calcAge";
import NotSetProfile from "@/components/setting/NotSetProfile";
import { Feather } from "@expo/vector-icons";
import { activeOptions } from "@/constants/activeOptions";

export default function ProfileScreen() {
  const [nickname, setNickname] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [birthday, setBirthday] = useState<Date>();
  const [gender, setGender] = useState("");
  const [activeLevel, setActiveLevel] = useState("");
  const [isNotSet, setIsNotSet] = useState<Boolean>();

  const [isLoading, setLoading] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const activeLevelExplanation = getActiveLevelExplanation(activeLevel);

  useFocusEffect(
    useCallback(() => {
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

            if (res.activeLevel != null) {
              setActiveLevel(String(res.activeLevel));
            }

            setIsNotSet(false);
          }
        } catch (e) {
          if (e instanceof Response && e.status === 404) {
            setIsNotSet(true);
          }
        }
      };
      fetchApi();
    }, [])
  );

  const onEdit = () => {
    router.push("/setting/edit/profile");
  };

  if (isLoading) {
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
        <Text style={styles.value}>{calcAge(birthday)} 歳</Text>
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
  },
  label: {
    fontSize: theme.fontSizes.medium,
  },
  value: {
    fontSize: theme.fontSizes.medium,
  },
});
