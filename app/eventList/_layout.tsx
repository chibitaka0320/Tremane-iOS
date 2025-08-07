import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import ExerciseScreen from "./exercise";
import { useCallback, useEffect, useState } from "react";
import { getBodyPartsWithExercises } from "@/localDb/service/bodyPartService";
import { BodypartWithExercise } from "@/types/bodyPart";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { CircleButton } from "@/components/common/CircleButton";
import { Entypo } from "@expo/vector-icons";
import theme from "@/styles/theme";
import { router, useFocusEffect } from "expo-router";

const Tab = createMaterialTopTabNavigator();

export default function Layout() {
  const [dataList, setDataList] = useState<BodypartWithExercise[] | null>(null);

  const onPlusButton = () => {
    router.push("/add/exercise");
  };

  const fetchData = async () => {
    const res = await getBodyPartsWithExercises();
    setDataList(res ?? []);
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  // useEffect(() => {
  //   fetchData();
  // }, []);

  // ローディング中はダミーのスクリーンを返す
  if (!dataList) {
    return (
      <Tab.Navigator>
        <Tab.Screen name="Loading">
          {() => (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="large" />
            </View>
          )}
        </Tab.Screen>
      </Tab.Navigator>
    );
  }

  // データが空なら1つだけダミータブを返す
  if (dataList.length === 0) {
    return (
      <>
        <Tab.Navigator>
          <Tab.Screen name="No Data">
            {() => (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <ActivityIndicator size="small" />
              </View>
            )}
          </Tab.Screen>
        </Tab.Navigator>
        <CircleButton onPress={onPlusButton} style={styles.button}>
          <Entypo name="plus" size={40} color={theme.colors.white} />
        </CircleButton>
      </>
    );
  }

  // データがある場合はタブを動的に生成
  return (
    <>
      <Tab.Navigator>
        {dataList.map((data) => (
          <Tab.Screen key={data.name} name={data.name}>
            {() => <ExerciseScreen data={data} />}
          </Tab.Screen>
        ))}
      </Tab.Navigator>
      <CircleButton onPress={onPlusButton} style={styles.button}>
        <Entypo name="plus" size={40} color={theme.colors.white} />
      </CircleButton>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    right: 40,
    bottom: 60,
  },
});
